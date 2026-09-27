# Offline tools

Small, self-contained browser tools that work without an internet connection. Each tool is a single HTML file, so there's nothing to install or build. Open the file in a browser and it works. Your data stays on your machine.

The tools are also hosted at [tools.lxst.digital](https://tools.lxst.digital/).

## Tools

<!-- shared:tool-table -->
| Tool | What it does |
| --- | --- |
| [BPM tapper](bpm-tapper/) | Tap, click or press a key along to a song to find its tempo: average and recent BPM, consistency, half/double time, a per-tap chart and a beat counter. |
| [Colour converter](hex-oklch/) | Convert colours between HEX, RGB, HSL, HWB, OKLCH and OKLab, adjust them with OKLCH sliders, map out-of-gamut colours into sRGB, and check text contrast against WCAG AA and AAA, with suggested fixes. |
| [Cron explainer](cron/) | Explain cron expressions in plain English and list their next run times in any time zone, with Unix crontab lines, seconds fields, Quartz and AWS EventBridge syntax (L, W, # and ?), shortcuts such as @daily, and daylight-saving changes. |
| [CSV ⇄ JSON converter](csv-json/) | Convert CSV to JSON and JSON to CSV, with delimiter detection, quoted fields and line breaks, number and boolean detection, nested objects as dotted columns, and a sortable, filterable table preview. |
| [Gzip helper](gzip/) | Compress text or files to gzip, zlib or raw deflate, and decompress them from a file, Base64 or hex, with header details (file name, date, OS), checksum checks and multi-member support. |
| [JSON diff](json-diff/) | Compare two JSON documents (or any text) structurally: changes by path, shared properties, JSON Patch, combinable field filters and saved comparisons. |
| [JSON formatter](json-format/) | Format, minify and validate JSON with exact error locations, repair common mistakes (comments, trailing commas, single quotes), browse it as a collapsible tree and query it by path. |
| [JWT decoder](jwt/) | Decode JSON Web Tokens without sending them anywhere: header and claims with explanations, exp, nbf and iat as readable dates, expired and not-yet-valid tokens flagged, security warnings, and signature checks for HS256, RS256, PS256, ES256 and EdDSA with a secret, PEM key, certificate or JWK. |
| [Metronome](metronome/) | A precise metronome from 20 to 300 BPM with sample-accurate Web Audio timing, 1 to 16 beats per bar, subdivisions (eighths, triplets, sixteenths), a clickable accent pattern with presets, tap tempo, three click sounds, and a bar counter. |
| [Regex tester](regex/) | Test JavaScript regular expressions with matches highlighted live as you type, capture groups (numbered and named) with their positions, a replacement preview with $1 and named group references, a plain explanation of every flag, and protection against runaway patterns. |
| [Text diff](text-diff/) | Compare two texts or files line by line, with changed words or characters highlighted, unified, side-by-side and inline views, options to ignore whitespace and case, and a patch you can copy or download. |
| [Timestamp converter](timestamp/) | Convert between Unix seconds, milliseconds, microseconds and nanoseconds, ISO 8601, RFC 2822 and dates in any time zone, in either direction, with a live clock and relative times such as “3 hours ago” or “in 2 days”. |
<!-- /shared:tool-table -->

## Using a tool

Open the tool's `.html` file in any modern browser, by double-clicking it or dragging it into a browser window. No server is needed. `index.html` at the root links to every tool.

## Adding a tool

Each tool follows the same conventions so the collection stays easy to use and maintain:

- **One folder per tool**, named in kebab-case, containing a single `<tool-name>.html` file and a `README.md` covering the tool's features and usage. Add it to `shared/tools.json` (slug, name, logo text, a short summary for the tool switcher and a description for the index; tools are listed alphabetically by name everywhere, so keep the file in that order too), add a pair of rewrites to `_redirects` in the same order (see [Deployment](#deployment)), then run the [sync script](#shared-snippets).
- **Fully self-contained.** Inline all CSS and JS. No CDNs, web fonts, external requests or build step. The file has to keep working with no network.
- **No uploads.** Process all data in the browser. `localStorage` is for preferences such as the theme, and for user content only when the user explicitly saves it (for example JSON diff's saved comparisons). Never store user content silently.
- **Keep logic separate from the UI.** Put the core logic in its own `<script>` as pure functions with no DOM access, so it can be tested on its own (JSON diff exports it via `module.exports` when loaded in Node).
- **Responsive and accessible.** Make it usable at phone width, operable by keyboard and readable in both light and dark themes.
- **Shared header, footer and themes.** Include the [shared snippets](#shared-snippets): `meta` near the top of the `<head>` (in place of a `<title>`), `theme.js` in a `<script>` in the `<head>`, `themes.css` and `chrome.css` in the styles, `brand` in the header in place of a logo, and `footer.html` at the end of `.wrap`. Copying the markers from an existing tool is the easiest way.

## Shared snippets

Some pieces are the same on every page: the `<head>` metadata, the themes, the header's tool switcher, the footer, the index cards and the table above. The script `scripts/sync-shared.mjs` copies them into every page between marker comments, so each page stays a single self-contained file:

```html
<!-- shared:NAME -->
…replaced on every sync…
<!-- /shared:NAME -->
```

CSS and JS use `/* shared:NAME */ … /* /shared:NAME */`. A page only gets the snippets it has markers for.

| Snippet | Source | Used in |
| --- | --- | --- |
| `meta` | Generated from `shared/tools.json` and `shared/favicon.png`: title, description, canonical URL, inline favicon, Open Graph/Twitter tags and JSON-LD | Top of every page's `<head>` |
| `theme.js` | `shared/theme.js`: theme list, saving and applying the theme | A `<script>` at the top of every page's `<head>` |
| `themes.css` | `shared/themes.css`: one block of base tokens per theme | Top of every page's `<style>` |
| `chrome.css` | `shared/chrome.css` | Every page's `<style>` |
| `footer.html` | `shared/footer.html`, footer plus the link, theme-picker and tool-switcher script | End of `.wrap` on every page |
| `brand` | Generated from `shared/tools.json`: logo and tool switcher | Every page's `<header>` |
| `tool-cards` | Generated from `shared/tools.json` | `index.html` |
| `tool-table` | Generated from `shared/tools.json` | This README |
| `sitemap` | Generated from `shared/tools.json` | `sitemap.xml` |

After changing anything in `shared/`, run:

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

### Search engines and link previews

The `meta` snippet gives each page its `<title>` (`Name – summary | LXST.tools`), a description (the tool's `description` from `shared/tools.json`), a canonical short URL, Open Graph and Twitter tags pointing at `og-image.png`, and JSON-LD (`WebApplication` for tools, `WebSite` for the index). The base URL is `SITE` in `scripts/sync-shared.mjs`. The favicon is inlined as a data URI so a saved page keeps its icon; `favicon.ico` at the root is the same icon for crawlers and browsers that request it directly. `robots.txt` points at `sitemap.xml`, whose URL list the sync script keeps up to date.

To preview the deployed routing locally, run `npx wrangler dev` and open http://localhost:8787.

## Theming

The tools share the look of [LXST.digital](https://lxst.digital/), and every page includes a theme picker. The choice is stored in `localStorage` under one key (`tools.theme`), so it carries across the index and every tool, and pages open in other tabs follow along. When the pages are opened as local files, whether they share storage depends on the browser (Chrome does; Firefox keeps each file separate).

Themes are CSS custom properties on `:root[data-theme="…"]`, defined once in `shared/themes.css`. A theme sets only a small set of base tokens:

| Token | Purpose |
| --- | --- |
| `--bg`, `--panel`, `--surface` | Page background, cards/panels, subtle fills |
| `--ink`, `--muted`, `--line` | Text, secondary text, borders |
| `--accent`, `--accent-ink`, `--accent-text` | Primary colour, text on it, accent-coloured text |
| `--del`, `--ins`, `--chg`, `--typ` | Semantic colours (removed, added, changed, type change) |
| `--tint`, `--tint-strong` | How strongly semantic colours tint backgrounds |
| `--shadow`, `--radius`, `--pill` | Card shadow, corner radius, button/badge radius |
| `--sans`, `--mono` | Font stacks |

Everything else, such as diff highlight backgrounds, hover states and focus rings, is derived from these with `color-mix()` in each page's CSS, so a new theme doesn't need to set it.

To add or change a theme:

1. Add or edit a `:root[data-theme="…"]{…}` block in `shared/themes.css`.
2. For a new theme, add `{ id: '…', label: '…' }` to the `THEMES` array in `shared/theme.js`. If it's based on someone else's theme, also add `credit: { name: '…', url: '…' }` (`url` is optional): while the theme is active, the footer credits it and links to it.
3. Run `node scripts/sync-shared.mjs` to copy the change into every page.

The `auto` entry follows the OS light/dark setting, using the ids named in its `light` and `dark` fields.

Included themes: **LXST dark**, **LXST light**, **Classic dark**, **Classic light** and **lock-wood** (based on the [lock-wood colour scheme](https://github.com/lock-wood/lock-wood-theme)). The default is **Auto**, which picks LXST dark or LXST light to match the OS.
