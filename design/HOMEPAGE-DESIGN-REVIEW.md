# Homepage Design Review — v5 Design System Consolidation

**File**: `libar-dev-design-v6-token-consolidated.pen`
**Date**: 2026-02-22
**Scope**: 12 homepage frames (6 Light + 6 Dark)
**Live site codebase**: `/Users/darkomijic/dev-projects/libar-dev-website/`

---

## HOW TO USE THIS REPORT

This report is split into two types of work:

- **MECHANICAL tasks** (Part A) — Deterministic fixes with exact specifications. Can be executed by any model in a fresh session. Each task has precise before/after values and component IDs.
- **STYLISTIC decisions** (Part B) — Creative direction that requires visual judgment. Reserved for Opus 4.6 sessions with design context.

---

# PART A: MECHANICAL TASKS

These are deterministic, specification-driven fixes. Execute them in order. Each has exact values and component IDs.

---

## A1. Variable Cleanup — Prune Stale Entries

**What**: Strip accumulated iteration history from all variables. Keep only the current active Light + Dark values.

**How**: Call `pencil_set_variables` with `replace: true` using ONLY the values listed below. This replaces all existing variable entries with clean single-pair definitions.

**File**: `libar-dev-design-v6-token-consolidated.pen`

### Current Active Values (preserve these exactly)

#### Core Palette
```
--accent:           Light: #B06A3C    Dark: #B06A3C
--accent-foreground: Light: #FFFFFF   Dark: #FFFFFF
--accent-hover:     Light: #A05A28    Dark: #A05A28
--accent-subtle:    Light: #B06A3C1A  Dark: #B06A3C1A
```

#### Backgrounds
```
--bg-page:          Light: #F6F5F3    Dark: #161618
--bg-section-alt:   Light: #EEECE8    Dark: #1C1C1E
--bg-surface:       Light: #FFFFFF    Dark: #222224
--bg-surface-2:     Light: #F2F0EC    Dark: #2A2A2C
--bg-feature:       Light: #1B1D26    Dark: #111113
--bg-code:          Light: #D2CDC2    Dark: #323234
--bg-code-inline:   Light: #ECEAE4    Dark: #FFFFFF10
```

#### Text
```
--text-primary:     Light: #1B1A19    Dark: #E6E4E1
--text-secondary:   Light: #66615C    Dark: #B7B3AE
--text-tertiary:    Light: #9B958F    Dark: #8C8884
--text-on-dark:     Light: #FFFFFF    Dark: #E6E4E1
--text-on-dark-2:   Light: #9B98A0    Dark: #6E6A67
```

#### Borders
```
--border-main:      Light: #E1DDD7    Dark: #2E2E30
--border-subtle:    Light: #ECE7E2    Dark: #242426
```

#### Sidebar
```
--sidebar-bg:           Light: #ECE9E4    Dark: #18181A
--sidebar-border-color: Light: #E1DDD7    Dark: #242426
--sidebar-group-label:  Light: #9B958F    Dark: #8C8884
--sidebar-link:         Light: #66615C    Dark: #B7B3AE
--sidebar-link-hover:   Light: #0000000A  Dark: #FFFFFF0A
--sidebar-active-bg:    Light: #B06A3C14  Dark: #B06A3C14
--sidebar-active-border-color: (no theme): #B06A3C
```

#### Code Syntax (single values, no theme needed)
```
--code-plain:       Light: #4C4943    Dark: #A09C96
--code-keyword:     Light: #735AAE    Dark: #B09CD0
--code-function:    Light: #2F6FA1    Dark: #7FA8C9
--code-type:        Light: #8B6B2E    Dark: #C9B07A
--code-string:      Light: #4D7A42    Dark: #8EAF7E
--code-comment:     Light: #7A746B    Dark: #6B6560
--code-tag:         Light: #B65E30    Dark: #D0855A
--code-gherkin-keyword: Light: #2F6FA1  Dark: #7FA8C9
--code-gherkin-tag:    Light: #B65E30   Dark: #D0855A
```

#### Semantic Colors
```
--color-error:            Light: #E5DCDA    Dark: #24100B
--color-error-foreground: Light: #8C1C00    Dark: #FF5C33
--color-info:             Light: #DFDFE6    Dark: #222229
--color-info-foreground:  Light: #000066    Dark: #B2B2FF
--color-success:          Light: #DFE6E1    Dark: #222924
--color-success-foreground: Light: #004D1A  Dark: #B6FFCE
--color-warning:          Light: #E9E3D8    Dark: #291C0F
--color-warning-foreground: Light: #804200  Dark: #FF8400
--destructive:            Light: #D93C15    Dark: #FF5C33
```

