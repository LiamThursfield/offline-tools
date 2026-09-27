# Timestamp converter

Convert between Unix time, ISO 8601 and dates in any time zone, in either direction, offline.

Open [`timestamp.html`](timestamp.html) in any modern browser.

## Input

Type or paste into the *Timestamp* box. It works out what you gave it and shows the result as you type:

| Input | Examples | Notes |
| --- | --- | --- |
| **Unix time** | `1700000000`, `1700000000123`, `-86400`, `1700000000.5`, `@1700000000`, `1,700,000,000` | The unit is guessed from the number of digits: up to 11 digits is seconds, then milliseconds, microseconds and nanoseconds. Pick the unit under *Numbers are* if the guess is wrong (for example milliseconds from before March 1973). |
| **ISO 8601** | `2024-02-29T12:00:00Z`, `2024-06-01 09:30`, `2024-06-01T09:30:00.123456+05:30`, `2024-06-01` | A space works in place of the `T`. Fractions of a second keep up to 9 digits. `24:00:00` means the end of the day. Years outside 0000–9999 use the extended form, such as `+012024-01-01` or `-000001-06-01`. |
| **Relative** | `now`, `today`, `yesterday`, `tomorrow`, `in 90 minutes`, `3 days ago`, `2h 30m ago`, `+1 month`, `-2 weeks` | Relative input follows the clock, so the results keep updating. |
| **Other date strings** | `Tue, 14 Nov 2023 22:13:20 GMT`, `1 May 2024 12:00 GMT` | Anything else your browser's date parser understands, such as RFC 2822 and HTTP dates. |

Date-times with no offset (`2024-06-01 09:30`, `today`, `in 2 days`) are read in the zone under *Times without an offset are in*. It defaults to your zone.

Around daylight saving changes, a wall-clock time can be missing or happen twice. A missing time (`2024-03-31 01:30` in London) is moved forward by the length of the gap. A repeated time (`2024-10-27 01:30` in London) uses the first of the two, and the note under the input gives the second. This matches JavaScript's Temporal API (`disambiguation: "compatible"`).

In relative input, seconds, minutes and hours are exact. Days, weeks, months and years follow the calendar in the chosen zone, so `in 1 day` keeps the same clock time across a DST change, and one month after 31 January is the last day of February.

## Output

Every format has a **copy** button:

- **Unix** seconds, milliseconds, microseconds and nanoseconds. Negative times round down, as Unix time does, so −1.5 s is `-2` seconds. The row matching your input is highlighted.
- **ISO 8601** in UTC and in your zone, with its offset.
- **RFC 2822** (email headers) in your zone, and the **HTTP date** in GMT.
- **Readable**: the full date and time in your zone, in your browser's language.
- **Relative to now**: rounded (“3 hours ago”) and exact (“2 d 3 h 0 m 5 s ago”). It updates every second.
- **Calendar**: day of the week, ISO week (`2024-W09`) and day of the year.

## Now

The *Now* strip shows the current time as Unix seconds, milliseconds, ISO 8601 and local time, and updates live. Click any value to copy it. **Use now** (or **Now** in the header, or <kbd>N</kbd>) converts the current moment. Type `now` instead to keep following the clock.

## Time zones

The *Time zones* list shows the timestamp in each zone, with its abbreviation where the browser knows one, its UTC offset at that moment, and whether it's a different day from yours.

- **Convert from a zone**: change the date or time in any row. The input becomes that time with its offset (for example `2024-06-02T09:00:00+09:00`) and everything else updates. Fractions of a second in the current value are kept.
- **Add** a zone by IANA name (`Asia/Tokyo`), city (`tokyo`, `new york`) or anything else your browser accepts, such as `+05:30`. **×** removes one, and **Reset** restores the default list.

The zone list, the unit choice and the input zone are saved in this browser's `localStorage` (key `timestamp.settings`). Your timestamps are never saved.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>/</kbd> | Focus the input |
| <kbd>N</kbd> | Convert the current time |

## Range and precision

Times are held as whole nanoseconds, so microsecond and nanosecond input round-trips exactly. Time zone maths uses the browser's `Intl` API and its time zone database, and covers the range of a JavaScript `Date`: about 270,000 years either side of 1970. Unix time has no leap seconds, so `:60` is rejected.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `timestamp.html`. The parsing and formatting logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseTimestamp, toISO } = require('./core.js');
const r = parseTimestamp('2024-06-01 09:30', { zone: 'Europe/London' });
toISO(r.ns);                    // '2024-06-01T08:30:00Z'
toISO(r.ns, 'Asia/Tokyo');      // '2024-06-01T17:30:00+09:00'
```

`parseTimestamp(text, { unit, zone, now })` returns `{ ns, ms, kind, … }` (`ns` is a BigInt of nanoseconds since the epoch), `{ error }` or `{ empty: true }`.
