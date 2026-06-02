export default function Post() {
  return (
    <>
      <p>
        Base64 and base64url look almost identical. They share an alphabet of 64 characters, the
        same 3-bytes-to-4-characters expansion ratio, and the same general "binary safely
        represented as text" idea. They are also incompatible — paste one into a decoder expecting
        the other and you get a confusing error, or worse, a silently corrupted result. Every
        engineer eventually runs into this. Here is the difference, written down once.
      </p>

      <h2>The two-character difference</h2>

      <p>
        Standard Base64 (<a href="/tools/base64">RFC 4648 §4</a>) uses the alphabet:
      </p>

      <pre>
        <code>{`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`}</code>
      </pre>

      <p>
        That trailing <code>+</code> and <code>/</code> are the source of every base64url bug in
        history. Both are reserved characters in URLs:
      </p>

      <ul>
        <li><code>+</code> in a URL query string means a literal space (legacy form-encoding).</li>
        <li><code>/</code> is the path separator.</li>
      </ul>

      <p>
        A Base64-encoded value that happens to contain either character cannot be dropped into a
        URL — at best it confuses the routing layer, at worst it gets silently decoded as something
        else. So RFC 4648 §5 defined a URL-safe variant:
      </p>

      <pre>
        <code>{`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`}</code>
      </pre>

      <p>
        <code>+</code> becomes <code>-</code>, <code>/</code> becomes <code>_</code>, and padding
        (<code>=</code>) is usually omitted because <code>=</code> is also reserved in URLs.
        That is the entire difference. Two characters, plus the padding rule.
      </p>

      <h2>Where each one shows up</h2>

      <p>
        Standard Base64 is what you get from:
      </p>

      <ul>
        <li>The browser <code>btoa()</code> function (Latin-1 input only — see below).</li>
        <li>Node&apos;s <code>Buffer.from(s).toString(&apos;base64&apos;)</code>.</li>
        <li>Python&apos;s <code>base64.b64encode()</code>.</li>
        <li>OpenSSL&apos;s <code>-base64</code> flag, MIME-encoded email, HTTP Basic auth
          (<code>Authorization: Basic ...</code>), <code>data:</code> URIs, and X.509 certificate
          bodies (the bits between <code>-----BEGIN CERTIFICATE-----</code> lines).</li>
      </ul>

      <p>
        Base64url is what you get from:
      </p>

      <ul>
        <li>JWTs — every header, payload and signature segment is base64url-encoded.</li>
        <li>OAuth 2.0 PKCE code verifiers and challenges (<code>S256</code> output).</li>
        <li>Web Push <code>VAPID</code> keys.</li>
        <li>JSON Web Keys (JWKs).</li>
        <li><code>crypto.randomUUID()</code>-style identifiers when developers want them URL-safe.</li>
      </ul>

      <p>
        If you are working with auth, OAuth, JWTs or anything in the JOSE family, you are working
        with base64url. If you are working with files, certificates, mail attachments or HTTP
        headers, you are working with standard Base64.
      </p>

      <h2>The padding question</h2>

      <p>
        Both variants are length-padded to a multiple of four with <code>=</code> characters when
        the underlying byte length is not a multiple of three. Padding is mandatory in strict
        standard Base64. It is <em>optional</em> in base64url — most JWT libraries strip it on
        encode, but accept it (and accept missing padding) on decode.
      </p>

      <p>
        The practical implication: a JWT segment may or may not have trailing <code>=</code>. When
        decoding by hand, count the characters; if the count is not divisible by four, append{' '}
        <code>=</code> until it is.
      </p>

      <pre>
        <code>{`function base64urlToStandard(s) {
  return s
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(s.length + ((4 - (s.length % 4)) % 4), '=');
}

function standardToBase64url(s) {
  return s
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
}`}</code>
      </pre>

      <p>
        Those two functions are all the conversion code anyone needs. Keep them in a utility file
        and you will never have to rewrite them again.
      </p>

      <h2>The Unicode trap (this is not a base64url-specific issue, but it bites in the same code)</h2>

      <p>
        The browser <code>btoa()</code> function only accepts Latin-1 code points. Pass it a
        string containing an emoji or any non-Latin character and it throws{' '}
        <code>InvalidCharacterError</code>. This catches everyone, including people who think they
        are writing JWT code:
      </p>

      <pre>
        <code>{`btoa('café')        // throws
btoa('🚀')          // throws`}</code>
      </pre>

      <p>
        The fix is to encode the string as UTF-8 bytes first, then Base64-encode those bytes:
      </p>

      <pre>
        <code>{`function base64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}`}</code>
      </pre>

      <p>
        The intermediate <code>String.fromCharCode</code> trick is needed because{' '}
        <code>btoa</code> expects a string of one-byte-per-character. <code>TextEncoder</code>{' '}
        gives you a <code>Uint8Array</code>, which is the right concept but the wrong type. Modern
        code is better off skipping <code>btoa</code> entirely and using a small helper:
      </p>

      <pre>
        <code>{`function base64url(str) {
  const bytes = new TextEncoder().encode(str);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary)
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
}`}</code>
      </pre>

      <p>
        Our <a href="/tools/base64">Base64 encoder/decoder</a> already does the UTF-8 round-trip,
        so emoji and accented characters survive.
      </p>

      <h2>Where the bugs come from</h2>

      <p>
        In rough order of frequency:
      </p>

      <ol>
        <li>
          <strong>Copying a JWT segment into a "Base64 decoder".</strong> Standard Base64 decoders
          either reject the <code>-</code> and <code>_</code> characters or, worse, silently treat
          them as garbage. Either swap the characters first or use a tool that auto-detects.
        </li>
        <li>
          <strong>Pasting a Base64-encoded value into a URL.</strong> If the value contains{' '}
          <code>+</code> or <code>/</code>, the URL parser on the other end may URL-decode the{' '}
          <code>+</code> as a space, breaking the value. Convert to base64url before stuffing it
          into a URL.
        </li>
        <li>
          <strong>Padding mismatch.</strong> A library that demands strict padding will refuse a
          stripped base64url string. Add <code>=</code> characters back until the length is a
          multiple of 4.
        </li>
        <li>
          <strong>Double encoding.</strong> A value gets Base64-encoded, then the encoded result is
          URL-encoded by an HTTP layer that did not realize it was already URL-safe. You end up
          with <code>%2B</code> where a <code>+</code> used to be, or <code>%3D</code> for{' '}
          <code>=</code>. The fix is to use base64url so the URL layer has nothing to encode.
        </li>
        <li>
          <strong>Mixing line breaks in.</strong> MIME Base64 historically wraps at 76 characters
          with <code>\r\n</code>. Strict decoders reject the line breaks. Strip whitespace before
          decoding if you are reading from an email body or an OpenSSL output.
        </li>
      </ol>

      <h2>A note on Base64 in JSON</h2>

      <p>
        JSON has no native binary type, so binary values are almost always Base64-encoded strings
        inside a JSON field. Two conventions exist: most APIs use standard Base64; some — notably
        anything in the JWT / JOSE world — use base64url. Document which one your API expects, and
        validate at the boundary. The error message{' '}
        <em>"invalid character &apos;-&apos; in Base64 data"</em> usually means a client sent
        base64url where the server expected standard Base64.
      </p>

      <h2>The take-home</h2>

      <ul>
        <li>Base64 and base64url differ by two characters: <code>+/</code> versus <code>-_</code>.</li>
        <li>Base64url usually omits padding; standard Base64 keeps it.</li>
        <li>JWTs, OAuth PKCE, JWKs and Web Push use base64url. Almost everything else uses standard Base64.</li>
        <li>Two small functions convert between them. Keep them in a utility file.</li>
        <li>Always UTF-8 encode strings before <code>btoa()</code> — never trust it with Unicode input.</li>
        <li>
          When in doubt, paste into the <a href="/tools/base64">Base64 tool</a> — it autodetects
          and round-trips UTF-8 safely.
        </li>
      </ul>
    </>
  );
}