#### Typography
```
--font-primary:    IBM Plex Sans          (remove stale "JetBrains Mono" entry)
--font-secondary:  Geist
--font-body:       Geist
--font-mono:       JetBrains Mono
```

#### Font Sizes (no theme, single values)
```
--font-size-display:    52
--font-size-cta:        32
--font-size-h1:         28
--font-size-h2:         20
--font-size-h3:         18
--font-size-h4:         16
--font-size-stat:       56
--font-size-session-num: 40
--font-size-body-lg:    18
--font-size-body:       16
--font-size-body-sm:    14
--font-size-body-xs:    12
--font-size-label:      14
--font-size-btn:        13
--font-size-code:       13
--font-size-eyebrow:    12
--font-size-table-hdr:  11
--font-size-tag:        11
```

#### Spacing / Radius (no theme, single values)
```
--radius-none:  0
--radius-xs:    0
--radius-s:     0
--radius-m:     0
--radius-pill:  999
```

#### Constants
```
--black:  #000000
--white:  #FFFFFF
```

---

## A2. Code Block Borders — Fix Invisible Strokes

**What**: Change stroke fill from `$--bg-code` (same as fill = invisible) to `$--border-main` on all code block components.

**Components to update** (4 total):

| Component | ID | Current stroke.fill | New stroke.fill |
|---|---|---|---|
| Docs/Code Block/TypeScript Reusable | `V5GTG` | `$--bg-code` | `$--border-main` |
| Docs/Code Block/Gherkin Reusable | `VeqED` | `$--bg-code` | `$--border-main` |
| Docs/Code Block/Bash Reusable | `bonXq` | `$--bg-code` | `$--border-main` |
| Landing/Install Command | `fskV5` | `$--bg-code` | `$--border-main` |

**Operation**: For each component:
```
U("<ID>", { stroke: { align: "inside", fill: "$--border-main", thickness: 1 } })
```

---

## A3. Code Block Font Sizes — Replace Hardcoded Values

**What**: Replace `fontSize: 13` with `fontSize: "$--font-size-code"` in all text elements of TypeScript and Gherkin code block components.

**Component `V5GTG`** — text element IDs to update:
`FropO`, `52b4F`, `ZoSIe`, `LDpgz`, `EVlrg`, `c2unK`, `fRqA8`, `x5UWr`, `PZ8ch`, `XIVow`, `dACrQ`, `fmEgq`, `gCa1N`, `fq0zH`, `Wbv52`, `vyCc6`, `QBEiA`, `3r0zq`, `9IcMI`, `Rdj0r`, `0O3mf`, `VaYiZ`, `SlZm6`, `oL2wt`

**Component `VeqED`** — text element IDs to update:
`MOc3y`, `zn6kx`, `IUyst`, `lQ2mT`, `tFvbL`, `nsjJW`, `CGk6O`, `DH6SG`, `DD5Iz`, `yYGN0`, `L6h3s`, `i9wvY`, `PeYO6`, `UM6RN`, `Xw7IK`, `tDwga`, `i7Ehl`

**Operation**: For each text element:
```
U("<componentID>/<textID>", { fontSize: "$--font-size-code" })
```

---

## A4. Hero Bracket Clipping — Fix Logo Mark Bounds

**Frames**: `TYYB2` (Light), `7ghMq` (Dark)
**Issue**: `bracket-tl` at `x: -16` extends outside Logo Mark frame.

**Option A** (recommended): Reposition bracket inside bounds.
```
U("TYYB2/WCBXA/3zioE", { x: 0 })     // Light
U("7ghMq/1vdGo/9gGgd", { x: 0 })     // Dark
```

**Option B**: Expand Logo Mark frame to contain bracket.
```
U("TYYB2/WCBXA", { width: 344, x: 776 })  // +16 width, -16 x offset
U("7ghMq/1vdGo", { width: 344, x: 776 })
```

Pick one approach. Option A is simpler but changes the bracket decorative position.

---

## A5. Three Sessions — Light/Dark Parity

**What**: Align background tokens between light and dark variants.

**Frame `z0Bzq` (Dark Three Sessions)**:
```
U("z0Bzq", { fill: "$--bg-section-alt" })   // was $--bg-page
```

