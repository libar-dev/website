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
| `../delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md` | 10-part tutorial |

The script injects Starlight frontmatter, rewrites internal links, and splits the tutorial into separate pages.

### Source Validation

`sync-content.mjs` now validates required source inputs before cleaning target directories:

- strict mode is automatically enabled in CI (`CI=true`)
- strict mode can be enabled locally with `--strict`
- when strict mode is on, missing required sources fail the sync with exit code `1`
- strict mode also validates required source files (manual docs + generated indexes) before cleanup
- source paths can be overridden via `SYNC_SOURCE_DOCS`, `SYNC_SOURCE_DOCS_LIVE`, `SYNC_SOURCE_DOCS_GENERATED`, `SYNC_SOURCE_README`, `SYNC_SOURCE_TUTORIAL` (used by tests)

## Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Sync content + start dev server |
| `pnpm build` | Sync content + build production site |
| `pnpm sync` | Sync content only |
| `pnpm sync:strict` | Sync content only (fail if required sources are missing) |
| `pnpm test:sync` | Run sync integration checks (structure, links, tutorial split) |
| `pnpm verify:build` | Verify key static build artifacts exist in `dist/` |
| `pnpm preview` | Preview production build locally |

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml`. The workflow checks out `delivery-process-tutorials` as a sibling; docs content comes from the `@libar-dev/delivery-process` npm package via `node_modules`.

**URL:** `https://libar.dev`
