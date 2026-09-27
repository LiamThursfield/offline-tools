# Metronome

A metronome with accent patterns, subdivisions and tap tempo, offline.

Open [`metronome.html`](metronome.html) in any modern browser.

## Tempo

- Type a tempo into the big number, drag the slider, or use **−** / **+**. Hold **−** / **+** to keep changing it, and Shift-click them to move by 10.
- The range is 20 to 300 BPM, in whole numbers. The label above the number gives the traditional Italian marking (Largo, Andante, Allegro and so on). The boundaries between markings vary between sources; these follow one common reading.
- **Start** / **Stop** (or <kbd>Space</kbd>) plays and stops the clicks. The header has a Start/Stop button too, for when the page is scrolled.
- Changing the tempo, accents or subdivision while it's playing takes effect from the next click, without restarting the bar.

## Tap tempo

Tap **Tap tempo** (or press <kbd>T</kbd>) in time with the music. From the second tap the tempo follows your taps, fitted by least squares over your last eight taps so one early or late tap barely moves it. A pause of more than two seconds starts a new set of taps. Tap tempo works while the metronome is playing, so you can lock onto a song as it plays.

## Accents

Each beat in the bar has a level, shown as bars on its tile:

| Level | Sound |
| --- | --- |
| **Accent** (3 bars) | Higher pitch, full volume |
| **Normal** (2 bars) | Normal pitch and volume |
| **Soft** (1 bar) | Normal pitch, quieter |
| **Mute** (struck out) | Silent, with its subdivisions |

Click a beat to cycle it: normal → accent → mute → soft. Shift-click cycles the other way. Muted beats are useful for practising keeping time through gaps.

**Presets** set the whole bar at once: accent the first beat, all beats equal, backbeat (accents on 2 and 4), groups of 2, or groups of 3 (for 6/8, 9/8 and 12/8: an accent on 1, normal on 4, 7 and 10, the rest soft).

## Options

- **Beats per bar**: 1 to 16. Beats added keep the pattern of the existing ones and start as normal.
- **Subdivision**: extra, quieter clicks between beats: eighths (2 per beat), triplets (3) or sixteenths (4). Each beat's tile shows a dot per subdivision.
- **Sound**: *click*, *woodblock* or *beep*. The sounds are generated in the browser, so nothing is downloaded.
- **Volume**: the metronome's own volume, on top of the system volume.
- **Flash on beat**: lights up the tempo panel on each beat, brighter on accents. Turn it off if it's distracting.

While playing, **Bar**, **Beat** and **Time** show where you are and how long it's been running.

Options, the tempo and the accent pattern are saved in this browser's `localStorage` (key `metronome.settings`).

## Keyboard

| Key | Action |
| --- | --- |
| <kbd>Space</kbd> | Start / stop |
| <kbd>T</kbd> | Tap tempo |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Tempo ±1 |
| <kbd>Shift</kbd> + <kbd>↑</kbd> / <kbd>↓</kbd> | Tempo ±10 |
| <kbd>Esc</kbd> | Stop |

Shortcuts are ignored while a text field, slider or menu has focus, so they keep their own keys. With a beat tile focused, <kbd>Space</kbd> or <kbd>Enter</kbd> changes its accent.

## Timing

The clicks use the Web Audio API with lookahead scheduling: every 25 ms, the page schedules any clicks due in the next 120 ms at exact times on the audio clock. The timer only decides *when to schedule*, not when a click plays, so the beat stays sample-accurate even if the page is busy. The timer runs in a small Web Worker (created from inline code, so the page is still a single file), because worker timers aren't slowed down as much as page timers when the tab is in the background. If the tab stalls altogether, the metronome carries on from the current moment rather than playing a burst of late clicks.

The flashing beat and counters are drawn in step with what you hear, allowing for the audio output latency the browser reports. Where the browser supports it, the screen is kept awake while the metronome plays.

Browsers only allow audio after you interact with the page, so the first **Start** also sets up the audio.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `metronome.html`. The metronome logic is in the `<script id="core">` block as pure functions with no DOM or audio access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { stepAt, accentPreset, tapBpm } = require('./core.js');
accentPreset('backbeat', 4);              // [2, 3, 2, 3]  (0 mute, 1 soft, 2 normal, 3 accent)
stepAt(5, 4, 2, [3, 2, 2, 2]);            // { beat: 2, sub: 1, level: 1, isSub: true }
tapBpm([0, 500, 1000, 1500]);             // 120
```
