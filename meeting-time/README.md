# Meeting time finder

Find the time nearest to the one you want that falls within everyone's working hours, across two or more time zones, offline.

Open [`meeting-time.html`](meeting-time.html) in any modern browser.

## Time zones and working hours

Add a zone for each place people are joining from, by IANA name (`Europe/London`), city (`london`, `new york`) or anything else your browser accepts. Each zone has:

- **Working hours**, 09:00 to 17:00 by default. To work until midnight, set the end to 00:00. Hours that run overnight (such as 22:00 to 06:00) aren't supported.
- **Working days**, Monday to Friday by default. Where the working week is usually different, new zones start with that instead: Sunday to Thursday for much of the Middle East and North Africa (for example `Asia/Riyadh`, `Asia/Jerusalem`, `Africa/Cairo`), Saturday to Wednesday for `Asia/Tehran` and `Asia/Kabul`, and Sunday to Friday for `Asia/Kathmandu`. This is only a guess, so check it.

**×** removes a zone and **Reset** goes back to your zone, London and New York. The list, hours, meeting length and start-time setting are saved in this browser's `localStorage` (key `meeting-time.settings`). The date and time you search for are never saved.

## When

Pick the date and time you'd like to meet and the zone it's in (your zone by default). Changing the zone keeps the date and time as typed, so you can say "10:00 in New York". **Now** (or <kbd>N</kbd>) starts from the next start time after the current time.

- **Meeting length**: 15 minutes to 4 hours. The whole meeting has to fit inside someone's working hours for it to suit them.
- **Start on the**: quarter hour, half hour or hour, on the clock of the zone you picked. Other zones may land on other minutes, such as :30 in India or :45 in Nepal.

## Best times

The search covers a week either side of your time, in steps of 15 minutes.

- **Your time works for everyone**: you're done.
- **Some time in the week suits everyone**: the nearest one before and after your time are shown as **Earlier** and **Later**, and the nearer of the two is marked **Best**.
- **No time suits everyone** (London, New York and Sydney, for example): the tool looks for the fairest compromise. It keeps the furthest anyone is outside their working hours as small as it can, then the total across everyone, then picks the nearest. A time on someone's day off counts as worse than any time on a working day. **Fairest** is the best time in the whole week, and **Earlier** and **Later** are the fairest within a day of yours, so a slightly worse time that's much sooner is still on offer. A day where every time falls on someone's day off doesn't count towards that day.

Each card shows the meeting in every zone, the date where it's different from yours, and whether it suits each person. If it doesn't, the card says why: it starts so long before their working day, ends so long after it, or falls on a day they don't work. **copy** copies one line for an invite or a message, such as:

```
Tue 27 Oct 2026 · London 13:00–13:30 · New York 09:00–09:30
```

Clicking a card shows it on the day view. If any zone's clocks change within the week, a note under the cards says when, because the overlap moves with it. For example, in 2026 the UK's clocks go back on 25 October and the US's on 1 November, so for that week London and New York are four hours apart instead of five.

## Day view

One day on the clock of the zone you picked, hour by hour, with a row for each zone showing its local time. Working hours are shaded, and the **Everyone** row shows when all of them overlap, to the quarter hour. The selected meeting is outlined and your time is a dashed line. **‹** and **›** move a day at a time, and clicking any hour checks the start time under the pointer. A day with a clock change has 23 or 25 hours. On a narrow screen the view scrolls sideways.

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>N</kbd> | Start from the current time |

## Daylight saving and time zone data

All time zone maths uses the browser's `Intl` API and its time zone database, so it follows each zone's real rules, including daylight saving and other offset changes. The search steps through real instants and works out each zone's local time at every step, so a change in any zone is picked up wherever it falls. If the time you pick doesn't exist in your zone because the clocks go forward, it moves on by the gap. If it happens twice because they go back, the first one is used. This matches JavaScript's Temporal API (`disambiguation: "compatible"`).

Public holidays aren't included: they'd need a dataset bundled into the page that would go out of date.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `meeting-time.html`. The scheduling logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { findMeetingTimes, defaultRule, wallToMs, summaryLine } = require('./core.js');
const zones = ['Europe/London', 'America/New_York'].map(defaultRule);
const target = wallToMs({ y: 2026, mo: 10, d: 27, h: 10, mi: 0 }, 'Europe/London').ms;
const r = findMeetingTimes({ zones, target, duration: 30, step: 30, refZone: 'Europe/London' });
summaryLine(r.later, 'Europe/London'); // 'Tue 27 Oct 2026 · London 13:00–13:30 · New York 09:00–09:30'
```

`findMeetingTimes({ zones, target, duration, step, refZone, range })` returns `{ target, fits, earlier, later, fairest, best }`. Each time is `{ ms, ok, worst, total, people }`, and each person is `{ zone, start, end, ok, why, by, cost }`. A person's working hours are `{ zone, start, end, days }`: `start` and `end` in minutes after midnight (`end` can be 1440), and `days` with 0 for Sunday.
