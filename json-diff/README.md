# JSON diff

Compare two JSON documents in the browser, offline. If either side isn't valid JSON, the tool compares the two as plain text line by line, so Markdown and other text files work too.

Open [`json-diff.html`](json-diff.html) in any modern browser.

## Input

- Paste into box **A** (original) and box **B** (changed), use **Open file**, or drop a file onto either box.
- **Prettify** re-indents a side, and **Sort keys** sorts every object's keys alphabetically. Both can be undone with Ctrl/Cmd+Z.
- **Swap A ⇄ B** switches the two sides, and **Load example** fills both with sample data.

## Views

| Tab | Shows |
| --- | --- |
| **Line diff** | Unified or side-by-side text diff with highlighting within each line. Format as written, pretty-printed, or pretty-printed with sorted keys. Context lines are adjustable. |
| **All changes** | Every added, removed, changed and type-changed value, by path. Can be filtered by kind or path. |
| **Shared properties** | Paths present in both documents, as a table or a line diff. **Copy as Markdown** copies the table as a GitHub-flavoured Markdown table. |
| **Only in A / only in B** | Paths that exist on one side only. |
| **JSON Patch** | RFC 6902 operations that turn A into B. |

The structural tabs need valid JSON on both sides.

## Comparison options

- **Arrays**:
  - *compare by position*: element 0 against element 0, and so on.
  - *match objects by key*: pairs up objects in two arrays by a field such as `id`.
  - *ignore order*: compares arrays as unordered collections.
- **Ignore case in strings**: treats `"Foo"` and `"foo"` as equal.
- **Treat "1" and 1 as equal**: a string and a number with the same text count as equal.

## Field filters

Use **+ Only compare** and **+ Ignore** to add as many filters as you need. Filters apply **top to bottom, each one working on what the filters above it left**:

- **Only compare** keeps only the fields that match, so two of them narrow each other.
- **Ignore** removes the fields that match.
- **Commas inside one filter** mean *any* of those patterns.

For example, with the keys `aabbaa`, `aaccaa`, `aaddaa` and `bbddbb`:

| Filters | Result |
| --- | --- |
| *Only compare* `%a%` | `aabbaa`, `aaccaa`, `aaddaa` |
| *Only compare* `%a%` → *Only compare* `%b%` | `aabbaa` |
| *Only compare* `%a%, %b%` (one filter) | all four |
| *Only compare* `%a%` → *Ignore* `%c%` | `aabbaa`, `aaddaa` |

- **Match count:** each filter shows how many fields it matches in what's left at that step. The first filter counts across all of A and B, and each later filter counts only what the filters above left. It says **no matches** when nothing matches, which usually means a typo or an earlier filter that already removed those fields. Fields nested inside a matched field aren't counted again.
- **Turning filters on and off:** the checkbox turns a single filter off without deleting it. **Turn off** in the summary line turns off all of them.
- **Changing and removing:** the *Only compare* / *Ignore* toggle switches a filter's type, and **×** removes it.
- **Keyboard:** press Enter in a filter to add another filter of the same type.
- **Syntax help:** **Pattern syntax** opens a quick reference.

### Patterns

| Pattern | Matches |
| --- | --- |
| `updatedAt` | `updatedAt` at any depth |
| `$.meta` | `meta` at the root only (a leading `$` anchors the pattern to the root) |
| `items[*].id` | `id` in every element of any `items` array |
| `$.tags[0]` | the first element of the root `tags` array |
| `$["a\|b"]` | a key with special characters |
| `$.**.debug` | `debug` at any depth below the root |
| `%At` | any key ending in `At` (`updatedAt`, `createdAt`, …) at any depth |
| `%price%` | any key containing `price` |

Segments: `.name` or `["any key"]` for a key, `[3]` for an index, `*` or `[*]` for any single key or index, and `**` for any number of levels. Inside a key name, `%` matches any run of characters, like SQL `LIKE` (case-sensitive). Quoted keys are always literal, so `["50%"]` matches a key named `50%`.

- **Where it applies:** filters are applied to both documents before comparing, so every view reflects it. With the line diff set to *As written*, both sides are re-formatted, because the original text can't be filtered.
- **One-click ignore:** hover over a row in *All changes*, *Only in A / B* or the *Shared properties* table and click **ignore**. This adds that path to your last active *Ignore* filter, or creates one if there isn't one. Paths from key-matched arrays become `[*]`, so the field is ignored on every matched object.
- **Only compare filters:** array elements that are objects or arrays but contain no match are kept as `{}` / `[]`, so positions still line up. With *match objects by key*, the key field is always kept.

## Saving comparisons

**Saves** in the header (or ⌘/Ctrl+S) opens *Saved comparisons*. Give the comparison a name and save it, or load or delete an earlier one.

- **What's saved:** both inputs and their file names, every field filter (including ones switched off), the array, case and number options, and view settings (tab, line diff format and layout, context, wrap, shared-properties view, change-type chips and path search).
- **Overwriting:** names are unique, ignoring case and extra spaces. Typing an existing name shows a warning, and the button becomes **Overwrite…**. You then have to confirm with **Yes, overwrite**. Saving over the comparison you currently have open just updates it.
- **Unsaved changes:** the comparison you have open is shown under the heading. It's marked *unsaved changes* once the inputs, filters or options differ from the saved copy. View settings don't count as changes.
- **Guarding your work:** loading asks first if your current work isn't saved, and deleting always asks first.
- **⌘/Ctrl+S:** saves straight back to the open comparison, or opens the dialog if there isn't one.
- **Storage:** saves live in this browser's `localStorage` (key `json-diff.saves`). They're never uploaded, don't sync between browsers or devices, and are lost if you clear site data or use a private window. Browsers allow roughly 5 MB per site, and the dialog shows how much is in use.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `json-diff.html`. The comparison logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { structDiff, filterFields, parsePatterns } = require('./core.js');
```
