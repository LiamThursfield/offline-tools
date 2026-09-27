# Gzip helper

Compress and decompress gzip, zlib and raw deflate data in the browser, offline.

Open [`gzip.html`](gzip.html) in any modern browser (Chrome or Edge 103+, Firefox 113+, Safari 16.4+).

## Modes

Pick **Compress** or **Decompress** above the input. Opening or dropping a file switches mode for you: gzip files (and files ending `.gz`, `.tgz`, `.zlib`, …) go to Decompress, anything else to Compress.

**Use as input** sends the output back in the other mode, which is a quick way to check a round trip. Small results go into the text box (as Base64 or hex, or as text); bigger ones are loaded as a file.

## Compress

- Type or paste text (compressed as UTF-8), or use **Open file** or drop a file to compress its exact bytes.
- **Format**: **gzip** (RFC 1952), **zlib** (RFC 1950) or **raw deflate** (RFC 1951). All three wrap the same deflate data, so only the header and checksum differ.
- **Store file name and date** (gzip, files only) writes the file's name and modification date into the gzip header, as the `gzip` command does. Turn it off for the equivalent of `gzip -n`.
- The output shows as **Base64** or **Hex**. **Copy** copies it in that form. **Download** saves the binary file as `<name>.gz`, `.zlib` or `.deflate`.

The footer shows the size before and after, the ratio and how long it took. Details under the output include the header and trailer sizes, the CRC-32 (gzip) or Adler-32 (zlib) and the Base64 length.

Browsers don't let pages choose a compression level, so the output uses the browser's built-in level (the same default as `gzip -6` in current browsers).

## Decompress

- Paste compressed data as **Base64** (standard or URL-safe, with or without padding, whitespace ignored), as a `data:…;base64,` URL, or as **hex** (an optional `0x` prefix and spaces are fine). Gzip in Base64 starts with `H4sI`; zlib usually starts with `eJ` or `eNo`.
- Or open or drop a compressed file.
- **Format**: **Auto** detects gzip and zlib from their headers and otherwise tries raw deflate. Pick one to force it.

The output shows as **Text** when it's valid UTF-8, and otherwise as a **Hex** dump with offsets and ASCII. **Base64** is also available. **Copy** copies the whole output (hex without spaces). **Download** uses the file name stored in the gzip header if there is one, or the input's name without `.gz` (`.tgz` becomes `.tar`).

Details under the output:

| Format | Shows |
| --- | --- |
| gzip | stored file name, modification date and comment, the OS it was made on, the level hint, extra-field IDs (BGZF blocks are labelled), the CRC-32 and size from the trailer, each checked against the output |
| zlib | window size, level hint, Adler-32 checked against the output |

### Multiple members, trailing data and errors

- **Several gzip members** back to back (as `cat a.gz b.gz > both.gz` or BGZF make) are all decompressed and joined, like `gunzip` does. Each member's CRC-32 and size are checked.
- **Trailing zeros or other data** after the gzip data are ignored with a note.
- **Corrupt or truncated data** gives an error, and whatever was decompressed before the problem is shown as partial output, which can still be copied and downloaded.
- Output stops at **256 MB**, so a "zip bomb" can't use up the browser's memory.
- zlib data that needs a preset dictionary isn't supported.

Views show the first 1,000,000 characters (or 64 KB as a hex dump). Copy and Download always use all of it.

## Settings and privacy

Input is never stored. The mode, formats, "store file name" and Base64/Hex choice are saved in `localStorage` (key `gzip.settings`), and the theme in `tools.theme`.

## Development

Everything is in `gzip.html`. Compression runs the input through the browser's `CompressionStream('deflate-raw')` and adds the gzip or zlib header and trailer itself, so the header can carry a file name and date. Decompression uses `DecompressionStream`, which also verifies checksums; the headers are parsed separately to show their contents.

The logic is in the `<script id="core">` block as functions with no DOM access. When loaded in Node (18+, which has compression streams) it exports them via `module.exports`:

```js
// extract the core script to core.js, then:
const { compress, decompress, toBase64, decodeTextInput } = require('./core.js');
const gz = await compress(new TextEncoder().encode('hello'), 'gzip', { name: 'hello.txt' });
toBase64(gz.output);                                   // 'H4sICAAAAAAA/2hlbGxvLnR4dAD…'
const d = await decompress(decodeTextInput(toBase64(gz.output)).bytes);
d.members[0].name;                                     // 'hello.txt'
new TextDecoder().decode(d.output);                    // 'hello'
```
