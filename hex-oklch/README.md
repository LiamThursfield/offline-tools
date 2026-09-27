# Colour converter

Convert colours between CSS formats, adjust them in OKLCH, and check text contrast against WCAG, offline.

Open [`hex-oklch.html`](hex-oklch.html) in any modern browser.

## Input

Type or paste a colour into the *Colour* box, click the swatch to use the system colour picker, or use **Pick from screen** (browsers with the [EyeDropper API](https://developer.mozilla.org/docs/Web/API/EyeDropper_API), such as Chrome and Edge). **Random** (or <kbd>R</kbd>) picks a random colour that sRGB can show. It accepts:

| Syntax | Examples |
| --- | --- |
| Hex | `#2b4c7e`, `#2B4C7E`, `#fff`, `#0f08` (with alpha), `2b4c7e` (no `#`) |
| `rgb()` / `rgba()` | `rgb(43 76 126)`, `rgb(43 76 126 / 50%)`, `rgba(43, 76, 126, 0.5)`, `rgb(17% 30% 49%)` |
| `hsl()` / `hsla()` | `hsl(216 49% 33%)`, `hsl(0.6turn 49% 33%)`, `hsla(216, 49%, 33%, .5)` |
| `hwb()` | `hwb(216 17% 51%)` |
| `oklch()` | `oklch(0.42 0.1 258)`, `oklch(42% 25% 258deg / 0.5)` |
| `oklab()` | `oklab(0.42 -0.02 -0.1)` |
| CSS names | All 148 named colours, and `transparent` |
| Bare numbers | `43, 76, 126` or `43 76 126` (read as RGB) |

Hues take `deg`, `rad`, `grad` or `turn`, and `none` counts as 0. A CSS declaration such as `--ink: #1b2730;` or `color: red !important` works too, so you can paste a line straight from a stylesheet. `lab()`, `lch()` and `color()` aren't supported.

### Sliders

The sliders adjust the colour's OKLCH lightness, chroma and hue, and its alpha. Each track shows what the colour would become along it. Moving a slider rewrites the input in the syntax it was typed in (hex for a named colour), or as `oklch()` once the colour leaves sRGB, since the other syntaxes can't hold it. The hue is kept while chroma is 0, so you can take a colour to grey and back.

## Formats

**HEX**, **RGB**, **HSL**, **HWB**, **OKLCH** and **OKLab**, each with a copy button. The format you typed is highlighted.

- **Hex**: lower or upper case. Alpha adds a fourth byte (`#2b4c7e80`).
- **rgb() and hsl()**: modern space-separated syntax (`rgb(43 76 126 / 0.5)`) or the legacy comma syntax (`rgba(43, 76, 126, 0.5)`).
- **OKLCH** and **OKLab** use 4 decimals, or more for the few colours (about 1 in 1,300) where 4 would read back as a different hex code. A hue is only written when there's chroma, so greys are `oklch(0.5 0 0)`.
- **CSS name**: the named colour that matches exactly (all names, such as `aqua / cyan`), or the nearest one with its OKLab distance.
- **Luminance**: WCAG relative luminance, and the contrast against white and black.

### Out-of-gamut colours

`oklch()` and `oklab()` can describe colours that sRGB can't show. These are marked **Outside sRGB**. OKLCH and OKLab still show the exact value, while HEX, RGB, HSL and HWB show the closest sRGB colour, found with the [CSS Color 4 gamut-mapping algorithm](https://www.w3.org/TR/css-color-4/#gamut-mapping): chroma is lowered, keeping lightness and hue, until clipping to sRGB makes no visible difference.

## Contrast checker

Set a text and background colour by typing, with the swatches, or with **Use as text** / **Use as background** on the converter. **Swap** (or <kbd>X</kbd>) exchanges them.

The ratio follows [WCAG 2.2](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio): relative luminance in sRGB and `(L1 + 0.05) / (L2 + 0.05)`. It's shown truncated rather than rounded, since WCAG doesn't allow rounding up: 4.499:1 shows as 4.49:1 and fails 4.5:1. It's checked against:

| Level | Applies to | Needs |
| --- | --- | --- |
| AA | Normal text (1.4.3) | 4.5:1 |
| AA | Large text: 24px, or 18.67px bold (1.4.3) | 3:1 |
| AA | UI components and graphics (1.4.11) | 3:1 |
| AAA | Normal text (1.4.6) | 7:1 |
| AAA | Large text (1.4.6) | 4.5:1 |

Translucent text is blended over the background, and a translucent background over white. Out-of-gamut colours are gamut-mapped first.

When a pair fails AA or AAA, the checker suggests the closest text colour that passes: the same OKLCH chroma and hue (as far as sRGB allows) with the smallest change in lightness, in whichever direction is closer. Greys stay grey. Suggestions are checked after rounding to hex, so the value you copy really passes. Click one to use it.

The preview shows the pair as large, bold, normal and small text, a bordered button and an icon.

## Theme colours

This panel reads the colour tokens (`--bg`, `--ink`, `--accent`, …) of the site's own themes from `shared/themes.css` as inlined in the page, for the current theme or any other. Click a token to load it into the converter, where you can see and adjust it in OKLCH.

Below the tokens, a table scores the pairs the pages actually draw with: text, secondary text and accent text on the page, card and field backgrounds; text on accent buttons; the diff colours on cards (4.5:1); and the accent and border colours as UI colours (3:1). Click a row to open it in the contrast checker and try fixes. Use this when adding or changing a theme (see [Theming](../README.md#theming)).

## Settings

The hex case and rgb()/hsl() syntax are saved in this browser's `localStorage` (key `hex-oklch.settings`). Your colours aren't saved. Until you edit them, the starting colours (the theme's accent, and its text on its background) follow the theme picker.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `hex-oklch.html`. The colour logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseColor, formatOklch, formatHex, contrast, ratioStr, fixContrast } = require('./core.js');
formatOklch(parseColor('#ff0000'));                            // 'oklch(0.628 0.2577 29.23)'
formatHex(parseColor('oklch(0.7 0.3 150)'));                   // '#00c248' (gamut-mapped)
ratioStr(contrast(parseColor('#777'), parseColor('#fff')));    // '4.47'
formatHex(fixContrast(parseColor('#777'), parseColor('#fff'), 4.5));   // '#767676'
```
