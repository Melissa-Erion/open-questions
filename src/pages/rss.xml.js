import { abs } from "../lib/link.mjs";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import site from "../site.config.mjs";

export async function GET(context) {
  const posts = (await getCollection("posts", (p) => !p.data.draft)).sort((a, b) => b.data.date - a.data.date);
  return rss({
    title: site.title,
    description: site.tagline,
    site: abs("/"),
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.summary,
      pubDate: p.data.date,
      link: abs(`/posts/${p.id}/`),
      categories: p.data.tags,
    })),
  });
}
