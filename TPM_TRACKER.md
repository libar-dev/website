# TPM Tracker

Systematic issue tracker for the static site generator MVP and follow-up flexibility work.

## Status Legend

- `OPEN`: Not started
- `IN_PROGRESS`: Active work
- `DONE`: Implemented and verified

## Issues

| ID | Priority | Status | Area | Issue | Planned Action |
|---|---|---|---|---|---|
| TPM-001 | P1 | DONE | Sync pipeline safety | Missing source inputs only warn and sync can publish partial docs after cleanup. | Add strict validation mode (default in CI) that fails before cleanup when required inputs are missing. |
| TPM-002 | P1 | DONE | Config/source-of-truth | Section structure was duplicated across sync script and Starlight sidebar. | Centralize section metadata in shared manifest and use it from both sync and Astro config. |
| TPM-003 | P2 | DONE | Link rewriting | Regex-based rewrites are brittle and can miss variants or rewrite non-link content. | Move to markdown AST link transform (remark) with explicit node-level rewriting rules. |
| TPM-004 | P2 | DONE | Tutorial parsing | Tutorial split logic depends on strict `## Part N:` headings and fails open. | Add schema/contract checks (expected headings/count/order) and fail on drift. |
| TPM-005 | P3 | DONE | Routing | Root route conflict between marketing homepage and docs splash homepage. | Pick a single `/` owner and move the other page to a dedicated route. |
| TPM-006 | P3 | DONE | Test coverage | No tests guard sync behavior (frontmatter, slugs, links, tutorial split). | Add sync unit tests + CI smoke assertions for key output routes/files. |
| TPM-007 | P2 | DONE | Link integrity | Synced docs still contained unresolved relative links (`../DECISIONS.md`, `product-areas/*.md`, `src/*.ts`) that 404 in production. | Resolve links by source-file path mapping to final docs routes and add GitHub prefix rewrites for source/spec links. |
| TPM-008 | P2 | DONE | Strict preflight completeness | Strict mode validated source directories but not required source files, allowing partial publishes when key markdown files were missing. | Add strict required-file preflight validation before cleanup and test strict-mode failure using source path overrides. |

## Change Log

- 2026-02-21: Tracker initialized with first review findings.
- 2026-02-21: TPM-002 completed by introducing shared manifest (`scripts/content-manifest.mjs`) and wiring sync + sidebar to it.
- 2026-02-21: TPM-001 completed by adding strict required-source validation before cleanup (`CI=true` default, `--strict` local support).
- 2026-02-21: TPM-003 completed by replacing regex link rewrites with a `remark` AST transform (`link`/`image` nodes only).
- 2026-02-21: TPM-004 completed by enforcing tutorial structure checks (sequential numbering + expected parts) with strict-mode failure.
- 2026-02-21: TPM-005 completed by moving docs hub from `/` to `/docs/` and keeping marketing landing page as the root route.
- 2026-02-21: TPM-006 completed via `node:test` sync checks and CI build artifact smoke verification.
- 2026-02-21: TPM-007 completed by adding source-path-aware route rewrites + GitHub prefix rewrites and a no-unresolved-relative-links test.
- 2026-02-21: TPM-008 completed by adding strict required-source-file validation before cleanup, env-based source overrides, and strict-failure test coverage.
