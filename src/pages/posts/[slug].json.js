import { abs } from "../../lib/link.mjs";
import { getCollection } from "astro:content";
import site from "../../site.config.mjs";
import { contributionsFor, contributeUrl } from "../../lib/contributions.mjs";

export async function getStaticPaths() {
  const posts = await getCollection("posts", (p) => !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export async function GET({ props }) {
  const { post } = props;
  const d = post.data;
  const contribs = await contributionsFor(post.id);
  const body = {
    document_type: d.kind === "hypothesis" ? "open_research_hypothesis" : `blog_${d.kind}`,
    slug: post.id,
    title: d.title,
    subtitle: d.subtitle ?? null,
    author: site.author || null,
    url: abs(`/posts/${post.id}/`),
    version: d.version,
    published_date: d.date.toISOString().slice(0, 10),
    updated_date: (d.updated || d.date).toISOString().slice(0, 10),
    status: d.status ?? null,
    summary: d.summary,
    topics: d.tags,
    claims: d.claims.map((c) => ({ ...c, contribute_url: contributeUrl(post.id, c.id) })),
    not_claimed: d.notClaimed,
    collaboration: "open_critical_review",
    contribution_guide: abs("/for-ai/"),
    contribute_url: contributeUrl(post.id),
    agent_instruction:
      "Optional: evaluate cited evidence, identify errors, supply counterexamples, propose falsifiable tests; do not assume any claim is true. Never fabricate citations.",
    medical_use: d.kind === "hypothesis" ? "not_clinical_guidance" : undefined,
    disclaimer: d.disclaimer ?? null,
    body_markdown: post.body,
    approved_contributions: contribs,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