**Dark session cards** — change fill from `$--bg-section-alt` to `$--bg-surface`:
```
U("z0Bzq/wwPxt/Yf5os", { fill: "$--bg-surface" })   // card1
U("z0Bzq/wwPxt/ifVd3", { fill: "$--bg-surface" })   // card2
U("z0Bzq/wwPxt/BAsbZ", { fill: "$--bg-surface" })   // card3
```

**Result**: Both themes use `$--bg-section-alt` background + `$--bg-surface` cards.

---

## A6. Stale Context Notes — Remove

**Frame `z0Bzq`**: Remove context property.
```
U("z0Bzq", { context: "" })
U("z0Bzq/wwPxt", { context: "" })
```

---

## A7. Logo Mark — Delete Disabled Elements

**Light Hero** (`TYYB2`):
```
D("k0bgw")    // d-cutout (enabled: false)
D("oAEKx")    // p-cutout (enabled: false)
```

**Dark Hero** (`7ghMq`):
```
D("Ncwt4")    // d-cutout (enabled: false)
D("aPEQc")    // p-cutout (enabled: false)
```

---

## A8. Pipeline Dark Mode — Add Card Borders

**What**: Add subtle border to Pipeline Card component for dark mode visibility.

**Component `nOKxb`** (Landing/Pipeline Card):
```
U("nOKxb", { stroke: { align: "inside", fill: "$--border-subtle", thickness: 1 } })
```

**Also add border to Flow Tiles for dark mode clarity:**

**Component `EY2tq`** (Landing/Flow Tile) — already has `$--border-main` stroke. No change needed.

**Component `Meycn`** (Landing/Flow Tile Dark) — currently no stroke:
```
U("Meycn", { stroke: { align: "inside", fill: "$--border-subtle", thickness: 1 } })
```

---

# PART B: STYLISTIC DECISIONS

These require visual judgment and creative direction. Handle in Opus 4.6 sessions.

---

## B1. Dark Mode Warmth Tuning (Closed)

**Status**: Closed. The non-production B1 exploration board was removed.

**Resolution**:
- `YS01N` (`B1-B2 Exploration Board (Non-Production)`) was deleted from the active design editor state.
- Dark theme system tokens remain on the current approved palette:
  - `#161618`, `#1C1C1E`, `#222224`, `#2A2A2C`

---

## B2. Accent Hover (Implemented)

**Decision**: Candidate A selected.

**Token**:
- `--accent-hover` set to `#A05A28` in both Light and Dark.

**Implementation**:
- B2 compare matrix preserved and promoted as a first-class section:
  - Catalog light frame (`5o0OH`)
  - Catalog dark frame (`nhTDB`)
  - Homepage light flow after Pipeline (`xp4Bv` -> B2 -> `VhuCT`)
  - Homepage dark flow after Pipeline (`djdNg` -> B2 -> `kG9VC`)
- Candidate A rows are explicitly labeled as selected for CTA and stat comparisons.

---

## B3. Missing Section: DataAPI Tabbed Terminal

**Live site**: `src/components/landing/delivery-process/DataAPI.astro`
**What**: 4-tab terminal showing real CLI output — key product showcase.

**Design direction**: Create a `Landing/Tabbed Code Block` component.
- Tab bar: horizontal, using `$--text-tertiary` for inactive, `$--accent` for active tab text, `$--border-main` underline for active
- Code area: `$--bg-code` fill with `$--border-main` stroke
- Content: syntax-highlighted CLI output (reuse existing `--code-*` variables)
- Both light and dark variants needed

**Open question**: Should tabs feel like browser tabs (raised) or terminal tabs (flat/underlined)? The engineering paper aesthetic suggests flat/underlined.

---

## B4. Missing Section: Four Pillars

**Live site**: `src/components/landing/delivery-process/Pillars.astro`
**What**: 2x2 grid with bracket decorations. Four product differentiators.

**Design direction**:
- Reuse or extend `Landing/Session Card` component
- Add `Landing/Bracket Corner` as a reusable decoration element
- Bracket corners should use `$--text-primary` with thin stroke (~1.5px)
- 2x2 grid with bracket corners at the four outer corners of the grid
- Content per card: large number (01-04), title, mono subtitle, body paragraph with inline code

**Key decision**: Should brackets also appear on the Three Sessions section and potentially as section dividers? Elevating brackets to a system-level motif would strengthen the brand identity.

---

## B5. Missing Section: MCP Callout

