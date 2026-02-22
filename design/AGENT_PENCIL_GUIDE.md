# Agent Guide: Effectively Working with the Pencil Design System

This guide addresses common pitfalls and provides a robust workflow for AI agents working with Pencil (`.pen`) files, specifically focusing on document traversal, component instances, cross-file reading, and avoiding execution loops.

---

## 0. The Active Document Rule — Read This First

**The Pencil MCP server operates on the currently active document open in the Pencil editor.** This is the single most important thing to understand. It has two consequences that cause most agent failures:

### `filePath` does NOT switch the active file

When you pass `filePath: "design-do-no-edit/some-other-file.pen"` to `batch_get`, you are NOT reading that other file. The MCP server will still read from whichever `.pen` file is currently open in Pencil. The `filePath` parameter is used for context (e.g., to specify which open file to write to when multiple are open), but it does NOT cause Pencil to load a different file.

**Proof from a real failure:** An agent passed `filePath: "design-do-no-edit/input-styled-but-incorrectly-constructed.pen"` to `batch_get` but received nodes from `new-design.pen` (MzSDs, Ws9eI, LXK6E etc.) — the file that was actually open in Pencil.

### Always start every session with `get_editor_state`

```
get_editor_state(include_schema: false)
```

This tells you:
- Which `.pen` file is currently active
- The current user selection
- Other essential context

**NEVER call `batch_get` before calling `get_editor_state`.** If you skip this step, you risk reading the wrong file and spending many tool calls on IDs that don't exist in the active document.

### To read a non-active file, you must open it first

If you need to read nodes from a file that is NOT currently open (e.g., the read-only input design reference), you must:

1. `open_document("/absolute/path/to/other-file.pen")` — switches the active file
2. `batch_get(...)` — now reads from that file
3. `open_document("/absolute/path/to/working-file.pen")` — switch back

This is expensive and disruptive. Prefer using:
- The **CONTEXT_TRACKER_FOUNDATIONS.md** which documents key node IDs and visual structure
- `get_screenshot` on known node IDs to see visuals without re-opening files
- The section inventory in CONTEXT_TRACKER_FOUNDATIONS.md under "Input Design Reference"

---

## 1. Mastering `batch_get` (Search vs. Read)

The `batch_get` tool is your primary way to explore a `.pen` file, but its parameters are frequently misunderstood.

### `searchDepth` vs. `readDepth`

- **`searchDepth`**: Controls how deep the tool traverses the document tree *to find nodes matching your `patterns`*. If omitted, it searches the entire document (unlimited depth).
- **`readDepth`**: Controls how many levels of children are *returned in the JSON output* for the nodes that were found.

**CRITICAL ANTI-PATTERN:** If a search returns `[]` (empty array), **do NOT increase `readDepth` hoping to find the node.** Increasing `readDepth` only expands the output of *found* nodes. An empty result means nothing matched your pattern, or (more commonly) you are reading the wrong active file.

When a search returns `[]`:
1. First verify you are reading the correct file — call `get_editor_state`
2. If the file is correct, broaden your pattern (e.g., `.*CTA.*` instead of `.*Footer.*`)
3. If still empty, the node does not exist in this file

### Handling "No node with id" Errors

If you query specific `nodeIds` and receive `MCP error -32603: No node with id 'xyz'!`:

1. **Stop.** Do NOT retry the same ID.
2. Ask: is this ID documented as belonging to the currently active file, or a different file?
   - IDs in CONTEXT_TRACKER_FOUNDATIONS.md under "Custom Libar Components" → belong to `design/new-design.pen`
   - IDs in CONTEXT_TRACKER_FOUNDATIONS.md under "Input Design Reference" → belong to `design-do-no-edit/input-styled-but-incorrectly-constructed.pen`
3. If wrong file: use `get_editor_state` to confirm, then `open_document` to switch if necessary
4. If correct file: fall back to name search — `patterns: [{ name: ".*Expected Name.*" }]`

---

## 2. Understanding Component Instances (`ref` nodes)

Pencil uses a powerful component system. Master components have `reusable: true` and a `children` array. Instances of these components have `type: "ref"`.

**CRITICAL ANTI-PATTERN:** `ref` nodes do NOT have a `children` array in the raw file structure. They only have a `descendants` object that stores property overrides.

