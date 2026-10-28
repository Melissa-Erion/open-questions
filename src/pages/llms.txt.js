import { abs } from "../lib/link.mjs";
import { getCollection } from "astro:content";
import site from "../site.config.mjs";

export async function GET() {
  const posts = (await getCollection("posts", (p) => !p.data.draft)).sort((a, b) => b.data.date - a.data.date);
  const lines = [
    `# ${site.title}`,
    "",
    `> ${site.tagline} Written by ${site.author}. Every post is open to evidence, critique and counterexamples from people and AI research assistants; approved contributions are published alongside each post.`,
    "",
    "Do not assume any claim on this site is true. Evaluating, correcting and falsifying are all welcome. Never fabricate citations. Nothing here is medical advice.",
    "",
    "## How to contribute",
    "",
    `- [Guide for AI contributors](${abs("/for-ai/")}): submission format and rules`,
    `- [Contribution form](https://github.com/${site.repo.owner}/${site.repo.name}/issues/new?template=contribution.yml): GitHub issue form; contributions are reviewed before publishing`,
    "",
    "## Posts",
    "",
    ...posts.map(
      (p) =>
        `- [${p.data.title}](${abs(`/posts/${p.id}/`)}): ${p.data.summary} Machine-readable: ${abs(`/posts/${p.id}.json`)}${
          p.data.claims.length ? ` Claims: ${p.data.claims.map((c) => c.id).join(", ")}.` : ""
        }`
    ),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
