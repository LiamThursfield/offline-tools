# BPM tapper

Find the tempo of a song by tapping along to the beat, offline.

Open [`bpm-tapper.html`](bpm-tapper.html) in any modern browser.

## Tapping

- **Tap** the big pad, **click** it, or **press any key** in time with the beat. Modifier shortcuts (⌘/Ctrl/Alt + key) and Tab aren't counted, so the browser and keyboard navigation still work.
- The reading settles after a few taps. Two or more bars gives a steady result.
- **Reset** in the header (or <kbd>Esc</kbd>) clears the current run.
- **Copy result** (or ⌘/Ctrl+C when no text is selected) copies a one-line summary, such as `120.1 BPM (16 taps over 7.5 s, 97% consistent)`.

## Readings

| Reading | What it is |
| --- | --- |
| **Average** | The tempo across every tap in the run. It uses a least-squares fit of tap time against tap number, so a single early or late tap barely moves it. |
| **Recent** | The average of the last few taps (set in *Options*). This follows tempo changes faster than the average. |
| **Taps** | The number of taps in the run, plus the current bar when *Beats per bar* is on. |
| **Time** | The time from the first tap to the last. |
| **Range** | The slowest and fastest single tap, as BPM. |
| **Consistency** | How even the gaps between taps are. 100% means every gap was the same length. It drops by one point for each 1% of spread (coefficient of variation). |
| **½ / 2×** | Half and double time, for when you tapped every other beat or every half-beat. |

The **Each tap** chart plots the tempo of each gap between taps against the average, so a rushed or late tap stands out.

## Options

- **Auto reset**: if you stop tapping for this long (2, 3, 5 or 10 s, or never), the run ends. Its result stays on the pad marked *Result*, and your next tap starts a new run. A bar along the bottom of the pad counts down.
- **Recent**: how many taps the *Recent* reading averages (4, 8, 16 or 32).
- **Beats per bar**: shows dots on the pad that count through the bar as you tap. The first beat of the bar is the larger dot. Set it to *off* to hide them.
- **Decimals**: 0, 1 or 2 decimal places for BPM readings.
- **Click sound**: plays a short click on each tap, higher-pitched on the first beat of the bar. The sound is generated in the browser, so nothing is downloaded.

Options are saved in this browser's `localStorage` (key `bpm-tapper.settings`).

## Results

Each finished run of four or more taps, ended by the auto reset or **Reset**, is added to *Results* with its time, tap count and consistency. **copy** copies a run's summary, and **Clear** empties the list. Results are only kept in memory and are gone when you close or reload the page.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `bpm-tapper.html`. The tempo logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { tapStats, summarize } = require('./core.js');
tapStats([0, 500, 1000, 1500]).bpm; // 120
```

Tap times are in milliseconds from any monotonic clock. The UI uses each event's `timeStamp`, which records when the input happened rather than when the handler ran.
