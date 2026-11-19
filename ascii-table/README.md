# ASCII table converter

Turn a table printed by a command-line tool into Markdown or CSV, offline.

Open [`ascii-table.html`](ascii-table.html) in any modern browser.

## Input

Paste into the *Input* box, drop a text file onto it, or use **Open file**. **Load example** cycles through four kinds of table.

Colour codes (ANSI escapes), non-breaking spaces and Markdown code fences (```` ``` ````) are removed before parsing.

### How columns are separated

**Auto** picks one of these. If most lines contain a `|` (or a box-drawing `│ ║ ┃`) it's **Borders**, if most contain a tab it's **Tabs**, otherwise **Spaces**. Pick one in the input's header to override it.

**Borders**: tables drawn with lines, such as:

- `+----+----+` tables (MySQL, cli-table, ascii-table, PrettyTable) and `.----.` / `'----'` corners
- box drawing (`┌─┬─┐`, `╔═╦═╗`, `┏━┳━┓`, Python's rich)
- psql output, which has no outer border
- Markdown tables. `\|` in a cell is kept as a `|`, and `:---:` alignment is carried over to the output.

Only the run of lines that make up the table is used, so a command above it (`mysql> SELECT …`) or a count below it (`(4 rows)`, `4 rows in set`) is left out, with a note.

Separator lines split the table into groups:

- A first group that is one cell spanning the whole table is its **title** (as cli-table and ascii-table print it).
- The next group is the **header** when a separator follows it.
- **Rows over several lines**: in tables that put a separator between every row, the lines between two separators are one row whose cells wrapped. **Auto** joins them (each column's parts with a space) when there's a separator between most rows, or when every extra line has some empty cells, as wrapped rows do. **Join** always joins them, **Keep** keeps every line as its own row.

**Spaces**: columns lined up with spaces, such as `docker ps`, `kubectl get`, `df` or `ls -l`. A column boundary is a position where every line has a gap. **Column gap** sets how wide a gap must be:

- **Auto**: two or more spaces, or one where the headings are one word apart (`Avail Capacity` in `df`). Then a column with no heading joins the one on its left, and so does a heading word with nothing under it (`Mounted on`, `NOMINATED NODE`).
- **1+ spaces**: any single-space gap. **2+ spaces**: only gaps of two or more.

A rule line with gaps in it (`=====  =====`, as in reStructuredText simple tables) gives the columns directly. Tabs are expanded to 8-column stops.

**Tabs**: one tab between cells, as when copying from a spreadsheet.

### Other options

- **First row is headers** (on): the first row names the columns. Off: every row is data.
- **Table**: when the input holds more than one table, pick one, or **All** to convert them all, one after another.

Rows and columns that are completely empty are dropped. Rows with fewer cells than the widest row are padded with blanks, with a note.

## Output

**Copy** copies the output and **Download** saves it as `.md` or `.csv`, named after the file or the table's title.

**Markdown** (GitHub-flavoured):

- **Line up columns**: pads cells so the Markdown text is readable as it is.
- **Right-align numbers**: columns that hold only numbers (`200`, `-3.5`, `1,024`, `45%`) get `---:`. A Markdown input's own alignment always wins.
- **Title above table**: the title, if there is one, in bold above the table.
- Without a header row, the columns are called *Column 1*, *Column 2*…, since Markdown tables need one.
- `|` is escaped as `\|`.

**CSV**: comma, semicolon, tab or pipe delimiter, and an optional header row. Fields are quoted only when they need it. The title isn't included.

## Columns found

The table at the bottom shows the rows and columns found, so you can check the columns were split where you expect. Number columns are right-aligned, and a hatched cell had nothing in the input.

## Settings

The options are saved in this browser's `localStorage` (key `ascii-table.settings`). Your data is never saved.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `ascii-table.html`. The parsing and conversion logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseText, toMarkdown, toCSV } = require('./core.js');
const { tables } = parseText('+---+---+\n| a | b |\n+---+---+\n| 1 | 2 |\n+---+---+');
toMarkdown(tables[0]);   // '|   a |   b |\n| --: | --: |\n|   1 |   2 |\n'
toCSV(tables[0]);        // 'a,b\n1,2\n'
```
