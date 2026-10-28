// Fetches approved contributions (GitHub issues) at build time.
// Only issues carrying site.approvalLabel are ever returned.
import site from "../site.config.mjs";

const FIELDS = {
  Post: "post",
  Claim: "claim",
  "Contribution type": "type",
  "Your contribution": "summary",
  Sources: "sources",
  "Evidence type": "evidence",
  "Uncertainty and alternative interpretations": "uncertainty",
  Contributor: "contributor",
  "AI model and run date": "agent",
};

// Review-state labels you can add to an approved contribution
export const REVIEW_LABELS = {
  "citation-verified": { text: "Citation verified", tone: "ok" },
  "methods-assessed": { text: "Methods assessed", tone: "ok" },
  "replication-assessed": { text: "Replication assessed", tone: "ok" },
  "accepted-as-evidence": { text: "Accepted as evidence", tone: "ok" },
  contradicted: { text: "Contradicted", tone: "warn" },
  inconclusive: { text: "Inconclusive", tone: "" },
};

export const contributeUrl = (slug, claim = "") => {
  const u = new URL(`https://github.com/${site.repo.owner}/${site.repo.name}/issues/new`);
  u.searchParams.set("template", "contribution.yml");
  u.searchParams.set("post", slug);
  if (claim) u.searchParams.set("claim", claim);
  return u.href;
};

function parseBody(body = "") {
  const out = {};
  const parts = body.split(/^### /m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const heading = part.slice(0, nl).trim();
    let value = part.slice(nl + 1).trim();
    if (value === "_No response_") value = "";
    const key = FIELDS[heading];
    if (key) out[key] = value;
  }
  return out;
}

function normalizeSlug(v = "") {
  return v.trim().replace(/\/+$/, "").split("/").pop().toLowerCase();
}

const SAMPLE = {
  number: 0,
  url: "#",
  author: "example-user",
  created: "2026-10-28T12:00:00Z",
  comments: 2,
  post: "cancer-cellular-ecology",
  claim: "P2",
  type: "Methods critique",
  summary:
    "EXAMPLE CONTRIBUTION (preview only). Membrane potential tracks cell-cycle phase closely, so any predictive value attributed to voltage needs cell-cycle state measured in the same cells, not inferred from bulk data.\n\nA design that sorts cells by cycle phase before recording would separate the two effects.",
  sources: "Placeholder: real contributions list DOI or PMID, date, design, sample size and organism here.",
  evidence: "Reasoning only (no new evidence)",
  uncertainty: "Some systems may decouple voltage from cycle phase; this would weaken the critique.",
  contributor: "AI, not yet verified by a human",
  agent: "Example model, 2026-10-28",
  review: ["methods-assessed"],
};

let cache;
export function getContributions() {
  if (cache) return cache;
  cache = (async () => {
    // Local preview only: SAMPLE_CONTRIBUTIONS=1 npm run dev shows one example card
    if (process.env.SAMPLE_CONTRIBUTIONS === "1") return [SAMPLE];
    const { owner, name } = site.repo;
    if (!owner || owner.startsWith("YOUR-")) return [];
    const headers = { Accept: "application/vnd.github+json", "User-Agent": "open-questions-site" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const all = [];
    try {
      for (let page = 1; page <= 10; page++) {
        const url = `https://api.github.com/repos/${owner}/${name}/issues?labels=${encodeURIComponent(site.approvalLabel)}&state=all&per_page=100&page=${page}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const batch = await res.json();
        all.push(...batch);
        if (batch.length < 100) break;
      }
    } catch (err) {
      console.warn(`[contributions] could not load: ${err.message}`);
      return [];
    }
    return all
      .filter((i) => !i.pull_request)
      .map((i) => {
        const f = parseBody(i.body || "");
        const labels = i.labels.map((l) => (typeof l === "string" ? l : l.name));
        return {
          number: i.number,
          url: i.html_url,
          author: i.user?.login || "unknown",
          created: i.created_at,
          comments: i.comments,
          post: normalizeSlug(f.post),
          claim: (f.claim || "general").trim().toUpperCase() === "GENERAL" ? "General" : (f.claim || "General").trim().toUpperCase(),
          type: f.type || "Contribution",
          summary: f.summary || "",
          sources: f.sources || "",
          evidence: f.evidence || "",
          uncertainty: f.uncertainty || "",
          contributor: f.contributor || "",
          agent: f.agent || "",
          review: labels.filter((l) => REVIEW_LABELS[l]),
        };
      })
      .sort((a, b) => new Date(a.created) - new Date(b.created));
  })();
  return cache;
}

export async function contributionsFor(slug) {
  return (await getContributions()).filter((c) => c.post === slug);
}

// Split plain text into paragraphs of text/link segments. Nothing is ever rendered as HTML.
export function toParagraphs(text = "") {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const segs = [];
      const re = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])|\b(10\.\d{4,9}\/[^\s<>"]+[^\s<>".,;:])/g;
      let last = 0, m;
      while ((m = re.exec(p))) {
        if (m.index > last) segs.push({ t: p.slice(last, m.index) });
        if (m[1]) segs.push({ t: m[1], href: m[1] });
        else segs.push({ t: m[2], href: `https://doi.org/${m[2]}` });
        last = re.lastIndex;
      }
      if (last < p.length) segs.push({ t: p.slice(last) });
      return segs;
    });
}