**Live site**: `src/components/landing/delivery-process/McpCallout.astro`
**What**: "Model Context Protocol — Coming Soon" announcement.

**Design direction**: Lower priority. Simple section using existing components — `Landing/Section Alt` background, section header, description text. May include a status badge or "coming soon" tag.

---

## B6. Pipeline Staggered Layout

**Live site**: Cards cascade with staggered vertical offsets.
**Current Pencil**: Flat horizontal row, all cards same height.

**Design direction**: Design a staggered variant where each card is offset ~20-30px vertically, creating a cascade that suggests process flow. The stagger IS systematic — fixed delta per card. It doesn't break the constructivist approach, it extends it.

**Task**: Create a variant Pipeline frame with staggered cards, compare against the flat version.

---

## B7. Flow Diagram Fidelity

**Current**: Text arrows (`→`) between flow tiles.
**Live site**: Mermaid-rendered SVG with curved paths.

**Design direction**: The text-arrow version is a valid schematic representation for the design system. For pixel-perfect output, consider drawing the flow connections as path elements in Pencil (angled lines with arrowheads) rather than relying on runtime Mermaid rendering.

**Lower priority** — the current schematic communicates the concept. Refine when approaching pixel-perfect polish.

---

## B8. Font Stack — Final Decision

**Current Pencil**: IBM Plex Sans (headings) + Geist (body) + JetBrains Mono (code)
**Current Live**: Bebas Neue (headings) + Outfit (body) + JetBrains Mono (code)

**Recommendation**: Stay with IBM Plex Sans + Geist. Bebas Neue is a common condensed display face that dilutes the engineering identity. IBM Plex Sans has the right DNA (designed for a systems company), and the heavy weight at display sizes creates sufficient impact.

**Task**: No change needed unless the decision is to switch. If switching, this cascades to every heading in the design system.

---

## B9. Homepage Section Order — Final Layout

The complete homepage should contain these sections in order:

| # | Section | In Pencil | Status |
|---|---|---|---|
| 1 | Navigation | YES | Done |
| 2 | Hero | YES | Needs bracket clipping fix |
| 3 | Stats/Metrics | YES | Done |
| 4 | Pipeline | YES | Needs stagger + dark contrast |
| 5 | Show Don't Tell | YES | Needs code block fixes |
| 6 | **DataAPI** | **NO** | Needs design |
| 7 | Three Sessions / Workflows | YES | Needs parity fix |
| 8 | **Four Pillars** | **NO** | Needs design |
| 9 | **MCP Callout** | **NO** | Needs design |
| 10 | CTA Footer | YES | Done |

**Open question**: Is this the right order? The live site interleaves these differently. Section order affects narrative flow — the story the page tells as you scroll.

---

# APPENDIX

## Frames Reviewed

| Frame | ID | Mechanical Issues | Stylistic Questions |
|---|---|---|---|
| Hero — Light | `TYYB2` | A4 (bracket clip), A7 (dead elements) | — |
| Hero — Dark | `7ghMq` | A4 (bracket clip), A7 (dead elements) | B1 (warmth) |
| Stats — Light | `TxgPk` | — | — |
| Stats — Dark | `l39dJ` | — | B1 (warmth) |
| Three Sessions — Light | `ruj7g` | — | B4 (brackets?) |
| Three Sessions — Dark | `z0Bzq` | A5 (parity), A6 (stale note) | B1, B4 |
| Pipeline — Light | `xp4Bv` | — | B6 (stagger) |
| Pipeline — Dark | `djdNg` | A8 (card borders) | B1, B6 |
| Show Dont Tell — Light | `VhuCT` | A2 (borders), A3 (font sizes) | — |
| Show Dont Tell — Dark | `kG9VC` | A2 (borders), A3 (font sizes) | B1 |
| CTA Footer — Light | `8eHO6` | — | — |
| CTA Footer — Dark | `v5Tjv` | — | B1 |

## Live Site Section Files

| Section | File |
|---|---|
| Hero | `src/components/landing/delivery-process/Hero.astro` |
| Metrics | `src/components/landing/delivery-process/Metrics.astro` |
| Pipeline | `src/components/landing/delivery-process/Pipeline.astro` |
| Code Examples | `src/components/landing/delivery-process/CodeExamples.astro` |
| DataAPI | `src/components/landing/delivery-process/DataAPI.astro` |
| Workflows | `src/components/landing/delivery-process/Workflows.astro` |
| Pillars | `src/components/landing/delivery-process/Pillars.astro` |
| MCP Callout | `src/components/landing/delivery-process/McpCallout.astro` |
| Footer CTA | `src/components/landing/delivery-process/FooterCta.astro` |
| Tokens | `src/styles/tokens.css` |
| Landing CSS | `src/styles/landing.css` |
| Layout | `src/layouts/LandingLayout.astro` |
| Page | `src/pages/index.astro` |

