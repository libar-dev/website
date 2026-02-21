# @libar-dev/website

Documentation website for the `@libar-dev` package ecosystem. Built with [Starlight](https://starlight.astro.build) (Astro).

## Packages Documented

- **[@libar-dev/delivery-process](https://github.com/libar-dev/delivery-process)** — Context engineering toolkit for AI-assisted codebases

## Development

```bash
pnpm install
pnpm dev          # Start dev server at localhost:4321
```

The `dev` command automatically syncs content from sibling directories before starting.

## Content Pipeline

Content is synced from source packages at build time via `scripts/sync-content.mjs`:

| Source | Content |
|--------|---------|
| `../delivery-process/docs/` | Manual documentation (guides, reference) |
| `../delivery-process/docs-live/` | Auto-generated product areas, ADRs |
| `../delivery-process/docs-generated/` | Business rules, taxonomy, reference |
| `../dp-mini-demo/TUTORIAL-ARTICLE-v1.md` | 10-part tutorial |

The script injects Starlight frontmatter, rewrites internal links, and splits the tutorial into separate pages.

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Sync content + start dev server |
| `pnpm build` | Sync content + build production site |
| `pnpm sync` | Sync content only |
| `pnpm preview` | Preview production build locally |

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml`. The workflow checks out `delivery-process` and `dp-mini-demo` repos as siblings for the content sync.

**Current URL:** `https://libar-dev.github.io/website`
**Planned URL:** `https://libar.dev`
