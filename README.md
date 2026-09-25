# Offline tools

Small, self-contained browser tools that work without an internet connection. Each tool is a single HTML file, so there's nothing to install or build and nothing to host. Open the file in a browser and it works. Your data stays on your machine.

## Tools

| Tool | What it does |
| --- | --- |
| [JSON diff](json-diff/json-diff.html) | Compare two JSON documents (or any text): line diff, every structural change, shared properties (copyable as a Markdown table), what's only in A or B, and an RFC 6902 JSON Patch. Ignore fields or compare only some of them using path patterns such as `updatedAt` or `items[*].id`. |

## Using a tool

Open the tool's `.html` file in any modern browser, by double-clicking it or dragging it into a browser window. No server is needed.

## Adding a tool

Each tool follows the same conventions so the collection stays easy to use and maintain:

- **One folder per tool**, named in kebab-case, containing a single `<tool-name>.html` file. Add a row to the table above.
- **Fully self-contained.** Inline all CSS and JS. No CDNs, web fonts, external requests or build step. The file has to keep working with no network.
- **No uploads.** Process all data in the browser. Use `localStorage` only for preferences such as the theme, never for user content.
- **Keep logic separate from the UI.** Put the core logic in its own `<script>` as pure functions with no DOM access, so it can be tested on its own (JSON diff exports it via `module.exports` when loaded in Node).
- **Responsive and accessible.** Make it usable at phone width, operable by keyboard and readable in both light and dark themes.

## Theming

The tools share the look of [LXST.digital](https://lxst.digital/), and every tool includes a theme picker. Theme choice is stored per tool in `localStorage`.

Themes are CSS custom properties on `:root[data-theme="…"]`. A theme sets only a small set of base tokens:

| Token | Purpose |
| --- | --- |
| `--bg`, `--panel`, `--surface` | Page background, cards/panels, subtle fills |
| `--ink`, `--muted`, `--line` | Text, secondary text, borders |
| `--accent`, `--accent-ink`, `--accent-text` | Primary colour, text on it, accent-coloured text |
| `--del`, `--ins`, `--chg`, `--typ` | Semantic colours (removed, added, changed, type change) |
| `--tint`, `--tint-strong` | How strongly semantic colours tint backgrounds |
| `--shadow`, `--radius`, `--pill` | Card shadow, corner radius, button/badge radius |
| `--sans`, `--mono` | Font stacks |

Everything else, such as diff highlight backgrounds, hover states and focus rings, is derived from these with `color-mix()`, so a new theme doesn't need to set it.

To add a theme:

1. Copy an existing `:root[data-theme="…"]{…}` block in the tool's CSS and give it a new id.
2. Add `{ id: '…', label: '…' }` to the `THEMES` array in the tool's `<head>` script.

The `auto` entry follows the OS light/dark setting, using the ids named in its `light` and `dark` fields.

Included themes: **LXST dark**, **LXST light**, **Classic dark** and **Classic light**. The default is **Auto**, which picks LXST dark or LXST light to match the OS.
