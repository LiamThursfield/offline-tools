# Encoder/decoder

Encode and decode text in the browser, offline: Base64, URL encoding, HTML entities, hex, string escapes and Unicode escapes. It also shows decoded images, lists a URL's query parameters, and points out hidden characters such as zero-width spaces.

Open [`encode.html`](encode.html) in any modern browser.

## Using it

Pick **Encode** or **Decode**, then a format. The output updates as you type. **Load example** fills in an example for the current direction and format.

**Use as input** puts the output in the input box and switches direction, so you can check a round trip. When a result still looks encoded (percent-encoding in decoded URL text, `&amp;lt;`, `\n`), a note offers to decode it again.

When the input doesn't match the chosen format, the tool says what it looks like and offers to switch: for example, percent-encoded text pasted while Base64 is selected. A JSON Web Token gets a link to the [JWT decoder](../jwt/), and gzip data gets a link to the [Gzip helper](../gzip/).

## Formats

| Format | Encode | Decode |
| --- | --- | --- |
| **Base64** | Text (UTF-8) or a file. Standard or URL-safe alphabet, padding on or off, one line or 64 (PEM) or 76 (MIME) characters per line, or a whole `data:` URL | Either alphabet, with or without padding and line breaks, and `data:` URLs (including percent-encoded ones) |
| **URL** | **Component** (`encodeURIComponent`, for one value), **Full URL** (`encodeURI`, which keeps `: / ? # & =`) or **Form** (`application/x-www-form-urlencoded`, as `URLSearchParams` writes it, with spaces as `+`) | `%XX` sequences, and `+` as a space unless you turn that off. A stray `%` or invalid UTF-8 doesn't stop decoding, as it does with `decodeURIComponent`; it's kept or replaced, and reported |
| **HTML** | Only `& < > " '`, or non-ASCII characters too, as numeric references (`&#xE9;`) or by name (`&eacute;`) | Named, decimal and hex references. Names outside the built-in table are looked up by the browser, which knows all 2,231 |
| **Hex** | Text or a file, with no separator, spaces, colons, `\x` or `0x, ` between bytes, in lower or upper case | Ignores spaces, colons, commas, `0x` and `\x`, and reads `xxd` and `hexdump -C` dumps |
| **String** | A JSON string literal (also valid JavaScript), with or without quotes, and optionally ASCII only | JSON and JavaScript escapes (`\n`, `\t`, `\"`, `\xHH`, `\uXXXX`, `\u{…}`, line continuations), with or without the surrounding quotes |
| **Unicode** | `\uXXXX` (with surrogate pairs), `\u{…}`, Python's `\U…`, CSS escapes or `U+XXXX`, for non-ASCII characters only or for every character | Any mix of the above, plus `\xHH` and `&#…;` |

Base64, hex and URL encoding work on bytes: text is converted to UTF-8 first, and decoding gives bytes that are shown as text when they're valid UTF-8.

### Details worth knowing

- **Base64**: mixing both alphabets, the wrong amount of padding, and a last character with unused bits set (a non-canonical encoding that strict decoders reject) are all pointed out.
- **URL**: encoding text that already contains `%XX` warns that each `%` becomes `%25`. Invalid UTF-8 such as `%E9` becomes `�`, and the note shows what it would be in Latin-1, which older systems used.
- **HTML**: numeric references from `&#128;` to `&#159;` are read as Windows-1252 characters (`&#150;` is –), as browsers read them. References to invalid code points become U+FFFD. Legacy names without a semicolon (`&copy`) are accepted, as browsers accept them.
- **Hex**: when every byte is written separately (`0x1, 0x2` or `a:b:c`), one-digit bytes are allowed.

## Output

**Show as** switches between:

- **Text**: the output as text.
- **Characters**: a table of every character with its code point, UTF-8 bytes and, for invisible and unusual ones, a name. Hidden characters are highlighted.
- **Hex**: a hex dump of the output's bytes.
- **Image**: for a decoded PNG, JPEG, GIF, WebP, BMP, ICO or SVG, with its size in pixels.

When URL decoding is given a whole URL or a query string, the view also lists its scheme, host, path and fragment, and each query parameter decoded.

The facts under the output say how the input was read (such as *data: URL, URL-safe Base64*), and what the decoded bytes are when they're a known file type. **Download** saves the output with a fitting extension (`.png` for a PNG, `.txt` for text, `.bin` for other bytes).

### Hidden characters

Decoded text is checked for characters that are easy to miss: zero-width spaces and joiners, no-break and other unusual spaces, bidirectional controls (which can make text read differently from how it's stored), byte order marks, soft hyphens, control characters, Unicode tag characters (which can hide ASCII text) and U+FFFD. A note lists them, and **Show them** opens the Characters view. When encoding, hidden characters in the input are pointed out in the same way.

## Files

**Open file**, or dropping a file onto the input box, reads a text file into the input box. In Encode with Base64 or Hex, a binary file (or an image) is kept as a file and encoded byte for byte; with **data: URL** on, its type goes in the URL. Nothing is uploaded.

## Privacy

Nothing is sent anywhere, and the input is never saved: it's gone when you close the page. Only your preferences (direction, format and options) and the theme are kept in `localStorage`.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `encode.html`. The logic is in the `<script id="core">` block as functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { encode, decode, detect, hiddenChars, OPTION_DEFAULTS } = require('./core.js');
encode('base64', { text: 'hi?>' }, { ...OPTION_DEFAULTS, b64Url: true, b64Pad: false }).text;  // 'aGk_Pg'
decode('url', 'caf%C3%A9+au+lait', OPTION_DEFAULTS).text;                                      // 'café au lait'
decode('hex', 'de:ad:be:ef', OPTION_DEFAULTS).bytes;                                           // Uint8Array [222, 173, 190, 239]
detect('eyJhbGciOiJIUzI1NiJ9.e30.x');                                                          // { format: 'jwt', strong: true }
hiddenChars('a​b');                                                                       // [{ cp: 0x200B, name: 'zero width space', count: 1 }]
```

`encode(format, { text } | { bytes, mime }, options)` returns `{ text, notes, facts }` or `{ error }`. `decode(format, text, options, resolveEntity?)` returns `{ text }` or `{ bytes, mime? }` (for Base64 and hex), with `notes`, `facts` and, for URLs, `parts`; or `{ error }`. Each note is `{ level: 'bad' | 'warn' | 'info', text, act? }`, where `act` names a follow-up the page offers as a button. The individual codecs (`base64Decode`, `urlDecode`, `htmlDecode`, `hexDecode`, `stringUnescape`, `unicodeUnescape` and their encoders) are exported too.
