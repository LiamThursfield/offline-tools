# CSV ⇄ JSON converter

Convert CSV to JSON and JSON to CSV, offline, and check the result in a sortable table.

Open [`csv-json.html`](csv-json.html) in any modern browser.

## Input

Paste into the *Input* box, drop a file onto it, or use **Open file**. The format is worked out from the input: anything starting with `[` or `{` is JSON, everything else is CSV. Pick **CSV** or **JSON** in the input's header to override it. **Load example** fills in a small CSV that shows the tricky cases.

### CSV

The parser follows [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180):

- Quoted fields can hold the delimiter, line breaks and `""` for a literal quote.
- `\n`, `\r\n` and `\r` line endings all work, a leading byte order mark is ignored, and blank lines are skipped.
- It's forgiving. A stray quote inside an unquoted field is kept as text, text after a closing quote is kept (with a note), and a quote that's never closed takes the rest of the input as one value (with a note).

| Option | Default | What it does |
| --- | --- | --- |
| **Delimiter** | Auto | Comma, semicolon, tab or pipe. *Auto* picks the one that splits the first lines into the same number of fields most consistently, ignoring delimiters inside quotes. |
| **First row is headers** | on | The first row names the fields. Blank headers become `column_N`, and repeated ones get `_2`, `_3`… so every key is unique. Off: every row is data and the fields are `column_1`, `column_2`… |
| **Detect numbers and booleans** | on | `42`, `-3.5` and `1e3` become numbers, `true`/`false` (any case) become booleans, and `null` and empty cells become `null`. Numbers with a leading zero (`02134`) and numbers with more than 15 significant digits stay text, so postcodes, phone numbers and long IDs aren't changed. Off: every value is a string. |
| **Nest dotted headers** | off | Headers such as `address.city` build nested objects, and `tags.0`, `tags.1` build arrays. A header that clashes with another (`a` and `a.b`) stays flat. |

Rows with fewer values than the header get `null` (or `""` with type detection off) for the missing ones. Values beyond the header go in `column_N` fields. Either way there's a note listing the lines.

### JSON

Standard JSON, or [JSON Lines](https://jsonlines.org/) (one value per line) if the whole text doesn't parse as one document. Errors show the line and column.

- **An array of objects** gives one row per object, with a column for every key found, in the order they first appear. Objects without a key leave that cell empty.
- **An array of arrays** is taken as rows as they are. No header row is added, so `[["name","age"],["Ada",36]]` becomes `name,age` / `Ada,36`.
- **A single object** is one row. **Plain values** (strings, numbers) go in a `value` column.

**Nested values** chooses how nested objects and arrays become columns: **Columns (a.b)** gives one column per nested field (`address.city`, `tags.0`), which *Nest dotted headers* turns back into the same JSON. **JSON text** keeps one column per top-level field and writes nested values as JSON. Empty objects and arrays are always written as `{}` and `[]`.

## Output

**Copy** copies the output. **Download** saves it as `.json` or `.csv`, named after the input file. **Swap** makes the output the input, to convert it back.

JSON output:

- **Objects**: an array with one object per row. **Arrays**: an array with one array per row, the header row first.
- Indent with 2 spaces, 4 spaces or a tab, or **Minify**.

CSV output:

- **Delimiter**: comma, semicolon, tab or pipe.
- **Header row**: the column names as the first line.
- **LF** or **CRLF** line endings. RFC 4180 specifies CRLF; most tools accept either.
- Fields are quoted only when they need it (they hold the delimiter, a quote, a line break, or start or end with a space). **Quote every field** quotes them all.
- **BOM for Excel** adds a byte order mark to downloads, so Excel reads accented characters as UTF-8. Copied text never has one.

## Table

The table shows the data being converted: the CSV rows, or the rows the JSON becomes. Each heading shows the kind of values in the column (`number`, `text`, `bool`, `mixed` or `empty`).

- **Sort**: click a heading to sort by that column, again to reverse, and a third time to go back to the original order (or use **Original order**). Numbers sort numerically and text in natural order (`item 2` before `item 10`). Empty and `null` cells always go last. The `#` column is each row's original position.
- **Filter**: shows only rows with a cell that contains the text, ignoring case.
- `null` is shown in italics, and a hatched cell means the row had no value there at all.
- Up to 500 rows are shown at a time; **Show more** adds 500 more.

Sorting and filtering only change the table, not the output.

## Settings

The options are saved in this browser's `localStorage` (key `csv-json.settings`). Your data is never saved.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `csv-json.html`. The parsing and conversion logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseCSV, csvToJSON, parseJSONInput, jsonToTable, toCSV } = require('./core.js');
const { rows } = parseCSV('id,address.city\n1,"Bristol, UK"');
csvToJSON(rows, { nested: true }).value;   // [{ id: 1, address: { city: 'Bristol, UK' } }]
toCSV(jsonToTable(parseJSONInput('[{"a":{"b":1}}]').value));   // 'a.b\n1\n'
```
