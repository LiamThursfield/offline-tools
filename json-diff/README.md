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

Use **+ Only compare** and **+ Ignore** to add as many filters as you need. Each filter holds one or more patterns separated by commas. Filters combine like this:

1. If there are any **Only compare** filters, a field is kept when it matches **any** of them.
2. **Ignore** filters then remove fields from what's left.

For example, *Only compare* `x, y, z` + *Only compare* `a%` + *Ignore* `b%` compares `x`, `y`, `z` and every key starting with `a`, minus any key starting with `b` inside them.

- **Match count:** each filter shows how many fields it matches across A and B, and says **no matches** when nothing does, which usually means a typo. Fields nested inside a matched field aren't counted again.
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

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `json-diff.html`. The comparison logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { structDiff, filterFields, parsePatterns } = require('./core.js');
```
