# @libar-dev Design System — Context + Tracker

Updated: 2026-02-22
File: `design/new-design.pen`

## Purpose

This is the single source of truth for ALL design sessions. Load this document at the start of every session instead of writing long prompts. It captures:
- Design source of truth decisions (fonts, colors, variable naming)
- How theming works (Base, Mode, Accent)
- Complete atomic design layer inventory with frame IDs
- Component catalogs (shadcn base + libar custom)
- Variable system inventory
- Input design reference for migration
- Landing page migration tracker
- Code ↔ design alignment notes
- Session workflow and checklist

## Design Aesthetic

**Swiss Constructivist / Brutalist** — informed by the original moodboard (geometric compositions, high-contrast black/white/orange, typographic hierarchy, bracket-corner motifs).

Key visual traits:
- **Sharp corners** — border-radius 0 everywhere, no rounded elements
- **High contrast** — black/white foundation with warm bronze (#B06A3C) accent
- **Typographic hierarchy** — bold uppercase headings (IBM Plex Sans), tight letter-spacing, eyebrow labels
- **Structural elements** — 1px border grids, bracket-corner frames (::before top-left, ::after bottom-right)
- **dp lettermark** — CSS-only geometric block construction, signature brand element
- **Dark feature cards** — dark backgrounds (#1B1D26) on light pages for contrast
- **Always-dark code blocks** — code is always on dark bg regardless of theme
- **Warm tones** — cream/tan light backgrounds (#F6F5F3), not pure white
- **Functional decoration only** — no gradients, no shadows, no rounded pills, no decorative illustrations

---

## Design Principles

### 1. Simplicity — nothing speculative
- **Never add anything not used in actual pages and templates.**
- Every component must justify its existence by appearing in a real page section.
- If a component doesn't map to a specific element in the target pages (Hero, Stats, Sessions, Pipeline, B2, CTA Footer, Docs Overview), don't create it.

### 2. Bottom-up from pages
- Start from the end product (page sections in the input design) and decompose into atoms/molecules/organisms.
- Do NOT create speculative component libraries top-down from theory.
- The input design's page sections are the target — decompose them into atomic layers.

### 3. No decoration for decoration's sake
- Foundation tiles (color swatches, typography) should be minimal — just show the variable name, value, and a color sample.
- Prefer the clean inline swatch style from the input design (variable name + hex below a color rectangle).
- No elaborate "boards" or "session" labels around foundation elements.

### 4. Concrete over abstract
- Components in source frames should show actual content from the target pages, not generic placeholder text.
- Example: a Stat Card should show "5x" or "50-65%", not "1,280" with "-12%".
- Example: a Content Card should show "Tutorial" or "Reference", not "Active Rovers" or "Solar Efficiency Pack".

### 5. Theme through variables, not duplication
- Light/dark variants are achieved by setting `theme` on preview frames, not by building separate light/dark components.
- Only one source component exists; theme switching is automatic via variable bindings.

---

## Design Source of Truth

The new design file (`design/new-design.pen`) is canonical. The input file (`design-do-no-edit/input-styled-but-incorrectly-constructed.pen`) is read-only reference for styled content extraction.

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

**Code alignment needed later** (not blocking design work):
- Rename `--dp-*` → `--libar-*` in `src/styles/tokens.css`
- Swap Bebas Neue → IBM Plex Sans, Outfit → Geist in CSS
- Update `#E8530E` → `#B06A3C` accent references

---

## Confirmed `.pen` Behaviors

From `docs-external/pencil-pen-format.md` + live testing:
- A component is reusable only when its root node has `reusable: true`.
- Reuse must be done through `type: "ref"` instances.
- Instance customization uses `descendants` overrides (not separate Update calls on copied nodes).
- Preview frames should contain only `ref` instances of source components (no detached copies).
- Theme is controlled at frame level via `theme` property.
- Document-level theme cannot be set via MCP tools — user must toggle in Pencil UI.
- **Source frames need `theme: {Mode: "Light"}` set** for `--libar-*` variables to resolve (they have no unthemed default value).
- **`replace_all_matching_properties` escapes `$` in "to" values** — creates `\$--var` instead of `$--var`, breaking variable references. Always use `batch_design` Update operations for variable binding.
- **`search_all_unique_properties` reports RESOLVED hex values**, not variable names — seeing hex values in the output does not mean they are hardcoded.

---

## Theme System

### Theme Axes (3 dimensions)
| Axis | Values | Default |
|---|---|---|
| **Mode** | Light, Dark | Light |
| **Base** | Neutral, Gray, Stone, Zinc, Slate | Neutral |
| **Accent** | Default, Red, Rose, Orange, Green, Blue, Yellow, Violet | Default |

### Rules
- Theme is set on frames, inherited by children.
- `--libar-*` variables are **Mode-aware only** (no Base/Accent overrides currently).
- Shadcn standard variables have full Base + Mode + Accent support.
- If Base variation is needed for `--libar-*`, add explicit Base values later.
- Preview frames: Light previews use `{"Mode": "Light"}`, Dark use `{"Mode": "Dark"}`.

---

## Atomic Design Layer Inventory

### Frame Map

| Layer | Source Frame (build here) | Light Preview | Dark Preview |
|---|---|---|---|
| **Foundations** | `foundations-source` (`Ws9eI`) | `foundations-preview-light` (`zigLI`) | `foundations-preview-dark` (`pwl07`) |
| **Atoms** | `atoms-source` (`LXK6E`) | `atoms-preview-light` (`gVjSI`) | `atoms-preview-dark` (`rdckn`) |
| **Molecules** | `molecules-source` (`1gYgt`) | `molecules-preview-light` (`7UNyL`) | `molecules-preview-dark` (`rCzHR`) |
| **Organisms** | `organisms-source` (`dehK6`) | — | `organisms-preview-dark` (`4jo2u`) |
| **Pages** | `page-landing-delivery-process-desktop-light` (`97uoV`), `page-landing-delivery-process-desktop-dark` (`DogW5`), `page-docs-overview-delivery-process-desktop-light` (`5BO2H`), `page-landing-delivery-process-mobile-light` (`vLqHF`) | — | — |

### Other Key Frames
| Frame | ID | Purpose |
|---|---|---|
| shadcn-design-system-components | `MzSDs` | 92 base components from Pencil template |
| page-landing-delivery-process-mobile-light | `vLqHF` | Mobile landing composition built from reusable molecule/atom refs |
| responsive-breakpoints | `xx0CO` | Visual breakpoint reference: 1200/1024/768/480/430 with behavior annotations |

### Layer Status

| Layer | Source Content | Preview Wiring | Notes |
|---|---|---|---|
| Foundations | 21-swatch color system (4 rows: brand, extended, core, code/dark) + 10-entry typography scale (52→11px with metadata labels) | Light + Dark working via refs | All swatches use variable references; typography shows all 3 font families with specs |
| Atoms | CTA Primary, CTA Secondary, DP Lettermark — **all variable-driven** | Light + Dark preview frames populated and working | Dark mode properly inverts via `$--libar-text-primary` / `$--libar-bg-page` variables |
| Molecules | Hero top nav/headline/body/CTA + code blocks — **all variable-driven** | Light + Dark preview frames populated | Multiline TypeScript/Gherkin/Bash + Bash single-line are active and tokenized with theme-aware syntax colors |
| Organisms | Docs Shell, Landing Hero, Show Dont Tell (desktop), Show Dont Tell (mobile) | Dark preview frame populated | Show section organism is reusable and wired into desktop + mobile landing pages |
| Pages | Desktop landing (light/dark), docs overview (light), mobile landing (light) | Active | All pages render correctly with variable-driven components |

---

## Foundations Components (Reusable)

Located in `Ws9eI` under `Foundations/Reusable Catalog` (`RLtJB`):
- **Foundations/Color Swatches** (`0eBi4`) — `reusable: true`
- **Foundations/Typography Scale** (`6TX6x`) — `reusable: true`

### Preview Wiring
- `zigLI` (light): Color Swatches (`Dk0eX`) → `ref: 0eBi4`, Typography Scale (`TBz38`) → `ref: 6TX6x`
- `pwl07` (dark): Color Swatches (`Yr24g`) → `ref: 0eBi4`, Typography Scale (`ZgElP`) → `ref: 6TX6x`

---

## Shadcn Component Catalog (92 components in `MzSDs`)

These are the base template components. Use as building blocks for libar custom components.

### Buttons (20)
| Name | ID | Variant |
|---|---|---|
| Button/Default | `VSnC2` | Regular |
| Button/Large/Default | `C3KOZ` | Large |
| Button/Secondary | `e8v1X` | Regular |
| Button/Large/Secondary | `gou6u` | Large |
| Button/Destructive | `YKnjc` | Regular |
| Button/Large/Destructive | `xPENL` | Large |
| Button/Outline | `C10zH` | Regular |
| Button/Large/Outline | `ghKmL` | Large |
| Button/Ghost | `3f2VW` | Regular |
| Button/Large/Ghost | `l7zpS` | Large |
| Icon Button/Default | `urnwK` | Regular |
| Icon Button/Large/Default | `ZIV1t` | Large |
| Icon Button/Secondary | `PbuYK` | Regular |
| Icon Button/Large/Secondary | `AWqtD` | Large |
| Icon Button/Destructive | `EsgLk` | Regular |
| Icon Button/Large/Destructive | `ilXCy` | Large |
| Icon Button/Outline | `hXOUF` | Regular |
| Icon Button/Large/Outline | `EXRaV` | Large |
| Icon Button/Ghost | `Sx6Z0` | Regular |
| Icon Button/Large/Ghost | `WReIy` | Large |

### Avatars & Badges (6)
| Name | ID |
|---|---|
| Avatar/Text | `DpPVg` |
| Avatar/Image | `HWTb9` |
| Badge/Default | `UjXug` |
| Badge/Secondary | `WuUMk` |
| Badge/Destructive | `YvyLD` |
| Badge/Outline | `3IiAS` |

### Form Inputs (12)
| Name | ID |
|---|---|
| Input Group/Default | `1415a` |
| Input Group/Filled | `uHFal` |
| Input/Default | `fEUdI` |
| Input/Filled | `AfQIN` |
| Select Group/Default | `w5c1O` |
| Select Group/Filled | `A4VOm` |
| Input OTP Group/Default | `02npo` |
| Input OTP Group/Filled | `rxp3e` |
| Textarea Group/Default | `BjRan` |
| Textarea Group/Filled | `CrS3L` |
| Combobox/Default | `cCfrk` |
| Combobox/Default (v2) | `LgAeW` |

### Controls (6)
| Name | ID |
|---|---|
| Switch/Checked | `c8fiq` |
| Switch/Unchecked | `fcMl6` |
| Radio/Selected | `LbK20` |
| Radio/Unselected | `D9Y8K` |
| Checkbox/Checked | `ovuDP` |
| Checkbox/Checked (v2) | `J7Uph` |

### Accordion & Alerts (4)
| Name | ID |
|---|---|
| Accordion/Open | `pfIN1` |
| Accordion/Open (ref) | `spbsy` |
| Alert/Default | `QyzNg` |
| Alert/Default (destructive) | `K53jF` |

### Data Display (9)
| Name | ID |
|---|---|
| Progress | `hahxH` |
| Breadcrumb Item/Ellipsis | `ctKFD` |
| Breadcrumb Item/Current | `FBqua` |
| Breadcrumb Item/Default | `KUk4t` |
| Breadcrumb Item/Separator | `3s95S` |
| Pagination Item/Ellipsis | `MqebB` |
| Table | `bG7YL` |
| Table Row | `LoAux` |
| Table Cell | `FulCp` |

### Dropdowns & Menus (7)
| Name | ID |
|---|---|
| Dropdown | `cTN8T` |
| List Divider | `D24KC` |
| List Title | `j3KBf` |
| List Item/Checked | `2JGXl` |
| List Item/Unchecked | `qamCY` |
| List Search Box/Filled | `I9z29` |
| List Search Box/Default | `O0rdg` |

### Cards & Containers (7)
| Name | ID |
|---|---|
| Card (base with slots) | `pcGlv` |
| Card Action | `PiMGI` |
| Card Plain | `fpgbn` |
| Card Image | `JENPq` |
| Dialog | `OtykB` |
| Tooltip | `lxrnE` |
| Tabs (with slot) | `PbofX` |

### Tabs (2)
| Name | ID |
|---|---|
| Tab Item/Active | `coMmv` |
| Tab Item/Inactive | `QY0Ka` |

### Typography & Tokens (7)
| Name | ID |
|---|---|
| Typo/Heading 1 | `iBI8f` |
| Typo/Body | `FsmrH` |
| Typo/Code | `bX6zR` |
| Token/Accent | `sCtCU` |
| Token/Bg Page | `FWaCC` |
| Token/Bg Surface | `gNbWe` |
| Token/Text Primary | `KjcLH` |

---

## Custom Libar Components (Reusable)

These are project-specific components built on top of shadcn.

**WARNING: Current molecules/organisms contain generic placeholder content from the shadcn template ("Active Rovers", "Solar Efficiency Pack", "1,280", etc.). These must be replaced with actual content from target pages during migration. See Design Principle #4 (Concrete over abstract).**

### Molecules (in `molecules-source` / `1gYgt`)
| Name | ID | Status | Notes |
|---|---|---|---|
| Molecule/Hero Top Nav | `qaKnr` | Active | Reused in desktop and mobile compositions; mobile hides non-essential controls via instance overrides |
| Molecule/Hero Headline Block | `7z5fL` | Active | Reused directly on mobile page with typography overrides |
| Molecule/Hero Body Inline Code | `4wjcz` | Active | Reused directly on mobile page |
| Molecule/Hero CTA Row | `Wy8sH` | Active | Reused on mobile page as vertical stack via instance overrides |
| Molecule/Code Block/Bash Single Line | `dNzrd` | Active | Reused on mobile page for install command |
| Molecule/Code Block/TypeScript | `oh1Ks` | Active | Multiline TypeScript block migrated from input Show section and used by docs + landing |
| Molecule/Code Block/Gherkin | `9U4KF` | Active | Multiline Gherkin block with theme-aware tag/keyword/plain colors |
| Molecule/Code Block/Bash | `7vqcw` | Active | Multiline Bash block for agent query examples |

### Organisms (in `organisms-source` / `dehK6`)
| Name | ID | Status | Notes |
|---|---|---|---|
| Organism/Docs Shell | `wUDp5` | Placeholder | Sidebar + content layout — structure OK, content placeholder |
| Organism/Landing Hero | `0Ue4C` | Active (desktop) | Desktop pages still use organism ref; mobile page now composes from lower-level refs |
| Organism/Show Dont Tell | `Ch7Iq` | Active | Main Show section (desktop/tablet), references TS/Gherkin/Bash multiline molecules |
| Organism/Show Dont Tell Mobile | `RHQQT` | Active | Mobile-optimized Show section, single-column stack |

### Page Frames (active)
| Name | ID | Content Frame | Status |
|---|---|---|---|
| `page-landing-delivery-process-desktop-light` | `97uoV` | `landing-content` (`J5Vib`) | Active (includes `showDontTell` ref `ZoA6G`) |
| `page-landing-delivery-process-desktop-dark` | `DogW5` | `landing-content` (`SYdA9`) | Active (includes dark `showDontTell` ref `4JiDw`) |
| `page-docs-overview-delivery-process-desktop-light` | `5BO2H` | `docs-overview-content` (`27cxo`) | Active (docs shell now renders migrated TypeScript code block from `oh1Ks`) |
| `page-landing-delivery-process-mobile-light` | `vLqHF` | `landing-content` (`edv8n`) | Active (includes `showDontTellMobile` ref `GjnQd`, no clipping) |

---

## Variable System

### Theme Axes
```
Mode: ["Light", "Dark"]
Accent: ["Default", "Red", "Rose", "Orange", "Green", "Blue", "Yellow", "Violet"]
Base: ["Neutral", "Gray", "Stone", "Zinc", "Slate"]
```

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

### Shadcn Standard Variables (19 + 8 sidebar)
Core: `--background`, `--foreground`, `--card`, `--card-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--accent`, `--accent-foreground`, `--muted`, `--muted-foreground`, `--popover`, `--popover-foreground`, `--border`, `--input`, `--ring`

Sidebar: `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-ring`

Static: `--black` (#000000), `--white` (#FFFFFF)

These have full Base + Mode + Accent overrides (see `get_variables` output for details).

---

## Input Design Reference (Read-Only)

**File:** `design-do-no-edit/input-styled-but-incorrectly-constructed.pen`
**Status:** DO NOT EDIT. Use only as visual reference for extracting designs into new-design.pen.
**Why incorrectly constructed:** Components were built as flat copies rather than proper `reusable: true` → `ref` instance hierarchy. Variable naming uses `--` prefix instead of `--libar-*`.

### Input Landing Page Sections (target for migration)

| Section | Light Frame ID | Dark Frame ID |
|---|---|---|
| Hero | `TYYB2` | `7ghMq` |
| Stats | `TxgPk` | `l39dJ` |
| Three Sessions | `ruj7g` | `z0Bzq` |
| Pipeline | `xp4Bv` | `djdNg` |
| B2 (Show Don't Tell / Code) | `VhuCT` / `BbLCw` | `kG9VC` / `6lVnn` |
| CTA Footer | `8eHO6` | `v5Tjv` |

### Input Docs Page Sections

| Section | Light Frame ID | Dark Frame ID |
|---|---|---|
| Docs Overview | `gx0ED` | `QezYJ` |

### Input Component Catalog (50 reusable)

**Landing components:**
`nOKxb` Pipeline Card, `Mhv0E` Stat Card, `HcJOw` Session Card, `HHCXG` CTA Primary, `9Wc06` CTA Secondary, `fskV5` Install Command, `EY2tq` Flow Tile, `Meycn` Flow Tile Dark, `Ww8rr` Footer Bar, `9bhLw` Section Alt, `SkKJz` Section Header, `ChA2s` Divider, `7ZT1W` Logo Mark, `0aPdJ` B2 Hover Compare, `867La` Status Tag

**Docs components:**
`PyqiJ` Explore Card, `Q0qkk` Capabilities Table, `FDWvO` Property Table, `G1Y4m` Page Nav Footer, `TfQ45` Top Nav Bar, `xOBDu` Sidebar, `atCvP` Diagram Container, `EDYlB` Section Heading, `jRVW5` Sidebar Group Label, `n3o5m` Sidebar Item/Active, `fX616` Sidebar Item/Default, `Ws3S4` Inline Code, `LpmqB` Tab Bar

**Code blocks:**
`pWB7u` Code Block (base), `V5GTG` TypeScript, `VeqED` Gherkin, `bonXq` Bash

**Typography (18):**
`qzrXz` Display (52px), `zVdol` CTA Heading (32px), `7c7DY` H1 (28px), `0Ozax` Page Title (28px), `Sd4bo` H2 (20px), `48ke3` H3 (18px), `TqqOK` H4 (16px), `YZHVi` Stat Number (56px), `5iggL` Eyebrow (12px), `DzIUZ` Body Large (18px), `OHSMU` Body (16px), `GXLNQ` Body Small (14px), `KHayX` Body XS (12px), `zydc4` Label (14px), `fPAxF` Button Label (13px), `9D37W` Tag (11px), `5g5DZ` Code (13px), `pYPdq` Table Header (11px)

### Input Variable Differences
| Input var | New design var | Notes |
|---|---|---|
| `--accent` | `--libar-accent` | Same value #B06A3C |
| `--bg-page` | `--libar-bg-page` | Same values |
| `--bg-surface` | `--libar-bg-surface` | Same values |
| `--text-primary` | `--libar-text-primary` | Same values |
| `--font-primary` | `--libar-font-primary` | Both IBM Plex Sans |
| `--font-body` | `--libar-font-secondary` | Both Geist |
| `--font-mono` | `--libar-font-mono` | Both JetBrains Mono |

Input also has variables not yet in new design: `--bg-section-alt`, `--bg-feature`, `--bg-code`, `--bg-code-block`, `--bg-code-inline`, `--text-on-dark`, `--text-on-dark-2`, `--sidebar-*` (8 vars), `--color-error/success/warning/info`, `--code-*` (9 syntax highlighting vars), `--radius-*`, all typography size vars, all letter-spacing vars.

---

## Landing Page Migration Tracker

| Section | Atomic Decomposition | New Design Status |
|---|---|---|
| **Hero** | Needs: display text, CTA buttons, install command, dp lettermark, paragraph text | Not started |
| **Stats** | Needs: stat card molecule, section header, eyebrow text | Done |
| **Three Sessions** | Needs: session card (numbered), status tag, section header | Not started |
| **Pipeline** | Needs: pipeline card, flow tile, section structure | Not started |
| **B2 / Show Don't Tell** | Needs: code block, tab bar, comparison layout, stat display | Main Show section migrated (desktop/dark/mobile). B2 compare strip intentionally deferred |
| **CTA Footer** | Needs: CTA heading, buttons, install command, footer bar, divider | Not started |
| **Docs Overview** | Needs: top nav, sidebar, explore cards, capabilities table, section heading | Not started |

### Migration Workflow Per Section
1. Open input design, screenshot the section (light + dark)
2. Identify all unique elements → map to atoms/molecules/organisms
3. Check if shadcn base components cover the element; if yes, use `ref` instance
4. If not, create custom reusable component in the appropriate layer source frame
5. Compose section as organism/template using refs
6. Add to Page frame, verify with screenshot
7. Update this tracker

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

**Live landing sections** (already coded, need design alignment later):
Hero, Metrics, Pipeline, CodeExamples, DataAPI, Workflows, Pillars, McpCallout, FooterCta
All in `src/components/landing/delivery-process/`

---

## Naming + Ownership Rules

- **Frame Naming Convention v1 (authoritative):**
- Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`
- No spaces, no uppercase, no punctuation (`/`, `—`, `:`).
- Layer source frames: `<layer>-source` (example: `molecules-source`)
- Layer preview frames: `<layer>-preview-<light|dark>` (example: `atoms-preview-dark`)
- Pages: `page-<page-name>-delivery-process-<desktop|mobile>-<light|dark>`
- Page content frames: `<page-name>-content` (example: `landing-content`, `docs-overview-content`)
- Scope: enforced on top-level layer/page frames and page content containers.
- Build/edit source components only in source frames (e.g., `foundations-source` (`Ws9eI`), `atoms-source` (`LXK6E`), `molecules-source` (`1gYgt`)).
- Use preview frames only to inspect theme variants — never edit content there.
- Preview frames must contain only `ref` instances of source components (no detached copies).
- If a component appears outside source/preview frames from copy testing, delete it.
- Keep component names stable to avoid reference churn.
- Name custom components with layer prefix: `Molecule/Search Bar`, `Organism/Hero Strip`, etc.

---

## Session Start Checklist

Run these before any design work:

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
3. `get_screenshot` on light + dark preview frames
4. Update this tracker's status tables

---

## Session History

### Session 1 (2026-02-22) — Foundations Setup
Done:
- Established source vs preview frame separation
- Validated frame-level light/dark behavior
- Confirmed Base sensitivity with core tokens
- Split foundations into separate reusable components (swatches and typography)
- Normalized previews to use only `ref` instances

### Session 2 (2026-02-22) — Full Inventory + Principles + Fixes
Done:
- Comprehensive review of both design files (new + input)
- Fixed 3 dark preview frames with wrong theme (rdckn, rCzHR, 4jo2u had Mode=Light → fixed to Mode=Dark)
- Fixed naming on 7UNyL ("Molecules - reusable system components" → "Molecules - system components - light preview")
- Created this expanded context tracker with full component catalogs
- Established design source of truth: new design canonical (IBM Plex Sans, Geist, #B06A3C, --libar-*)
- Inventoried all 92 shadcn + 10 custom components
- Documented all input design sections for migration
- Documented design aesthetic: Swiss Constructivist / Brutalist (from original moodboard)
- Added 5 design principles (simplicity, bottom-up, no decoration, concrete content, theme through variables)
- Flagged all placeholder content in molecules/organisms for replacement
- Identified page frame renaming needs (completed in Session 3)

### Session 3 (2026-02-22) — De-duplication + Naming Convention + Mobile Composition
Done:
- Removed non-page demo clutter and notes from the canvas (`j4hLC`, `b6D19`, `QGYHK`, `n2Hzx`, `nSNTs`, `TZ4am`, `6LMCW`)
- Removed duplicate decorative foundations board (`3Uddz`) and kept a single reusable catalog path (`RLtJB` -> `0eBi4` + `6TX6x`)
- Simplified foundations visuals (removed session labels/notes, reduced ornamental wrappers/padding/strokes)
- Applied scoped kebab-case naming to top-level layer/page frames and page content frames
- Rebuilt mobile page (`vLqHF`) from reusable refs (`qaKnr`, `7z5fL`, `4wjcz`, `dNzrd`, `Wy8sH`, `1cyxD`) instead of desktop organism ref
- Verified no layout problems globally and no layout problems in the mobile subtree

Open (prioritized):
1. **Begin landing page section migration** (Stats first — Hero already done)
2. **Replace placeholder content** in TypeScript code block with actual content from target pages
3. **Add remaining input variables** if needed during migration (`--bg-feature`, code syntax highlighting vars)
4. Populate additional Atoms/Molecules/Organisms previews with target-page refs as migration progresses

### Session 5 (2026-02-22) — Consolidation & Polish
Done:
- Added 7 new `--libar-*` variables: `bg-code`, `bg-code-surface`, `bg-section-alt`, `border-code`, `text-on-dark`, `text-on-dark-2`, `code-accent` (total: 21 libar vars)
- Migrated ALL atoms from hardcoded hex to variable references (CTA Primary, CTA Secondary, DP Lettermark)
- Migrated ALL molecules from hardcoded hex to variable references (Hero Top Nav was 100% hardcoded → now fully variable-driven)
- Set `theme: {Mode: "Light"}` on all 4 source frames (required for variable resolution)
- Fixed empty atoms preview frames — both light (`gVjSI`) and dark (`rdckn`) now populated with refs
- Expanded Color Swatches from 2 rows (8 swatches) to 4 rows (21 swatches): brand, extended, core shadcn, code/dark
- Expanded Typography Scale from 3 entries to 10 entries with metadata labels (52px Display → 11px Kbd)
- Added responsive breakpoints reference frame (`xx0CO`) with 5 progressive width bars (1200→430) and behavior annotations
- Resized all 12 source + preview frames from oversized (2500×3586) to content-fitted dimensions
- Verified dark mode renders correctly end-to-end (atoms → molecules → organisms → pages)
- Fixed all source frame backgrounds from hardcoded `#FFFFFF` to `$--libar-bg-surface`

Key findings:
- `replace_all_matching_properties` ESCAPES `$` in variable references (adds `\$`), breaking variable binding — use `batch_design` Update instead
- `search_all_unique_properties` always reports RESOLVED hex values, not variable names — seeing hex doesn't mean hardcoded
- Source frames need `theme: {Mode: "Light"}` set for libar variables to resolve (they have no default/unthemed value)

### Session 6 (2026-02-22) — Show Dont Tell Migration (Main Section)
Done:
- Added 12 libar variables for Show/code parity:
  - `--libar-bg-show-section`, `--libar-bg-code-block`, `--libar-font-size-code`
  - `--libar-code-comment`, `--libar-code-function`, `--libar-code-gherkin-keyword`, `--libar-code-gherkin-tag`
  - `--libar-code-keyword`, `--libar-code-plain`, `--libar-code-string`, `--libar-code-tag`, `--libar-code-type`
- Rebuilt multiline code molecules in `molecules-source-light`:
  - TypeScript `oh1Ks` (now active)
  - Gherkin `9U4KF`
  - Bash `7vqcw`
- Added reusable organisms in `dehK6`:
  - `Ch7Iq` Organism/Show Dont Tell
  - `RHQQT` Organism/Show Dont Tell Mobile
- Updated page composition refs:
  - Light desktop `97uoV/J5Vib`: `ZoA6G` (`showDontTell` -> `Ch7Iq`)
  - Dark desktop `DogW5/SYdA9`: `4JiDw` (`showDontTell` -> `Ch7Iq`, `theme: Dark`)
  - Mobile light `vLqHF/edv8n`: `GjnQd` (`showDontTellMobile` -> `RHQQT`)
- Updated dark preview frame `4jo2u` with Show section ref `LObyV`
- Docs page path validated:
  - `wUDp5/docsMainCode` still references `oh1Ks`; `5BO2H` now renders migrated TypeScript block
- Validation:
  - `snapshot_layout(problemsOnly:true)` reports no layout problems for `dehK6`, `4jo2u`, `97uoV`, `DogW5`, `vLqHF`, `5BO2H`

### Session 7 (2026-02-22) — Stats Section Migration
Done:
- Created `Molecule/Stat Card` and `Molecule/Section Header`.
- Constructed `Organism/Stats Section`.
- Composed Stats Section into `page-landing-delivery-process-desktop-light` and `page-landing-delivery-process-desktop-dark`.
- Verified layout structure, padding, and variable binding cleanly rendered in auto layout with full fidelity to input.

### Next Session Priorities
1. Migrate Sessions section: decompose input design Sessions (`ruj7g`/`z0Bzq`) into Session Card molecule
2. Migrate Pipeline section: decompose input design Pipeline (`xp4Bv`/`djdNg`) into Pipeline Card + Flow Tile molecules
3. Compose migrated sections into desktop page frames (light + dark)
4. Update migration tracker statuses
