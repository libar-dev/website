# Pencil Design Session Prompt Template

Copy this prompt and append your task at the bottom. Replace bracketed sections as needed.

---

You are working on the `design/new-design.pen` Pencil design file for libar.dev — a documentation and marketing site for the `@libar-dev/` TypeScript ecosystem.

## Required Reading

Read these two files before calling any MCP tool:

1. `design/AGENT_PENCIL_GUIDE.md` — critical rules: active document behavior, frame IDs, anti-patterns, diagnostic table
2. `design/CONTEXT_TRACKER_FOUNDATIONS.md` — full context: design system specs, variable catalog, component inventory with descendant IDs, migration status

## Mandatory Session Start (in this order)

1. `get_editor_state(include_schema: false)` — confirm `design/new-design.pen` is the active file in Pencil. If it isn't, call `open_document("/Users/darkomijic/dev-projects/libar-dev-website/design/new-design.pen")` first.
2. `get_variables(filePath: "design/new-design.pen")` — confirm variable values before applying any styles
3. Check AGENT_PENCIL_GUIDE.md §6 Frame Reference for target frame IDs — do NOT call `batch_get` to rediscover frames that are already documented there

Do NOT skip these steps. Do NOT call `batch_get` before `get_editor_state`.

## Design System Quick Reference

| Property | Value |
|---|---|
| Aesthetic | Swiss Constructivist — sharp corners (radius: 0 everywhere), geometric, typographic |
| Display/label font | IBM Plex Sans |
| Body font | Geist |
| Code font | JetBrains Mono |
| Accent | `$--libar-accent` (#B06A3C warm bronze) |
| Variable prefix | `$--libar-*` for custom tokens, shadcn standard names for base tokens |
| Theming | Source frames: `theme: {Mode: "Light"}`. Dark previews: `theme: {Mode: "Dark"}` |
| Border radius | 0 everywhere — no exceptions |

## Non-Negotiable Rules

1. **Never hardcode hex values.** Always use `$--libar-*` or shadcn variable references.
2. **Never recreate an existing component.** Check the component table in AGENT_PENCIL_GUIDE.md §6 before inserting anything.
3. **Build only in source frames.** `*-source-light` frames are where components live. `*-preview-dark` frames are read-only `ref` instances.
4. **Verify after every section.** Call `snapshot_layout(parentId, problemsOnly: true)` then `get_screenshot` before moving to the next section.
5. **When IDs don't exist,** check AGENT_PENCIL_GUIDE.md §8 diagnostic table — do not retry the same query.
6. **Update CONTEXT_TRACKER_FOUNDATIONS.md** when a section's migration status changes.

---

## Task-Specific Context

<!-- Replace this section with your actual task -->

### Option A — New component or section

**What to build:** [describe the component or section]
**Target frame:** [e.g., `organisms-source-light` (`dehK6`)]
**Reference:** [e.g., input design frame `8eHO6` — CTA Footer light. See CONTEXT_TRACKER §Input Design Reference for visual notes.]
**Composed into pages:** [e.g., append to `landing-content` (`J5Vib`) in desktop light page (`97uoV`) and dark equivalent (`DogW5`)]

### Option B — Refinement / polish

**Frame(s) to refine:** [node IDs]
**What to fix:** [describe the issue — e.g., wrong variable, spacing, alignment]

### Option C — Transfer from input design

**Source frames in input design:** [light frame ID] / [dark frame ID]
**Input design file:** `design-do-no-edit/input-styled-but-incorrectly-constructed.pen` (read-only reference — do NOT edit)
**Target in new design:** [target frame ID]

Workflow:
1. Check CONTEXT_TRACKER §Input Design Reference for visual notes on the section
2. Only open the input design if you need to inspect structure not covered by the tracker:
   `open_document("/Users/darkomijic/dev-projects/libar-dev-website/design-do-no-edit/input-styled-but-incorrectly-constructed.pen")`
3. Read the section with `resolveInstances: true` to see the full structure
4. Switch back: `open_document("/Users/darkomijic/dev-projects/libar-dev-website/design/new-design.pen")`
5. Rebuild in new-design.pen using existing custom components and `$--libar-*` variables

---

## Task

[DESCRIBE YOUR SPECIFIC TASK HERE]
