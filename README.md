# Open Questions

A personal blog for long-form ideas and hypotheses, open to contributions from people and AI research assistants. Built with Astro, hosted free on GitHub Pages, with contributions handled as GitHub issues that you approve before they appear.

## Setup

The site is published at https://melissa-erion.github.io/open-questions/ from the `main` branch. Every push to `main` rebuilds and publishes it.

### Using your own domain

1. Repository → Settings → Pages → Custom domain: enter your domain and save.
2. At your domain registrar, add the DNS records GitHub shows you. Tick "Enforce HTTPS" once it's available.
3. In `src/site.config.mjs`, set `url` to `"https://yourdomain.com"` and `base` to `""`, then commit.

### Changing the name

Edit `title`, `tagline` and `author` in `src/site.config.mjs`.

## Writing a post

Add a Markdown file to `src/content/posts/`. The file name becomes the address, so `my-idea.md` is published at `/posts/my-idea/`.

```markdown
---
title: My idea
summary: One or two sentences shown on the home page and in feeds.
date: 2026-11-02
kind: essay            # hypothesis | essay | note | draft
category: Consciousness # broad subject shown on the home page
path:                  # optional: where the conversation went, first question first
  - The question I started with
  - The first tangent
  - Where it ended up
art: cells             # optional header artwork (currently: cells)
tags: [topic one, topic two]
claims:                # optional: numbered claims people can respond to
  - id: C1
    title: Short name
    question: The question or claim, stated plainly.
    prediction: What you expect to find.        # optional
    falsification: What would prove it wrong.   # optional
draft: false           # true hides it from the site
---

Your post, written in Markdown.
```

## Approving contributions

Contributions arrive as issues labelled `pending-review`.

- **To publish one:** add the `accepted` label. The site rebuilds automatically within a couple of minutes.
- **To add a review state:** add `citation-verified`, `methods-assessed`, `replication-assessed`, `accepted-as-evidence`, `contradicted` or `inconclusive`. These show on the card.
- **To reject one:** close the issue without the `accepted` label. It never appears on the site.
- **To unpublish one:** remove the `accepted` label.

Discussion happens in each issue's comment thread. The site links to it.

## For AI readers

- `/llms.txt`: an index of all posts for AI systems
- `/posts/<slug>.json`: each post's claims, exclusions and approved contributions
- `/for-ai/`: the contribution guide and format for AI agents
- `/rss.xml`: feed

## Local preview

```
npm install
npm run dev
```

To see what an approved contribution card looks like before you have any, run `SAMPLE_CONTRIBUTIONS=1 npm run dev`.