- If you read a `ref` node and see no children, **do NOT increase `readDepth`**. It will not reveal the children.
- **The Solution:** To see the fully expanded DOM structure of a component instance, pass `resolveInstances: true` in your `batch_get` call. This tells the MCP server to resolve the reference and inline the children.

---

## 3. Avoiding Execution Loops

AI agents often get stuck in loops when a tool doesn't return what they expect.

- **Never repeat the same tool call** if it failed or returned empty.
- **Never blindly increment parameters** (like counting `readDepth` from 1 to 12). This wastes tokens and time.
- **Never query the same ID in multiple files** hoping it will appear — IDs are file-specific and do not transfer between `.pen` files.
- If a component cannot be found by ID or Name after broadening the search and confirming the correct file, it does not exist. Move on or ask the user for clarification.

---

## 4. Working with Variables and Themes

- **Syntax:** Pencil variables are referenced using the `$--` prefix (e.g., `$--libar-accent`, `$--background`).
- **Resolution:** Variables are resolved based on the `theme` object set on parent frames (e.g., `theme: { Mode: "Dark" }`).
- **Applying:** When using `batch_design` to style elements, always use the variable string (e.g., `fill: "$--libar-bg-surface"`) rather than hardcoded hex values. Use `get_variables` to see the available tokens.
- **CRITICAL:** `replace_all_matching_properties` **escapes `$` in "to" values**, producing `\$--var` instead of `$--var`. Always use `batch_design` Update operations (`U()`) for variable references — never `replace_all_matching_properties` for this purpose.

---

## 5. Recommended Migration Workflow

When tasked with migrating or updating a design based on an older reference file:

**Step 0 — Verify active file:**
Call `get_editor_state` and confirm `design/new-design.pen` is the active document. If not, call `open_document` with the absolute path.

**Step 1 — Check CONTEXT_TRACKER_FOUNDATIONS.md first:**
Before touching any tool, read the tracker. It documents the visual structure of all sections in the input design (including un-migrated ones like CTA Footer and Docs Overview) so you can reconstruct them without needing to open the reference file.

**Step 2 — Only open the reference file if you need something not in the tracker:**
```
open_document("/Users/darkomijic/dev-projects/libar-dev-website/design-do-no-edit/input-styled-but-incorrectly-constructed.pen")
```
Then search by name: `patterns: [{ name: ".*CTA.*" }]`. Use `resolveInstances: true` to see the full structure of any `ref` nodes found.

**Step 3 — Switch back to the working file:**
```
open_document("/Users/darkomijic/dev-projects/libar-dev-website/design/new-design.pen")
```
Confirm with `get_editor_state` before proceeding.

**Step 4 — Rebuild in the working file:**
Use `batch_design` to recreate the structure. Insert standard frames/text with `I()`, or copy existing reusable components with `C()`.

**Step 5 — Apply variables:**
Replace any hardcoded hex values with `$--libar-*` variable references using `U()` operations.

**Step 6 — Verify:**
Run `snapshot_layout(parentId, problemsOnly: true)` then `get_screenshot` on the newly created section. Fix any issues before marking the section complete.

---

## 6. Frame Reference (`design/new-design.pen`)

Use these IDs as parent targets in `batch_get` and `batch_design`. All are in `design/new-design.pen`.

### Atomic Layer Source Frames

| Frame | ID | Purpose |
|---|---|---|
| `foundations-source-light` | `Ws9eI` | Color swatches + typography scale |
| `foundations-preview-dark` | `pwl07` | Dark preview — `ref` instances only, do not edit content |
| `atoms-source-light` | `LXK6E` | CTA buttons, lettermark, status tag |
| `atoms-preview-dark` | `rdckn` | Dark preview — `ref` instances only |
| `molecules-source-light` | `1gYgt` | Nav, hero blocks, code blocks, cards |
| `molecules-preview-dark` | `rCzHR` | Dark preview — `ref` instances only |
| `organisms-source-light` | `dehK6` | Full page sections |
| `organisms-preview-dark` | `4jo2u` | Dark preview — `ref` instances only |
| `shadcn-design-system-components` | `MzSDs` | 92 base shadcn components — query with `patterns: [{reusable: true}]` and `parentId: "MzSDs"` |

**Rule:** Only build/edit source components in `*-source-light` frames. Preview frames (`*-preview-dark`) contain only `ref` instances — never add or edit content there.

### Page Frames

