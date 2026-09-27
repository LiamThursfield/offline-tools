# Regex tester

Test a JavaScript regular expression against some text, offline: matches are highlighted as you type, with their capture groups, a replacement preview and an explanation of every flag.

Open [`regex.html`](regex.html) in any modern browser.

## Pattern

Type the pattern between the slashes and the flags after them, or turn flags on with the buttons underneath. The pattern is coloured as you type: escapes, character classes, quantifiers and anchors each have a colour, and each capture group's brackets take that group's colour, which is used for it everywhere else on the page.

- **Paste a literal** such as `/ab+c/gi` into an empty (or fully selected) pattern box to fill in the pattern and the flags together.
- A line break in the pattern is written as `\n`.
- If the pattern isn't valid, the browser's error is shown under it.
- **Copy** copies the pattern as a regex literal (`/…/flags`); **new RegExp(…)** copies it as a constructor call with the string escaped.

The patterns are JavaScript's, run by your browser's own engine, so what matches here matches in your code. Newer syntax, such as the `v` flag, duplicate group names in different alternatives or `(?i:…)` modifiers, works if your browser supports it.

### Notes

Under the pattern, notes point out the things that commonly catch people out, but only when they change the result:

- Without `g`, only the first match is found (and how many there would be with it).
- `^` and `$` match only at the start and end of the whole text unless `m` is on.
- `.` doesn't match line breaks unless `s` is on.
- Without `u` or `v`, `\p{…}` and `\u{…}` don't mean what they look like, and a match can split an emoji in half.
- What `y` (sticky) does to the search.
- Empty matches, which are shown as thin markers.

## Test string

Every match is highlighted in the text, in alternating shades so that neighbouring matches stay apart. Inside a match, each capture group is tinted and underlined in its colour; where groups nest, the innermost one shows. Groups captured inside a lookaround can reach outside their match, and are shown where they are.

## Matches

Each match with its position, and a row for every capture group: its number, its name if it has one, what it captured and where. A group that didn't take part in the match (such as the unused side of `(a)|(b)`) says so, which is different from a group that matched an empty string. Line breaks and tabs are shown as `↵` and `⇥`.

Positions count UTF-16 code units from 0, as `match.index` does in JavaScript. Hover over or focus a match to outline it in the text and the result, and click it to select it in the text. The first 200 matches are listed, with a button for more; the search stops after 10,000 matches. **Copy all** copies every match, one per line.

## Replace

Type a replacement to preview the result, with each replaced part highlighted:

| Token | Inserts |
| --- | --- |
| `$1` … `$99` | What that group matched (nothing if it didn't take part) |
| `$<name>` | What that named group matched |
| `$&` | The whole match |
| `` $` `` / `$'` | The text before / after the match |
| `$$` | A literal `$` |

These follow `String.prototype.replace` exactly, including its edge cases: `$0` stays as it is, and `$10` with only one group is group 1 followed by `0`. The tokens are coloured in the replacement box, and a `$<name>` that doesn't match any group is greyed out.

**Replace** shows the whole text with the matches replaced (an empty replacement removes them). **List** shows each match on its own line, formatted with the replacement, or the matches themselves if the replacement is empty. **Copy result** copies either.

## Flags

The Flags card explains each flag and turns it on or off:

| Flag | Name | What it does |
| --- | --- | --- |
| `g` | global | Find every match, not only the first |
| `i` | ignoreCase | Match letters in either case |
| `m` | multiline | `^` and `$` match at every line |
| `s` | dotAll | `.` matches line breaks too |
| `u` | unicode | Code points instead of UTF-16 units; `\u{…}` and `\p{…}` |
| `v` | unicodeSets | Everything `u` does plus set operations and nested classes; can't be combined with `u` |
| `y` | sticky | Each match must start where the last one ended |
| `d` | hasIndices | Records group positions; always used internally, so it only changes the copied code |

Flags the browser doesn't support are disabled.

## Runaway patterns

Some patterns, such as `(a+)+$` on a long run of `a`s that doesn't end the way it expects, take practically forever to fail (catastrophic backtracking). The regex runs in a Web Worker, so the page stays responsive, and it's stopped after 2 seconds with a note saying why. If the browser won't start a worker, the regex runs on the page instead, without that protection.

## Privacy

Nothing is saved or sent anywhere: the pattern, text and replacement are gone when you close the page. Only the theme is kept in `localStorage`.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>/</kbd> | Focus the pattern |

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `regex.html`. The matching, replacement and pattern-reading logic is in the `<script id="core">` block as pure functions with no DOM access; the page runs that same script in the worker. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { runRegex, parseReplacement, scanPattern } = require('./core.js');
const r = runRegex({ pattern: '(?<y>\\d{4})-(\\d\\d)', flags: 'g', text: '2026-09 and 1999-12', replacement: '$2/$<y>' });
r.matches.map(m => m.text);   // [ '2026-09', '1999-12' ]
r.matches[0].groups;          // [ { v: '2026', s: 0, e: 4 }, { v: '09', s: 5, e: 7 } ]
r.names;                      // [ 'y', null ]
r.output;                     // '09/2026 and 12/1999'
```

`runRegex({ pattern, flags, text, replacement, mode })` returns `{ error }` or `{ matches, truncated, total, groupCount, names, output, pieces, notes, ms }`. `mode` is `'replace'` or `'extract'`. The output matches `String.prototype.replace` for the same pattern, flags and replacement.
