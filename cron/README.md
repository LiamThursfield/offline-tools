# Cron explainer

Explain a cron expression in plain English and list when it runs next, offline.

Open [`cron.html`](cron.html) in any modern browser.

## Input

Type or paste an expression into the *Cron expression* box. Each field is shown under the box with its name, and an invalid field is highlighted with the reason. It accepts:

| Input | Examples |
| --- | --- |
| Unix cron (5 fields) | `*/15 9-17 * * 1-5`, `0 0 1 * *`, `5 4 * * sun` |
| Unix cron with seconds (6 fields) | `*/10 * * * * *`, `0 0 9 * * MON-FRI` (Spring, node-cron, croner) |
| Quartz (6 or 7 fields) | `0 0 12 ? * 6L`, `0 15 10 ? * MON#1 2027` |
| AWS EventBridge (6 fields) | `cron(0 18 ? * MON-FRI *)`, `0 12 * * ? *` |
| Shortcuts | `@yearly` (`@annually`), `@monthly`, `@weekly`, `@daily` (`@midnight`), `@hourly`, `@reboot` |
| Crontab lines | `0 9 * * 1 /usr/bin/backup.sh`: the command is shown separately |
| Pasted config | `- cron: '0 9 * * 1'` (GitHub Actions), `schedule: "0 9 * * *"`, quotes |
| A time zone | `CRON_TZ=Europe/London 0 9 * * *` (or `TZ=`) sets the zone for the runs |

Month and day names (`JAN`, `mon`, `Monday`) work in any case. Ranges, lists and steps combine as usual: `1,15`, `9-17`, `*/15`, `5/15` (every 15 from 5), `9-17/2`.

### Dialects

The dialects differ in their fields and in how they number the days of the week, so the same expression can mean different things:

| Dialect | Fields | Day of week | Extras |
| --- | --- | --- | --- |
| **Unix** | [second] minute hour day month weekday | 0–7, 0 and 7 are Sunday | A command after the fields |
| **Quartz** | second minute hour day month weekday [year] | 1–7, 1 is Sunday | `?` needed in one day field, wrapping ranges (`22-2`) |
| **AWS** | minute hour day month weekday year | 1–7, 1 is Sunday | `?` needed in one day field |

**auto** picks the dialect from the input: `cron(…)` is AWS; with six fields, a `?` in the third or fifth field means AWS and in the fourth or sixth means Quartz; seven fields means Quartz; anything else is Unix, where six fields means a leading seconds field. When the guess affects what numbered weekdays mean, a note says so. Pick a dialect to override it.

`L` (last), `W` (nearest weekday), `#` (nth weekday) and `?` work in every dialect, since many Unix-style libraries support them, but a note points out that standard crontab doesn't.

## In plain English

The sentence covers the whole schedule, for example *Every 15 minutes, between 09:00 and 17:59, on weekdays* or *At 12:00, on the last Friday of the month*. **Clock** switches between 24-hour and 12-hour times. Below it, notes flag the things that commonly catch people out:

- **Both day fields set.** In Unix cron, `0 9 1-7 * 1` runs on the 1st to the 7th *and also* on every Monday, not only on Mondays in the first week. If either day field starts with `*` (such as `*/2`), both have to match instead. This is Vixie cron's rule, which cronie on Linux follows.
- **Days some months don't have.** `0 0 31 * *` skips months without a 31st, and `0 0 30 2 *` never runs.
- **Non-standard syntax** in Unix cron: `L`, `W`, `#`, `?` and a seconds field.
- **AWS time zones.** EventBridge rules run in UTC.

The table breaks the expression down field by field, with each field's meaning and the values it matches.

## Next runs

The next 5 to 250 run times, grouped by day, with how long until each one and the gap since the one before. Times are in your time zone unless you pick another, or the expression sets one with `CRON_TZ=`. **From** lists the runs after another date and time (in that zone); **Now** goes back to the current time, and the list then moves on as runs pass. Click a run to copy it as ISO 8601 with its offset, or use **Copy all**.

If there are no more runs (the year field has ended, or the schedule can't happen), the list says so. The search looks up to 400 years ahead, so a run on 29 February that must also be a Monday is still found.

### Daylight saving

When the clocks change, runs follow cronie, the usual Linux cron:

- A time the clocks skip (01:30 when they go from 01:00 to 02:00) runs once, straight after the change.
- A time that happens twice (01:30 when they go back from 02:00 to 01:00) runs only the first time.
- Jobs whose hour field starts with `*` go by real time instead: they skip the missing hour and run in both copies of a repeated one.

Runs affected by a change are marked. Other schedulers (Quartz, Kubernetes, cloud services) may handle these moments differently.

## Settings

The dialect, clock, time zone and number of runs are saved in this browser's `localStorage` (key `cron.settings`). Your expressions aren't saved.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>/</kbd> | Focus the input |

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `cron.html`. The parsing, describing and scheduling logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { parseCron, describe, nextRuns } = require('./core.js');
const c = parseCron('*/15 9-17 * * 1-5');
describe(c);                    // 'Every 15 minutes, between 09:00 and 17:59, on weekdays'
describe(c, { h12: true });     // 'Every 15 minutes, between 9:00 AM and 5:59 PM, on weekdays'
nextRuns(c, { from: Date.parse('2026-09-26T12:00:00Z'), count: 2, zone: 'Europe/London' }).runs.map(r => new Date(r.ms).toISOString());
// [ '2026-09-28T08:00:00.000Z', '2026-09-28T08:15:00.000Z' ]
```

`parseCron(text, { dialect })` returns `{ ok: true, dialect, fields, … }` or `{ error, field }`, where `field` is the index of the bad field (`-1` for the expression as a whole). `nextRuns(cron, { from, count, zone })` returns `{ runs: [{ ms, wall, gap?, repeat? }], more, reason? }`.
