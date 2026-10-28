import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import site from "./src/site.config.mjs";

export default defineConfig({
  site: site.url,
  base: site.base || undefined,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: "github-dark-dimmed" },
  },
});
