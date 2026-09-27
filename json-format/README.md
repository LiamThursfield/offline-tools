# JSON formatter

Format, validate and explore JSON in the browser, offline.

Open [`json-format.html`](json-format.html) in any modern browser.

## Input

- Paste into the **Input** box, use **Open file**, or drop a file onto it.
- The badge shows whether the input is **valid JSON**, **repaired** (see below) or **invalid**.
- **Format input** (<kbd>Shift</kbd> <kbd>Alt</kbd> <kbd>F</kbd>) replaces the input with the formatted JSON, using the output settings. Undo it with Ctrl/Cmd+Z.
- <kbd>Tab</kbd> in the input inserts two spaces.

### Errors

When the input isn't valid, the error shows the line and column, a short reason (such as *Trailing comma: remove the comma before }* or *Line break inside a string*) and the line with a caret under the problem. **Go to error** selects that spot in the input. While there's an error, the output keeps showing the last valid version, dimmed.

### Fixing common mistakes

With **Fix common mistakes** on (the default), input that isn't strict JSON is repaired when possible. The output is always valid JSON. The note under the input says where a strict parser would stop and lists each kind of repair, with a link to the first one:

| Repaired | Example |
| --- | --- |
| Comments | `// …` and `/* … */` |
| Trailing commas | `[1, 2,]` |
| Missing commas | `{"a": 1 "b": 2}` |
| Single and curly quotes | `{'a': 'b'}`, `{“a”: “b”}` |
| Unquoted property names | `{name: "x"}` |
| Python and JavaScript literals | `True`, `False`, `None`, `undefined` become `true`, `false`, `null`, `null` |
| `NaN` and `Infinity` | become `null` |
| Non-standard numbers | `+1`, `.5`, `5.`, `007`, `0x1F` |
| Raw tabs and invalid escapes in strings | `"a<tab>b"`, `"it\'s"` |
| Non-breaking and zero-width spaces | often pasted in from documents or chat apps |
| Several values in a row | JSON Lines / NDJSON become an array |

A raw line break inside a string is never repaired, because it almost always means a missing closing quote.

### Faithful output

The tool has its own parser instead of `JSON.parse`, so:

- **Numbers keep their digits.** `9007199254740993` stays `9007199254740993`, where `JSON.parse` would round it to `…992`. The footer counts integers like this.
- **Duplicate keys are kept.** A warning lists them, since most parsers keep only the last one.

## Output

| View | Shows |
| --- | --- |
| **Formatted** | The JSON with syntax highlighting and line numbers. Very large output (over 1.5 million characters) is shown without highlighting. |
| **Tree** | A collapsible tree. Hover over a row for **path** (copies its path, such as `$.hours[0].day`) and **copy** (copies its value). **Expand all** opens up to 5,000 rows. Large arrays and objects show 200 children at a time. The tree keeps which nodes are open while you edit. |

Settings:

- **2 spaces**, **4 spaces**, **Tab** or **Minify**.
- **Sort keys**: sorts every object's keys alphabetically.
- **Escape non-ASCII**: writes characters outside ASCII as `\u` escapes.

Buttons:

- **Copy** copies the output.
- **Copy as string** copies it as one quoted, escaped JSON string, ready to paste into code or another JSON value.
- **Download** saves it as `<file name>.json` (with `.min` or `.query` added when minified or filtered).

If the input is a JSON string that itself contains JSON (for example `"{\"a\":1}"`), a note offers to **Decode it**.

The footer shows counts of keys, objects, arrays and values, the nesting depth, and the input and output sizes.

## Query

Type a path in **Query** to show only part of the document. Copy, download and the tree then work on the result.

| Query | Gives |
| --- | --- |
| `$.address.city` | a nested value (the `$` is optional) |
| `items[0]`, `items[-1]` | the first and last element |
| `items[*].id` | `id` of every element |
| `$.*` | every top-level value |
| `..id` | `id` at any depth |
| `$["a key"]` | a key with spaces or special characters |

A path without `*` or `..` gives that single value. With them, you get an array of every match, and the tree labels each match with its path. <kbd>Esc</kbd> clears the query.

## Settings and privacy

The input is never stored. The theme and the output settings are saved in `localStorage` (keys `json-format.theme` and `json-format.settings`).

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `json-format.html`. The parser, formatter and query logic are in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseText, serialize, parseQuery, runQuery } = require('./core.js');
const r = parseText("{a: 1, // note\n 'b': [1, 2,]}");
r.repaired;                              // true
serialize(r.root, { indent: '' });       // '{"a":1,"b":[1,2]}'
```
