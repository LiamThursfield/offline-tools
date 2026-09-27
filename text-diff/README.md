# Text diff

Compare two texts in the browser, offline: what changed line by line, with the changed words or characters highlighted inside each line. It works for prose, Markdown, code, config files, logs and any other plain text.

Open [`text-diff.html`](text-diff.html) in any modern browser.

## Input

- Paste into box **A** (original) and box **B** (changed), use **Open file**, or drop a file onto either box.
- **Swap A ⇄ B** switches the two sides, **Load example** fills both with sample text, and **Clear** empties them.
- Each box shows how many lines it has; hover over the count for the number of characters and whether the text ends with a newline.

## Views

| View | Shows |
| --- | --- |
| **Unified** | One column: removed lines (−) then added lines (+), with unchanged lines around them for context. |
| **Side by side** | A on the left and B on the right, with changed lines lined up and a hatched gap where one side has no line. |
| **Inline** | Each change as one piece of text: removed words struck through and added words highlighted, so a rewritten sentence reads as a single edit. Unchanged lines show B's text. |

These are the same views as JSON diff's line diff, and they share its controls:

- **Highlight**: *Words* marks the words that changed inside changed lines, *Characters* marks individual characters (useful for typos and numbers), and *Off* only colours whole lines. Highlighting is skipped for a change where the old and new lines have too little in common for it to help.
- **Context**: how many unchanged lines to show around each change (0–50). Longer unchanged stretches are collapsed; click **Show N unchanged lines** to expand one.
- **Whole file** shows everything, with nothing collapsed.
- **Wrap lines** wraps long lines instead of scrolling sideways.

The summary above the diff counts added and removed lines and words, unchanged lines, and how much of the text is the same.

## Comparison options

| Whitespace | Two lines are the same if… |
| --- | --- |
| *compare exactly* | …they're identical |
| *ignore at line ends* | …they only differ in trailing spaces and tabs |
| *ignore changes in amount* | …they only differ in how much whitespace there is where there is some, like `diff -b` |
| *ignore all* | …they're identical once all whitespace is removed, like `diff -w` |

**Ignore case** treats upper and lower case as the same. With any of these on, unchanged lines are shown as they are in A, and ignored differences are left unhighlighted inside changed lines.

Line endings (`\r\n`, `\r` or `\n`) never count as differences. A missing newline at the end of one file does, unless whitespace is ignored, and is marked **no newline at end**.

## Patch

**Copy patch** copies the differences as a unified diff (the format of `diff -u` and `git diff`), with as many lines of context as the **Context** setting. **Download .patch** saves the same thing as a file named after B. The file names in the header are the names of the opened files, or `a` and `b`.

With whitespace or case ignored, the patch skips those differences, so it may not turn A into exactly B.

## Large texts

The diff runs as you type and handles files of tens of thousands of lines. When two texts are so different that lining them up line by line would take too long, the part that can't be aligned is shown as replaced wholesale, with a note saying so.

## Privacy

Nothing is saved or sent anywhere: both texts are gone when you close the page. Only the theme is kept in `localStorage`.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `text-diff.html`. The diff logic is in the `<script id="core">` block as pure functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { diffLines, diffBlock, unifiedPatch } = require('./core.js');
const d = diffLines('one\ntwo\n', 'one\nTwo\nthree\n', { ws: 'none', ignoreCase: false });
d.blocks;                  // [ { eq: [[0, 0]] }, { del: [1], ins: [1, 2] } ]
unifiedPatch(d, 3, 'a', 'b');
// --- a
// +++ b
// @@ -1,2 +1,3 @@
//  one
// -two
// +Two
// +three
```

`diffLines(a, b, { ws, ignoreCase })` returns `{ A, B, nlA, nlB, blocks, adds, dels, same, approx }`, where `ws` is `'none'`, `'trailing'`, `'amount'` or `'all'`. `diffBlock(oldLines, newLines, 'word' | 'char', options)` diffs a changed block word by word or character by character, returning the tokens on each side with a changed flag for each one. The line diff is the same Myers diff as JSON diff's, with its memory kept to the part of the search the backtrack needs.