---

## SESSION CONTEXT UPDATE (2026-02-22)

This section records work completed after the original report to reduce re-discovery in future sessions.

### Implemented in-session

- **A1 applied**: Variable cleanup/reset executed to the report's active Light/Dark values (replace-style token reset in editor state).
- **A2 applied**: Code block border token fix set on reusable components:
  - `V5GTG`, `VeqED`, `bonXq`, `fskV5` -> `stroke.fill: $--border-main`
- **A3 applied**: Hardcoded `fontSize: 13` replaced with `$--font-size-code` on all listed text IDs in:
  - `V5GTG` (TypeScript reusable)
  - `VeqED` (Gherkin reusable)

### Consolidation work completed

- Added reusable architecture artifact:
  - `WLB1j` = `Catalog/Atomic Architecture Map`
  - Board instances:
    - `lPMWA` in `5o0OH`
    - `4mkrB` in `nhTDB`
- Duplicate preview groups handled with archive-first flow:
  - Archived copy container: `y9SFH` (`Catalog/Archive/Deprecated Preview Groups`)
  - Original duplicate groups removed:
    - `4Gpc3`, `HYKgZ`, `6NTUn`, `DaKOT`
- Source-of-truth previews remain:
  - `skiSm` and `bfhth`

### Additional propagation fix done

- Some instance-level overrides were still forcing code-block borders to blend with fills.
- These instance overrides were updated to use `$--border-main` so A2 is visible in section previews:
  - `kvAjj`, `54RaA`, `AQ20y`, `FYgZE`, `ePPFD`, `y7ITU`
  - `PovRS/8AWY5`, `PovRS/8zE3u`, `PovRS/YkMYc`
  - `Z6tSX/8AWY5`, `Z6tSX/8zE3u`, `Z6tSX/YkMYc`

### Explicitly deferred (unchanged by design)

- Out-of-scope from this cycle:
  - `pWB7u` base border token change
  - Catalog label font tokenization (`tH5Sc`, `AaR70`)
- Original known unrelated issue remains:
  - A4 bracket clipping (`zX9sr/ZLmvF`, `nOg9n/dEMVb`)

---

## SESSION CONTEXT UPDATE (2026-02-22 — PHASE 2 EXECUTION SNAPSHOT)

Compact handoff summary for future sessions. This update supersedes the earlier "deferred" note for A4.

### Scope executed

- File updated: `libar-dev-design-v5-design-system-consolidation.pen`
- Focus: A4, A5, A6 + moderate atomic consolidation (design-file only)
- Out-of-scope maintained: live Astro/CSS code sync in `libar-dev-website`

### Mechanical outcomes

- **A4 done** (Option A): `bracket-tl.x` moved to `0` in:
  - `TYYB2/WCBXA/3zioE`, `7ghMq/1vdGo/9gGgd`
  - catalog parity: `zX9sr/ZLmvF`, `nOg9n/dEMVb`
- **A5 done**:
  - `z0Bzq.fill -> $--bg-section-alt`
  - `z0Bzq/wwPxt/{Yf5os,ifVd3,BAsbZ}.fill -> $--bg-surface`
- **A6 done**:
  - `z0Bzq.context = ""`
  - `z0Bzq/wwPxt.context = ""`

### Adjacent deterministic cleanup applied

- Removed disabled hero cutouts:
  - `k0bgw`, `oAEKx`, `Ncwt4`, `aPEQc`
- Added dark-contrast strokes:
  - `nOKxb.stroke.fill -> $--border-subtle`
  - `Meycn.stroke.fill -> $--border-subtle`
- Base docs code block parity fix:
  - `pWB7u.fill -> $--bg-code`
  - `pWB7u.stroke.fill -> $--border-main`

### Consolidation outcomes

- Renamed reusable labels for clearer atomic semantics:
  - `EY2tq` -> `Landing/Flow Tile/Default`
  - `Meycn` -> `Landing/Flow Tile/Feature`