| Frame | ID | Theme | Contents |
|---|---|---|---|
| `page-landing-delivery-process-desktop-light` | `97uoV` | Light | `landing-content` (`J5Vib`) → Hero → Stats → Show → Three Sessions → Pipeline |
| `page-landing-delivery-process-desktop-dark` | `DogW5` | Dark | `landing-content` (`SYdA9`) — same sections, dark theme |
| `page-docs-overview-delivery-process-desktop-light` | `5BO2H` | Light | `docs-overview-content` (`27cxo`) — Docs Shell placeholder |
| `page-landing-delivery-process-mobile-light` | `vLqHF` | Light | `landing-content` (`edv8n`) — Hero + Show Don't Tell (Stats/Sessions/Pipeline not yet added) |

### Other Frames

| Frame | ID | Notes |
|---|---|---|
| `Responsive Breakpoints` | `xx0CO` | 1200/1024/768/480/430px with behavior annotations |

### Key Custom Components (quick lookup)

For the full component catalog with descendant IDs, see `design/CONTEXT_TRACKER_FOUNDATIONS.md`.

| Component | ID | Layer |
|---|---|---|
| Atom/CTA Primary | `LXgRt` | Atoms |
| Atom/CTA Secondary | `KgJm8` | Atoms |
| Atom/DP Lettermark | `1cyxD` | Atoms |
| Atom/Status Tag | `FRO0v` | Atoms |
| Molecule/Hero Top Nav | `qaKnr` | Molecules |
| Molecule/Hero Headline Block | `7z5fL` | Molecules |
| Molecule/Hero CTA Row | `Wy8sH` | Molecules |
| Molecule/Code Block/Bash Single Line | `dNzrd` | Molecules |
| Molecule/Code Block/TypeScript | `oh1Ks` | Molecules |
| Molecule/Code Block/Gherkin | `9U4KF` | Molecules |
| Molecule/Code Block/Bash | `7vqcw` | Molecules |
| Molecule/Stat Card | `qfzUL` | Molecules |
| Molecule/Section Header | `Be3z5` | Molecules |
| Molecule/Session Card | `SFDoA` | Molecules |
| Molecule/Pipeline Card | `Zlret` | Molecules |
| Molecule/Flow Tile Default | `g8Ssu` | Molecules |
| Molecule/Flow Tile Feature | `rYsFJ` | Molecules |
| Organism/Landing Hero | `0Ue4C` | Organisms |
| Organism/Stats Section | `gn5FK` | Organisms |
| Organism/Three Sessions | `X5NMd` | Organisms |
| Organism/Pipeline Section | `F0qnF` | Organisms |
| Organism/Show Dont Tell | `Ch7Iq` | Organisms |
| Organism/Show Dont Tell Mobile | `RHQQT` | Organisms |
| Organism/Docs Shell | `wUDp5` | Organisms |

---

## 7. Session Start Checklist

Run these in order at the start of every session:

1. `get_editor_state(include_schema: false)` — confirm which file is active
2. `batch_get(filePath, patterns: [{reusable: true}])` — discover ALL existing components
3. `get_variables(filePath)` — read current variable values
4. Read `design/CONTEXT_TRACKER_FOUNDATIONS.md` — load section inventory and migration status

For new screens or major redesigns, also:
5. `get_guidelines(topic)` — load relevant rules (`landing-page`, `design-system`, `code`, or `tailwind`)
6. `get_style_guide_tags()` → `get_style_guide(tags)` — for visual inspiration

---

## 8. Quick Diagnostic: "Why am I getting wrong results?"

| Symptom | Likely Cause | Fix |
|---|---|---|
| `batch_get` returns nodes you didn't expect | Reading the wrong active file | Call `get_editor_state` to see which file is open |
| `[]` returned for a name search you're sure exists | Wrong active file OR node is nested deeper than `searchDepth` | Confirm file with `get_editor_state`; try `searchDepth: 10` |
| `No node with id 'xyz'` | ID belongs to a different file than the active one | Check CONTEXT_TRACKER to confirm which file owns this ID |
| `ref` node has no visible children | Expected — `ref` nodes store overrides in `descendants`, not `children` | Re-call with `resolveInstances: true` |
| Variable shows as hardcoded hex in `search_all_unique_properties` | Normal — that tool resolves variables to their computed values | Does NOT mean the value is hardcoded in the file |
