# @libar-dev Design System — Context + Tracker

Updated: 2026-02-22
File: `design/new-design.pen`

## Purpose

Single source of truth for all design sessions. Load at the start of every session. Covers: fonts/colors/variable naming, theming, atomic layer inventory with frame IDs, component catalog, variable system, migration tracker, code alignment, and session workflow.

---

## Design Aesthetic

**Swiss Constructivist / Brutalist** — geometric compositions, high-contrast black/white/orange, typographic hierarchy, bracket-corner motifs.

- **Sharp corners** — border-radius 0 everywhere
- **High contrast** — black/white with warm bronze (#B06A3C) accent
- **Typographic hierarchy** — bold uppercase headings (IBM Plex Sans), tight letter-spacing, eyebrow labels
- **Structural elements** — 1px border grids, bracket-corner frames
- **dp lettermark** — CSS-only geometric block construction
- **Always-dark code blocks** — code on dark bg regardless of theme
- **Warm tones** — cream/tan light backgrounds (#F6F5F3), not pure white
- **Functional decoration only** — no gradients, no shadows, no rounded pills

---

## Design Principles

1. **Simplicity** — only create components that appear in actual page sections. No speculative library-building.
2. **Bottom-up from pages** — decompose end-product sections into atoms/molecules/organisms. Never design top-down.
3. **No decoration** — foundation tiles are minimal (variable name + value + swatch). No elaborate boards.
4. **Concrete content** — components show real page content ("5x", "50-65%", "Planning Session"), not generic placeholders.
5. **Theme through variables** — light/dark via `theme` on frames + variable bindings. Never build separate light/dark copies.

---

## Design Source of Truth

`design/new-design.pen` is canonical. `design-do-no-edit/input-styled-but-incorrectly-constructed.pen` is read-only reference.

| Property | Value |
|---|---|
| Primary font (headings/labels) | IBM Plex Sans |
| Body font | Geist |
| Code font | JetBrains Mono |
| Accent color | `#B06A3C` (warm bronze, both themes) |
| Accent hover | `#A05A28` |
| Variable prefix (custom) | `--libar-*` |
| Variable prefix (shadcn) | Standard names (`--background`, `--primary`, etc.) |
| Border radius | 0 everywhere (Swiss Constructivist) |
| Pencil variable syntax | `$--libar-accent`, `$--background`, etc. |

---

## Critical `.pen` Behaviors

General `.pen` behaviors: see Pencil docs. These 3 are critical project-specific warnings:

- **`replace_all_matching_properties` ESCAPES `$` in "to" values** — produces `\$--var` instead of `$--var`, breaking variable references. Always use `batch_design` Update operations for variable binding.
- **`search_all_unique_properties` reports RESOLVED hex values**, not variable names — hex values in output does NOT mean they are hardcoded.
- **Source frames need `theme: {Mode: "Light"}`** — `--libar-*` variables have no unthemed default; they require a Mode theme to resolve. Document-level theme cannot be set via MCP tools — user must toggle in Pencil UI.

---

## Theme System

Theme axes: **Mode** (Light, Dark) · **Base** (Neutral, Gray, Stone, Zinc, Slate) · **Accent** (Default, Red, Rose, Orange, Green, Blue, Yellow, Violet). Run `get_variables()` for current values.

Rules:
- Theme is set on frames, inherited by children.
- `--libar-*` variables are Mode-aware only (no Base/Accent overrides currently).
- Shadcn standard variables have full Base + Mode + Accent support.
- Source frames: `theme: {Mode: "Light"}`. Dark preview refs: `theme: {Mode: "Dark"}`.

---

## Frame Map

No separate light preview frames exist — source-light frames serve as both source and light view. Dark preview frames are separate.

| Layer | Source Frame | Dark Preview | Notes |
|---|---|---|---|
| **Foundations** | `foundations-source-light` (`Ws9eI`) | `foundations-preview-dark` (`pwl07`) | Color swatches + typography scale |
| **Atoms** | `atoms-source-light` (`LXK6E`) | `atoms-preview-dark` (`rdckn`) | CTA buttons, lettermark, status tag |
| **Molecules** | `molecules-source-light` (`1gYgt`) | `molecules-preview-dark` (`rCzHR`) | Nav, hero blocks, code blocks, cards |
| **Organisms** | `organisms-source-light` (`dehK6`) | `organisms-preview-dark` (`4jo2u`) | Full sections |
| **shadcn base** | `shadcn-design-system-components` (`MzSDs`) | — | 92 base components — query with `batch_get(reusable:true, parentId:"MzSDs")` |
| **Responsive ref** | `xx0CO` | — | 5 breakpoints (1200/1024/768/480/430) with annotations |

### Page Frames

| Name | ID | Sections |
|---|---|---|
| `page-landing-delivery-process-desktop-light` | `97uoV` | Hero → Stats → Show → Three Sessions → Pipeline |
| `page-landing-delivery-process-desktop-dark` | `DogW5` | Same sections with `theme: Dark` refs |
| `page-docs-overview-delivery-process-desktop-light` | `5BO2H` | Docs shell + TypeScript code block (placeholder state) |
| `page-landing-delivery-process-mobile-light` | `vLqHF` | Hero + Show Don't Tell Mobile only (Stats/Sessions/Pipeline not yet added) |

---

## Custom Libar Components

**WARNING: Some molecules/organisms may still contain default placeholder content. Verify with `get_screenshot` before using in code generation.**

### Foundations (in `Ws9eI` under `Foundations/Reusable Catalog` `RLtJB`)

| Name | ID |
|---|---|
| Foundations/Color Swatches | `0eBi4` |
| Foundations/Typography Scale | `6TX6x` |

### Atoms (in `atoms-source-light` / `LXK6E`)

| Name | ID | Status |
|---|---|---|
| Atom/CTA Primary | `LXgRt` | Active |
| Atom/CTA Secondary | `KgJm8` | Active |
| Atom/DP Lettermark | `1cyxD` | Active |
| Atom/Status Tag | `FRO0v` | Active |

### Molecules (in `molecules-source-light` / `1gYgt`)

| Name | ID | Status |
|---|---|---|
| Molecule/Hero Top Nav | `qaKnr` | Active |
| Molecule/Hero Headline Block | `7z5fL` | Active |
| Molecule/Hero Body Inline Code | `4wjcz` | Active |
| Molecule/Hero CTA Row | `Wy8sH` | Active |
| Molecule/Code Block/Bash Single Line | `dNzrd` | Active |
| Molecule/Code Block/TypeScript | `oh1Ks` | Active |
| Molecule/Code Block/Gherkin | `9U4KF` | Active |
| Molecule/Code Block/Bash | `7vqcw` | Active |
| Molecule/Stat Card | `qfzUL` | Active — default content is "5x / Session Throughput" |
| Molecule/Section Header | `Be3z5` | Active — descendants: `i5bEe` (heading), `gzo2k` (subtitle) |
| Molecule/Session Card | `SFDoA` | Active — descendants: `MHNdY` (number), `bSF5w` (title), `DPL9S` (subtitle), `RZFQQ` (desc), `uQHIQ/2Lpx9` (tag label) |
| Molecule/Pipeline Card | `Zlret` | Active — descendants: `fOSgz` (title), `75Nps` (desc), `wPyy1` (path) |
| Molecule/Flow Tile Default | `g8Ssu` | Active — descendant: `nZfLi` (label) |
| Molecule/Flow Tile Feature | `rYsFJ` | Active — descendant: `qTWEb` (label) |

### Organisms (in `organisms-source-light` / `dehK6`)

| Name | ID | Status | Notes |
|---|---|---|---|
| Organism/Docs Shell | `wUDp5` | Placeholder | Sidebar + content layout, content is placeholder |
| Organism/Landing Hero | `0Ue4C` | Active | Desktop; mobile page composes from lower-level refs |
| Organism/Show Dont Tell | `Ch7Iq` | Active | Desktop/tablet, references TS/Gherkin/Bash molecules |
| Organism/Show Dont Tell Mobile | `RHQQT` | Active | Mobile-optimized single-column |
| Organism/Stats Section | `gn5FK` | Active | Section Header + 3 Stat Cards |
| Organism/Three Sessions | `X5NMd` | Active | Section Header + 3 Session Cards on `bg-section-alt` |
| Organism/Pipeline Section | `F0qnF` | Active | Section Header + 5 Pipeline Cards (staggered) + flow diagram |
| Organism/CTA Footer | `i4Dsc` | Active | CTA heading, buttons, install command, footer bar, divider |

---

## Variable System

### Libar Custom Variables (33)

| Variable | Light | Dark | Axes |
|---|---|---|---|
| `--libar-accent` | #B06A3C | #B06A3C | Mode |
| `--libar-accent-hover` | #A05A28 | #A05A28 | Mode |
| `--libar-accent-subtle` | #B06A3C1A | #B06A3C1A | Mode |
| `--libar-bg-page` | #F6F5F3 | #161618 | Mode |
| `--libar-bg-surface` | #FFFFFF | #222224 | Mode |
| `--libar-bg-surface-2` | #F2F0EC | #2A2A2C | Mode |
| `--libar-bg-code` | #1B1D26 | #1B1D26 | Static (always-dark) |
| `--libar-bg-code-surface` | #323234 | #323234 | Static (always-dark) |
| `--libar-bg-code-block` | #403F3F | #323234 | Mode |
| `--libar-bg-section-alt` | #F2F0EC | #1E1E20 | Mode |
| `--libar-bg-show-section` | #EEECE8 | #1C1C1E | Mode |
| `--libar-border-main` | #E1DDD7 | #2E2E30 | Mode |
| `--libar-border-subtle` | #ECE7E2 | #242426 | Mode |
| `--libar-border-code` | #2E2E30 | #2E2E30 | Static (always-dark) |
| `--libar-text-primary` | #1B1A19 | #E6E4E1 | Mode |
| `--libar-text-secondary` | #66615C | #B7B3AE | Mode |
| `--libar-text-tertiary` | #9B958F | #8C8884 | Mode |
| `--libar-text-on-dark` | #FFFFFF | #E6E4E1 | Mode |
| `--libar-text-on-dark-2` | #9B98A0 | #6E6A67 | Mode |
| `--libar-code-accent` | #D0855A | #D0855A | Static (always-dark) |
| `--libar-code-comment` | #7A746B | #6B6560 | Mode |
| `--libar-code-function` | #2F6FA1 | #7FA8C9 | Mode |
| `--libar-code-gherkin-keyword` | #2F6FA1 | #7FA8C9 | Mode |
| `--libar-code-gherkin-tag` | #B65E30 | #D0855A | Mode |
| `--libar-code-keyword` | #735AAE | #B09CD0 | Mode |
| `--libar-code-plain` | #4C4943 | #A09C96 | Mode |
| `--libar-code-string` | #4D7A42 | #8EAF7E | Mode |
| `--libar-code-tag` | #B65E30 | #D0855A | Mode |
| `--libar-code-type` | #8B6B2E | #C9B07A | Mode |
| `--libar-font-size-code` | 13 | 13 | Static |
| `--libar-font-primary` | IBM Plex Sans | — | Static |
| `--libar-font-secondary` | Geist | — | Static |
| `--libar-font-mono` | JetBrains Mono | — | Static |

### Shadcn Standard Variables

19 core (`--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`) + 8 sidebar + `--black`/`--white`. Full Base + Mode + Accent support — run `get_variables()` for current values.

---

## Input Design Reference (Read-Only)

**File:** `design-do-no-edit/input-styled-but-incorrectly-constructed.pen` — DO NOT EDIT.

Input design has 50 reusable components (landing, docs, code blocks, typography). Use only as visual reference for extracting styled content into new-design.pen.

### Remaining un-migrated sections (frame IDs for reference during migration)

| Section | Light Frame ID | Dark Frame ID |
|---|---|---|
| CTA Footer | `8eHO6` | `v5Tjv` |
| Docs Overview | `gx0ED` | `QezYJ` |

All other sections (Hero, Stats, Three Sessions, Pipeline, B2/Show Don't Tell) have been migrated.

---

## Landing Page Migration Tracker

| Section | Status | Notes |
|---|---|---|
| **Hero** | Done ✅ | `Organism/Landing Hero` (`0Ue4C`) — desktop + mobile refs |
| **Stats** | Done ✅ | `Organism/Stats Section` (`gn5FK`) — 3 stat cards with real content |
| **Three Sessions** | Done ✅ | `Organism/Three Sessions` (`X5NMd`) — 3 session cards with numbered sequence |
| **Pipeline** | Done ✅ | `Organism/Pipeline Section` (`F0qnF`) — 5 staggered dark cards + flow diagram |
| **B2 / Show Don't Tell** | Done ✅ | `Organism/Show Dont Tell` (`Ch7Iq`) + Mobile (`RHQQT`) |
| **CTA Footer** | Done ✅ | `Organism/CTA Footer` (`i4Dsc`) — CTA heading, buttons, install command, footer bar, divider |
| **Docs Overview** | Not started | Needs: top nav, sidebar, explore cards, capabilities table, section heading |

---

## Code ↔ Design Alignment (Deferred)

Current live code uses different tokens. To align later:

| Aspect | Current Code | New Design | Action |
|---|---|---|---|
| Token prefix | `--dp-*` | `--libar-*` | Rename in `src/styles/tokens.css` |
| Display font | Bebas Neue | IBM Plex Sans | Update CSS + font imports |
| Body font | Outfit | Geist | Update CSS + font imports |
| Accent | #E8530E | #B06A3C | Update token value |
| Border radius | Mixed | 0 everywhere | Update to Swiss Constructivist |
| Code gen rule | Emit `var(--dp-*)` | Emit `var(--libar-*)` | Update CLAUDE.md |

Live landing sections (already coded, need design alignment later): Hero, Metrics, Pipeline, CodeExamples, DataAPI, Workflows, Pillars, McpCallout, FooterCta — all in `src/components/landing/delivery-process/`.

---

## Naming + Ownership Rules

Frame naming convention (authoritative): `^[a-z0-9]+(-[a-z0-9]+)*$` — kebab-case, no spaces, no uppercase, no punctuation.

- Layer source frames: `<layer>-source-light` (e.g. `atoms-source-light`)
- Layer dark previews: `<layer>-preview-dark` (e.g. `atoms-preview-dark`)
- Pages: `page-<name>-delivery-process-<desktop|mobile>-<light|dark>`
- Page content frames: `<name>-content` (e.g. `landing-content`)
- Component names: layer prefix + `/` + name (e.g. `Molecule/Session Card`, `Organism/Pipeline Section`)

Build/edit source components only in source frames. Preview frames (dark) contain only `ref` instances — never edit content there. Never create components outside source/preview frames.

---

## Session Start Checklist

1. `get_editor_state(include_schema: false)` — verify `new-design.pen` is active
2. `batch_get(filePath, patterns: [{reusable: true}])` — discover ALL existing components before inserting
3. `get_variables(filePath)` — read current variable values
4. Read this document for context

For new screens or major redesigns, also:
5. `get_guidelines(topic)` — load relevant rules (`landing-page`, `design-system`, `code`, or `tailwind`)
6. `get_style_guide_tags()` → `get_style_guide(tags)` — for visual inspiration

## After Every Change Checklist

1. `snapshot_layout(parentId, problemsOnly: true)` on modified source frame
2. `get_screenshot` on modified source frame
3. `get_screenshot` on dark preview frame
4. Update this tracker's status tables

---

## Session History

### Sessions 1–3 (2026-02-22) — Foundation through Naming Cleanup
Established source/preview separation, validated theming, inventoried all 92 shadcn components, applied scoped kebab-case naming, rebuilt mobile page from reusable refs. Key decisions: Swiss Constructivist aesthetic, `--libar-*` variable prefix, IBM Plex Sans/Geist/JetBrains Mono fonts.

### Session 5 (2026-02-22) — Consolidation & Polish
- Added 7 `--libar-*` variables (bg-code, bg-code-surface, bg-section-alt, border-code, text-on-dark, text-on-dark-2, code-accent; total: 21)
- Migrated all atoms + molecules from hardcoded hex to variable references
- Fixed empty atoms preview frames; expanded Color Swatches (4 rows, 21 swatches) and Typography Scale (10 entries)
- Added responsive breakpoints frame (`xx0CO`)
- Resized all 12 source + preview frames to content-fitted dimensions

Key findings: `replace_all_matching_properties` escapes `$` → use `batch_design` Update. `search_all_unique_properties` returns resolved hex, not variable names.

### Session 6 (2026-02-22) — Show Dont Tell Migration
- Added 12 libar code/show-section variables
- Built multiline code block molecules: TypeScript (`oh1Ks`), Gherkin (`9U4KF`), Bash (`7vqcw`)
- Built Show Dont Tell organisms: desktop (`Ch7Iq`) + mobile (`RHQQT`)
- Composed Show section into desktop light/dark + mobile landing pages
- Validated docs page path (`wUDp5/docsMainCode` → `oh1Ks`)

### Session 7 (2026-02-22) — Stats Section Migration
- Created `Molecule/Stat Card` (`qfzUL`) and `Molecule/Section Header` (`Be3z5`)
- Built `Organism/Stats Section` (`gn5FK`) with real monorepo metrics
- Composed Stats into desktop light + dark page frames

### Sessions 8–9 (2026-02-22) — Three Sessions + Pipeline Migration
- Created `Atom/Status Tag` (`FRO0v`) — orange accent tag used in session cards
- Created `Molecule/Session Card` (`SFDoA`) — numbered card with title/subtitle/description/tag
- Built `Organism/Three Sessions` (`X5NMd`) — Section Header + 3 session cards on `bg-section-alt`
- Created `Molecule/Pipeline Card` (`Zlret`) — dark card (title/description/path)
- Created `Molecule/Flow Tile Default` (`g8Ssu`) + `Molecule/Flow Tile Feature` (`rYsFJ`)
- Built `Organism/Pipeline Section` (`F0qnF`) — 5 staggered pipeline cards + flow diagram
- Composed Three Sessions + Pipeline into desktop light/dark page frames
- Desktop pages now contain all 5 sections: Hero → Stats → Show Don't Tell → Three Sessions → Pipeline

### Next Session Priorities
1. **CTA Footer** — migrate from input design (`8eHO6`/`v5Tjv`); needs CTA heading, buttons, install command, footer bar
2. **Mobile page sections** — add Stats, Three Sessions, Pipeline organisms to `vLqHF`
3. **Docs Overview** — migrate from input design (`gx0ED`/`QezYJ`); needs top nav, sidebar, explore cards, capabilities table
