# Basic auth generator

Build an HTTP Basic auth header from a username and password, or decode one back to the credentials, in the browser, offline. It also gives you ready-made curl, fetch, Python, HTTPie and wget commands, builds the server's `WWW-Authenticate` challenge, and points out the mistakes that make Basic auth fail quietly.

Open [`basic-auth.html`](basic-auth.html) in any modern browser.

## Using it

Pick **Build** or **Decode** at the top of the Credentials card.

- **Build**: type a username and password. The `Authorization: Basic …` header updates as you type. **Show** reveals the password.
- **Decode**: paste any of these and the username and password are shown:
  - a header line: `Authorization: Basic YWxpY2U6czNjcjN0` (or `Proxy-Authorization`)
  - the header value: `Basic YWxpY2U6czNjcjN0`
  - the bare Base64: `YWxpY2U6czNjcjN0`
  - a plain `user:pass` pair
  - a URL with credentials: `https://alice:s3cr3t@api.example.com/me` (percent-encoding is decoded)
  - a command line with `-u`, `--user`, `-a` or `--auth`: `curl -u 'alice:s3cr3t' https://…`

  **Edit** copies the decoded credentials into Build.

Click the header, or **Copy header**, to copy it. Every other value and snippet has its own **Copy** button.

**Example** (<kbd>E</kbd>) fills in an example; **Clear** empties every field. <kbd>/</kbd> focuses the input and <kbd>C</kbd> copies the header.

## Output

| Row | Example |
| --- | --- |
| The header | `Authorization: Basic YWxpY2U6czNjcjN0` |
| Header value | `Basic YWxpY2U6czNjcjN0` |
| Base64 credentials | `YWxpY2U6czNjcjN0` |
| Decoded | `alice:s3cr3t` |

Under the header: the character set, the number of bytes and the length of the Base64.

### Snippets

Each one uses the **Request URL** (or `https://api.example.com/me` when it's empty), with the values quoted for the language:

- **curl** with `-u`, and **curl** with the header set by hand
- **JavaScript** `fetch`
- **Python** `requests` with `auth=(…)`
- **HTTPie** with `--auth`
- **wget** with `--user` and `--password`
- **URL with credentials**, with the username and password percent-encoded. curl and most clients accept it; browsers strip the credentials or refuse the URL.

Shell commands use single quotes, with any `'` in a value written as `'\''`, so passwords with `$`, `!` or spaces survive being pasted into a terminal.

## Character set

Basic auth sends bytes, so the character set matters as soon as a username or password has a non-ASCII character in it (`félix`, `pässword`):

- **UTF-8** (the default) is what almost every client sends today.
- **ISO-8859-1** (Latin-1) is RFC 7617's default. Characters it can't hold (such as `€` or emoji) are reported, and no header is made.

A server asks for UTF-8 by sending `charset="UTF-8"` in its challenge. The same choice is used to read the bytes in Decode; bytes that aren't valid UTF-8 are read as ISO-8859-1 and reported.

## Warnings

The notes under the Credentials card point out:

- **A colon in the username.** The server splits at the first colon, so everything after it becomes part of the password. RFC 7617 doesn't allow it. (A colon in the password is fine.)
- **Control characters**, such as a line feed, which can't go in a header.
- **Leading or trailing spaces**, which are part of the credentials.
- **Characters you can't see**: zero-width spaces and joiners, no-break spaces, soft hyphens, byte order marks and so on, often picked up when copying a password.
- **An empty username or password.** Both are valid, but an empty username is usually turned down.
- **Non-ASCII characters**, and what that means for the character set.
- **A plain `http://` request URL**, other than to `localhost`: Base64 is encoding, not encryption, so the password travels in the clear.

When decoding, it also reports what was pasted, Base64 in the URL-safe alphabet, missing or wrong padding, whitespace inside the Base64, a non-canonical last character, and decoded bytes with no colon in them.

## Server challenge

Type a realm to get the header a server sends with `401 Unauthorized`:

```
WWW-Authenticate: Basic realm="Staging", charset="UTF-8"
```

`charset="UTF-8"` is included when the character set is UTF-8. Quotes and backslashes in the realm are escaped, and control or non-ASCII characters are pointed out. With no realm, `Restricted` is used, since RFC 7617 requires one.

## Privacy

Nothing is sent anywhere, and the username, password, URL and realm are never saved: they're gone when you close the page. Only your preferences (Build or Decode, and the character set) and the theme are kept in `localStorage`. Copying shows *Copied the header* rather than the value, so a password doesn't appear on screen in the toast.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `basic-auth.html`. The logic is in the `<script id="core">` block as functions with no DOM access. When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { encodeBasic, decodeBasic, challengeHeader, snippets } = require('./core.js');
encodeBasic({ user: 'alice', pass: 's3cr3t' }).header;                  // 'Authorization: Basic YWxpY2U6czNjcjN0'
encodeBasic({ user: 'félix', pass: 'x' }, { charset: 'iso-8859-1' }).b64; // 'ZulsaXg6eA=='
decodeBasic('Basic YWxpY2U6czNjcjN0');                                  // { user: 'alice', pass: 's3cr3t', source: 'scheme', … }
decodeBasic("curl -u 'bob:p:w' https://x").pass;                        // 'p:w'
challengeHeader({ realm: 'Staging' }).header;                           // 'WWW-Authenticate: Basic realm="Staging", charset="UTF-8"'
```

`encodeBasic({ user, pass }, { charset })` returns `{ header, value, b64, raw, bytes, facts, notes }`, `{ empty: true }` or `{ error, notes }`. `decodeBasic(text, { charset })` returns `{ user, pass, raw, source, encoded, facts?, notes }`, `{ empty: true }` or `{ error }`; `source` is one of `header`, `proxy-header`, `scheme`, `base64`, `pair`, `url` or `flag`. Each note is `{ level: 'bad' | 'warn' | 'info', text }`. `snippets(encoded, { url })` returns `[{ k, label, text, hint? }]`, and `credentialNotes`, `urlNotes`, `detectSource`, `b64Decode`, `toBytes`, `fromBytes`, `shq` and `jss` are exported too.
