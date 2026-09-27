# JWT decoder

Decode a JSON Web Token in the browser, offline: its header and claims, when it expires, and whether its signature is valid. A JWT often grants access to a real account, so it shouldn't be pasted into a website that could log it. Here the token, and any secret or key you enter, never leave the page.

Open [`jwt.html`](jwt.html) in any modern browser.

## Token

Paste a token into the box. It doesn't need to be tidy: a `Bearer ` prefix, a whole `Authorization:` header, surrounding quotes and line breaks are all ignored. The token is coloured by part (header, payload, signature) as you type, and the count above it shows how many parts and characters it has.

**Load example** creates a token signed with HS256 that expires in an hour, and fills in its secret so the signature check passes. **Expired example** does the same with a token that expired three days ago. Both are signed on the spot, so their times are relative to now.

## Status

Two cards sum the token up:

| Card | Shows |
| --- | --- |
| **Expiry** | *Not expired* (with how long is left), *Expired* (and how long ago), *Not valid yet* (when `nbf` is still ahead), *Never expires* (no `exp`) or *Invalid expiry*. The times count down live. |
| **Signature** | *Signature verified*, *Invalid signature*, *Not signed* (`alg: none`), or *Signature not checked* until you enter a secret or key. |

**Leeway** allows some clock difference when checking `exp` and `nbf`, as most JWT libraries do (often 30 to 60 seconds). A token that expired within the leeway counts as not expired, with a note.

## Warnings

Under the cards, notes point out problems with the token, worst first:

- `alg` is `none`, missing, or not one this tool can verify.
- The header points at a URL for its key (`jku`, `x5u`) or carries its own key (`jwk`). A verifier must never trust these without an allow-list.
- There's no `exp`, so the token never expires.
- A time claim isn't a number, looks like it's in milliseconds, or doesn't make sense (`iat` in the future, `exp` before `iat` or `nbf`).
- A part uses standard Base64 or `=` padding instead of Base64url, the signature is the wrong length for its algorithm, or the payload isn't JSON (a nested JWT is recognised as one).
- Critical extensions (`crit`) and RFC 7797 unencoded payloads (`b64: false`).

An encrypted token (JWE, with five parts) has its header decoded; its payload can't be read without the recipient's private key.

## Header and payload

Each part is shown as **Fields** (a table) or **JSON**, and **Copy JSON** copies it formatted.

In the fields view, registered claims (`iss`, `sub`, `aud`, `exp`, `nbf`, `iat`, `jti`) and common OpenID Connect, OAuth and Microsoft Entra claims have their names and meaning next to them. Time claims (`exp`, `nbf`, `iat`, `auth_time`, `updated_at`) show the date in your time zone, in UTC (ISO 8601) and relative to now. Lists and space-separated scopes are shown as chips. In the JSON view, hover over a time to see its date.

## Verifying the signature

The algorithm comes from the token's header. Signatures are checked with the browser's WebCrypto, so this works offline, but it needs a secure context: a local file, `localhost` or an https page.

| Algorithms | Enter |
| --- | --- |
| HS256, HS384, HS512 | The shared **secret**, as text (UTF-8), Base64/Base64url or hex, or an `oct` JWK |
| RS256, RS384, RS512, PS256, PS384, PS512 | The **public key** |
| ES256, ES384, ES512 | The **public key** (P-256, P-384 or P-521) |
| EdDSA (Ed25519) | The **public key**, in browsers that support Ed25519 |

A public key can be:

- PEM `PUBLIC KEY` (SubjectPublicKeyInfo) or `RSA PUBLIC KEY` (PKCS#1).
- A PEM `CERTIFICATE`: its public key is used, but the certificate itself isn't checked.
- A PEM `PRIVATE KEY` (PKCS#8) or a private JWK: only the public part is used.
- A JWK, or a JWK Set (`{"keys": […]}`, as served at a `jwks_uri`), from which the key with the token's `kid` is picked.

The check runs as you type. If a key is the wrong type for the algorithm (an EC key for RS256, a P-256 key for ES384) you're told so. Some things are also pointed out:

- An HMAC secret shorter than the hash (32 bytes for HS256), which RFC 7518 forbids and which can be guessed offline from any token.
- A public key entered as an HMAC secret: this is the algorithm-confusion attack, and a warning explains it.
- A secret that only matches when read as Base64, a common mix-up.
- An ECDSA signature in DER form instead of JWS's raw `r‖s`.

When an HMAC check fails, the signature the token would have with the secret you entered is shown, to help debug a signer.

## Privacy

Nothing is saved or sent anywhere: the token, secrets and keys are gone when you close the page. The tool makes no network requests, and doesn't put the token in the URL. Only the theme is kept in `localStorage`.

## Theme

Pick a theme in the header. **Auto** follows the system light/dark setting. See the [root README](../README.md#theming) for how themes work and how to add one.

## Development

Everything is in `jwt.html`. The decoding and verification logic is in the `<script id="core">` block as functions with no DOM access (signatures use `crypto.subtle`, which Node also has). When loaded in Node it exports them via `module.exports`, so it can be tested on its own:

```js
// extract the core script to core.js, then:
const { decodeJwt, checkTimes, importHmacKey, importPublicKey, verifyJws } = require('./core.js');
const d = decodeJwt('Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.…');
d.header.json;                                     // { alg: 'HS256' }
d.claims;                                          // { sub: '1', exp: 1 }
checkTimes(d.claims, Date.now() / 1000).state;     // 'expired'
const { key } = await importHmacKey('HS256', 'my secret', 'text');
(await verifyJws(d.token, key, 'HS256')).ok;       // true or false
```

`decodeJwt(text)` returns `{ token, parts, kind, header, payload, claims, signature, alg, notes, error }`, where `kind` is `'empty'`, `'invalid'`, `'jws'` or `'jwe'`, and each note is `{ level: 'bad' | 'warn' | 'info', text }`. `checkTimes(claims, now, leeway)` returns the state (`'valid'`, `'expired'`, `'early'`, `'noexp'` or `'badexp'`) with notes. `importPublicKey(alg, text, kid)` accepts every key format listed above and throws a readable error when a key doesn't fit.