- Tokenized shared docs primitives (`jRVW5`, `fX616`, `n3o5m`, `Ws3S4`, `LpmqB`, `EDYlB`) toward Light/Dark reuse.
- Tokenized code-block canon surface/background usage:
  - `V5GTG`, `VeqED`, `bonXq`, `pWB7u` use code/background tokens.
- Font-token hygiene normalized in touched scope (`$--font-body`, `$--font-mono`).

### Validation snapshot

- Layout checks (`problemsOnly:true`) are clean for:
  - `TYYB2`, `7ghMq`, `5o0OH`, `nhTDB`
- Visual checks captured for:
  - `TYYB2`, `7ghMq`, `z0Bzq`, `5o0OH`, `nhTDB`, `VhuCT`, `kG9VC`, `xp4Bv`, `djdNg`
- Mechanical state verified:
  - A4/A5/A6 values present as specified.

### Known caveat for next session

- Instance override maps on `d2sVm`, `BCkSP`, `PovRS`, `Z6tSX` remain verbose in editor state.
- Current MCP update behavior merges `descendants` and does not reliably remove legacy keys.
- Practical result is still improved: overrides are tokenized and theme-safe, but not yet compact.

---

## SESSION CONTEXT UPDATE (2026-02-22 — PHASE 3 A7/A8 + ATOMIC CONSOLIDATION)

Compact execution delta for this session.

### Scope executed

- File updated in active editor: `libar-dev-design-v5-design-system-consolidation.pen`
- Focus delivered:
  - A7 + adjacent deterministic cleanup
  - A8 + adjacent deterministic cleanup
  - Moderate atomic consolidation for `5o0OH` and `nhTDB`
  - A1 canonical variable reset (`replace: true`)
- Out-of-scope preserved:
  - Live Astro/CSS codebase sync in `libar-dev-website`
  - Hidden archive frame `B0VoO`

### Exact node-level deltas

- **A7 / cutouts**
  - Preflight verified hero cutouts already absent in live hero logo marks:
    - `TYYB2/WCBXA` and `7ghMq/1vdGo` had no `*-cutout` nodes.
  - Removed remaining disabled cutouts in catalog logo marks:
    - `TLyNK`, `yAvZH`, `0mPbw`, `0zYUW`

- **A8 / dark clarity**
  - `nOKxb.stroke -> { align: "inside", fill: "$--border-subtle", thickness: 1 }`
  - `Meycn.stroke -> { align: "inside", fill: "$--border-subtle", thickness: 1 }`

- **Adjacent deterministic parity**
  - `fskV5.stroke -> { align: "inside", fill: "$--border-main", thickness: 1 }`
  - `pWB7u.stroke -> { align: "inside", fill: "$--border-main", thickness: 1 }`
  - Naming normalization confirmed:
    - `EY2tq` = `Landing/Flow Tile/Default`
    - `Meycn` = `Landing/Flow Tile/Feature`

- **Atomic consolidation (preview refs)**
  - Replaced and then reinserted preview refs to eliminate legacy descendant payload carry-over.
  - Legacy refs removed:
    - `d2sVm`, `PovRS`, `BCkSP`, `Z6tSX`
  - New lightweight refs (no descendants map):
    - `osJuj` (`lightDocsPreviewRefC` -> `skiSm`)
    - `xBSXd` (`lightCodePreviewRefC` -> `bfhth`)
    - `JaE6c` (`darkDocsPreviewRefC` -> `skiSm`)
    - `xBjdd` (`darkCodePreviewRefC` -> `bfhth`)

- **Variable source integrity**
  - Re-applied canonical A1 variable set with `replace: true` to keep single authoritative Light/Dark pairs.

### Validation results

- **Structural checks**
  - No `cutout` nodes found in:
    - `TYYB2` subtree
    - `7ghMq` subtree
    - `zX9sr` subtree
    - `nOg9n` subtree
  - A8 strokes verified on canonical components:
    - `nOKxb.stroke.fill = "$--border-subtle"`
    - `Meycn.stroke.fill = "$--border-subtle"`
  - Preview ref consolidation verified:
    - `TsoYJ` children now only `osJuj`, `xBSXd`
    - `djm5F` children now only `JaE6c`, `xBjdd`
    - No descendants maps on those four refs.

- **Variable integrity checks**
  - `--text-on-dark` Dark resolves to `#E6E4E1` in active editor variables.
  - Active editor variable set is reduced to canonical pairs/singletons from A1.

