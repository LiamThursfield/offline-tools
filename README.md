# Offline tools

Small, self-contained browser tools that work without an internet connection. Each tool is a single HTML file, so there's nothing to install or build. Open the file in a browser and it works. Your data stays on your machine.

The tools are also hosted at [tools.lxst.digital](https://tools.lxst.digital/).

## Tools

| Tool | What it does |
| --- | --- |
| [BPM tapper](bpm-tapper/) | Tap, click or press a key along to a song to find its tempo: average and recent BPM, consistency, half/double time, a per-tap chart and a beat counter. |
| [JSON diff](json-diff/) | Compare two JSON documents (or any text) structurally: changes by path, shared properties, JSON Patch, combinable field filters and saved comparisons. |

## Using a tool

Open the tool's `.html` file in any modern browser, by double-clicking it or dragging it into a browser window. No server is needed. `index.html` at the root links to every tool.

## Adding a tool

Each tool follows the same conventions so the collection stays easy to use and maintain:

- **One folder per tool**, named in kebab-case, containing a single `<tool-name>.html` file and a `README.md` covering the tool's features and usage. Add a row to the table above linking to the folder, a card to `index.html`, and a pair of rewrites to `_redirects` (see [Deployment](#deployment)).
- **Fully self-contained.** Inline all CSS and JS. No CDNs, web fonts, external requests or build step. The file has to keep working with no network.
- **No uploads.** Process all data in the browser. `localStorage` is for preferences such as the theme, and for user content only when the user explicitly saves it (for example JSON diff's saved comparisons). Never store user content silently.
- **Keep logic separate from the UI.** Put the core logic in its own `<script>` as pure functions with no DOM access, so it can be tested on its own (JSON diff exports it via `module.exports` when loaded in Node).
- **Responsive and accessible.** Make it usable at phone width, operable by keyboard and readable in both light and dark themes.
- **Shared header and footer.** Include the [shared snippets](#shared-snippets): the back link in the header and the footer at the end of `.wrap`. Copying the markers from an existing tool is the easiest way.

## Shared snippets

Some pieces are the same on every page: the back link to the index, the footer and their CSS. They live in `shared/`, and `scripts/sync-shared.mjs` copies them into every page between marker comments, so each page stays a single self-contained file:

```html
<!-- shared:footer.html -->
…replaced on every sync…
<!-- /shared:footer.html -->
```

CSS snippets use `/* shared:chrome.css */ … /* /shared:chrome.css */`. A page only gets the snippets it has markers for. For example, `index.html` has no back link.

After editing anything in `shared/`, run:

```
node scripts/sync-shared.mjs
```

and commit the updated pages. `--check` reports pages that are out of date without changing them. Don't edit the content between markers by hand, because the next sync overwrites it.

## Deployment

The repo root is deployed as-is to Cloudflare Workers ([static assets](https://developers.cloudflare.com/workers/static-assets/)) at [tools.lxst.digital](https://tools.lxst.digital/), with no build step. `wrangler.jsonc` configures it, and `.assetsignore` keeps repo files such as `.git` and the config itself from being served. Every push to `main` redeploys.

`_redirects` serves each tool at a short URL. For example, `/bpm-tapper` and `/bpm-tapper/` both serve `bpm-tapper/bpm-tapper.html`. A new tool needs the same two lines:

```
/my-tool   /my-tool/my-tool   200
/my-tool/  /my-tool/my-tool   200
```

The rewrite target has no `.html` because Cloudflare redirects `.html` URLs to their extensionless form. On the index page, links point at the `.html` file so they work when opened locally, and a small script swaps in the short URL (`data-path`) when the page is served over http(s).

To preview the deployed routing locally, run `npx wrangler dev` and open http://localhost:8787.

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