- **Layout and visual checks**
  - `pencil_snapshot_layout(problemsOnly:true)` returned `"No layout problems."` for:
    - `TYYB2`, `7ghMq`, `djdNg`, `5o0OH`, `nhTDB`
  - Before/after screenshots captured for:
    - `TYYB2`, `7ghMq`, `djdNg`, `5o0OH`, `nhTDB`

### Consolidation metrics

- Removed cutout nodes: `4` (catalog logo marks)
- Hero cutout removals required in this pass: `0` (already absent at preflight)
- Rebuilt preview refs: `4`
- Variable duplication cleanup: canonicalized in active editor variable state

### Remaining backlog

- Optional follow-up: run a targeted token-binding audit on catalog previews to reduce any non-essential resolved overrides that may be introduced by editor-level instance propagation in future edits.

---

## SESSION CONTEXT UPDATE (2026-02-22 — B-SERIES: CODE BLOCK BG + DESIGN SYSTEM AUDIT)

### Stylistic decision: Light theme code blocks → inverted dark

- Explored 4 bg variations (darker warm, cool gray, saturated warm) against current `#D2CDC2`
- Winner: **inverted dark at `#403F3F`** — dark code blocks on light pages using `theme: {Mode: "Dark"}` + hardcoded fill
- Implementation: instance-level overrides (not variable changes). `$--bg-code` Light stays `#D2CDC2` for inline code context.
- Instances updated:
  - `kvAjj` (TS in Show Don't Tell Light)
  - `54RaA` (Gherkin in Show Don't Tell Light)
  - `AQ20y` (Bash in Show Don't Tell Light)
  - `ui6zE` (Install Command in CTA Footer Light)
- Dark theme frames: unchanged (inherit `$--bg-code` Dark `#323234`)

### A2 re-applied on canonical components

- Previous A2 applications did not persist on source components.
- Re-applied `stroke: {fill: "$--border-main"}` on: `V5GTG`, `VeqED`, `bonXq`, `pWB7u`, `fskV5`

### Design system audit completed (48 components)

Critical pending:
- **A1/A3 not persisted**: `fontSize: 13` hardcoded on 41 text nodes in V5GTG (24) and VeqED (17). Bash (`bonXq`) is correct.
- Logo Mark (`zX9sr`/`nOg9n`) not reusable — duplicated, should be elevated.
- 3 orphaned components off-canvas at x:10250: `867La`, `SkKJz`, `ChA2s`
- Session Card (`HcJOw`) has inline Status Tag instead of ref to `867La`.
- Flow Tile padding mismatch: `EY2tq` [10,20] vs `Meycn` [12,24].
- Table header font inconsistency between `Q0qkk` ($--font-primary) and `FDWvO` ($--font-mono).

### Syntax color unification across code block types

- TS JSDoc comments (6 nodes in `V5GTG`): `$--code-comment` → `$--code-plain`
- Bash comments (2 nodes in `bonXq`): `$--code-comment` → `$--code-plain`
- Bash commands (2 nodes in `bonXq`): `$--code-plain` → `$--code-tag`
- Install command text (`fskV5/pt998`): `$--text-primary` → `$--code-tag`
- Result: annotations = neutral, executable commands = orange, consistent across TS/Gherkin/Bash

---

## SESSION CONTEXT UPDATE (2026-02-22 — PENCIL SYNC CONFLICT + TOKEN DUPLICATION LEARNINGS)

### What was reproduced

- `set_variables` with `replace: true` is effectively destructive for instance-level `theme` overrides on `ref` nodes in this file.
- Verified regression target set after reset:
  - `kvAjj` (TS block in Show Dont Tell Light)
  - `54RaA` (Gherkin block in Show Dont Tell Light)
  - `AQ20y` (Bash block in Show Dont Tell Light)
  - `ui6zE` (Install command in CTA Footer Light)
- Symptom: override reads back in immediate MCP verification, but desktop app may continue showing an intermediate or stale state.

### Root-cause hypothesis (high confidence)

- Concurrent edits between Pencil desktop app and MCP/VS Code plugin can race on the same `.pen` file.
- The app/plugin auto-save path can overwrite MCP-written JSON shortly after a successful tool operation.
- This explains why in-place edits appeared successful but no Git diff remained afterward.

### Deterministic file-level findings

- `libar-dev-design-v5-design-system-consolidation.pen` contained duplicated per-theme variable entries from iterative updates.
- Quantified before consolidation:
  - Total variable array entries: `220`
  - Tokens with duplicate entries for the same theme key: `33`
  - Example: `--bg-feature` had `8` entries (4 Light + 4 Dark)

### Durable remediation performed

- Created consolidated copy:
  - `libar-dev-design-v6-token-consolidated.pen`
- Consolidation rule: keep latest value per theme key (`Light`, `Dark`, `default`) for each array-based variable.
- Quantified after consolidation:
  - Total variable array entries: `93`
  - Tokens with duplicate same-theme entries: `0`
  - `--bg-feature`: `8 -> 2`
  - `--bg-code`: `28 -> 2`
- Validation: Show Dont Tell Light code blocks still explicitly dark in `v6`:
  - `kvAjj`, `54RaA`, `AQ20y` keep `theme: {Mode: "Dark"}` and `fill: "#403F3F"`

### Operational learnings for next sessions

- Use one writer at a time for `.pen` changes (desktop OR MCP/plugin), not both concurrently.
- After any `replace: true` variable reset, immediately re-audit all `ref` nodes with explicit `theme` overrides.
- Prefer creating a new versioned `.pen` output for large normalization passes; verify via Git diff before reopening in other editors.
- Verify final state in the exact client used for review (desktop app if stakeholder reviews there).

---

## SESSION CONTEXT UPDATE (2026-02-22 — V6 FULL REMEDIATION, B2 PRESERVED)

### Scope executed

- Active editor target: `libar-dev-design-v6-token-consolidated.pen`
- Requested approach: full 3rd-party remediation, remove B1 board, preserve/promote B2 hover section.

### Implemented

- B1 board removed:
  - Deleted `YS01N` (`B1-B2 Exploration Board (Non-Production)`).
- B2 preserved and promoted:
  - `0aPdJ` created as reusable `Landing/B2 Hover Compare Reusable`.
  - B2 inserted as component instances in catalog boards:
    - Light: `r4Aza`
    - Dark: `iGXsu`
  - B2 inserted in homepage flows after pipeline:
    - Light: `BbLCw` between `xp4Bv` and `VhuCT`
    - Dark: `6lVnn` between `djdNg` and `kG9VC`
  - Candidate A marked as selected in CTA/stat rows.
- Accent-hover decision applied:
  - `--accent-hover` now `#A05A28` in both themes.
- Over-componentization remediation:
  - `Q0qkk` instance usages replaced with local composed frames:
    - `6Gmqh`, `C78JC`, `V5RgW`
  - `xOBDu` instance usages replaced with local composed frames:
    - `CNb8B`, `R7z1e`, `T5DTg`
- Redundant font-only descendants cleanup:
  - Replaced ref instances to remove font-only descendants:
    - `be36J`, `XM9qO`, `ZPOUE`, `2jqH5`, `DmKQx`, `lvIoE`, `XTiTi`, `FJw55`
- Variable fallback cleanup:
  - Removed unscoped fallback entry from code tokens:
    - `--code-comment`, `--code-function`, `--code-gherkin-keyword`, `--code-gherkin-tag`, `--code-keyword`, `--code-plain`, `--code-string`, `--code-tag`, `--code-type`
- Hardcoded typography tokenization:
  - `XieTc.fontFamily` -> `$--font-primary`
  - `eV8Me.fontFamily` -> `$--font-mono`
  - Additional literal IBM/JetBrains usages normalized to font tokens in active editor scope.

### Canvas/ordering adjustments

- Shifted homepage light/dark downstream sections to make room for inserted B2 sections:
  - `VhuCT`, `kG9VC`, `8eHO6`, `v5Tjv`
- Shifted catalog light/dark swatch + typography blocks downward and expanded frame heights:
  - `5o0OH.height`, `nhTDB.height`, and y-offset updates for swatch/typography sections.

### Validation snapshot

- Structural:
  - `YS01N` absent in active editor state.
  - No remaining `capTableInst`/`sidebarInst` refs to `Q0qkk` or `xOBDu`; these are now local frames.
- Tokens:
  - `--accent-hover` = `#A05A28` for Light/Dark.
  - Code color variables are Light/Dark pairs only (no redundant default fallback entries).
- Font token usage:
  - Active unique families resolve to tokenized values and approved body family (`Geist`) in use.

### Note on persistence

- MCP/editor state is authoritative for this execution snapshot.
- If file-diff parity is required on disk, use a single-writer export/save pass from the active Pencil editor to avoid known desktop/plugin race conditions documented above.
