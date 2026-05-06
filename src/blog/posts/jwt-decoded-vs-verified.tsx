export default function Post() {
  return (
    <>
      <p>
        Decoding a JWT and verifying a JWT are not the same thing. They are not even close. Confusing
        them is how almost every JWT auth bug starts — and it shows up in production code from people
        who should know better. Here is the difference, in plain terms.
      </p>

      <h2>What's actually inside a JWT</h2>

      <p>
        A JWT is three base64url-encoded segments separated by dots:
        <code> header.payload.signature</code>. The header and payload are JSON. The signature is
        the bit that gets cryptographically verified.
      </p>

      <pre>
        <code>{`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  .eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTUxNjIzOTAyMn0
  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}</code>
      </pre>

      <p>
        Decoded, that JSON looks like:
      </p>

      <pre>
        <code>{`// header
{ "alg": "HS256", "typ": "JWT" }

// payload
{ "sub": "1234567890", "name": "Ada Lovelace", "iat": 1516239022 }`}</code>
      </pre>

      <p>
        That's it. Three segments, two of them just JSON-in-base64. No magic.
      </p>

      <h2>Decoding: trivial</h2>

      <p>
        Decoding a JWT is exactly: split on the dots, base64url-decode the first two parts, parse
        each as JSON. You can do it in eight lines:
      </p>

      <pre>
        <code>{`function decode(token) {
  const [h, p] = token.split('.');
  return {
    header: JSON.parse(atob(h.replace(/-/g, '+').replace(/_/g, '/'))),
    payload: JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))),
  };
}`}</code>
      </pre>

      <p>
        Anyone who has the token can decode it. There is no key involved. No secret. The payload is
        not encrypted — it is signed.
      </p>

      <p>
        This is why we keep saying <strong>do not put secrets in JWTs</strong>. Every client that
        receives one can read every claim.
      </p>

      <h2>Verifying: completely different</h2>

      <p>
        Verifying a JWT means:
      </p>

      <ol>
        <li>Parse the header to read the <code>alg</code> field.</li>
        <li>
          Re-compute the signature over <code>header.payload</code> using the algorithm and your
          secret key (HS256) or public key (RS256).
        </li>
        <li>
          Compare your computed signature against the third segment of the token. If they don't
          match exactly, reject.
        </li>
        <li>
          Then check the <code>exp</code> claim — has the token expired?
        </li>
        <li>
          Then check <code>iss</code>, <code>aud</code>, <code>nbf</code> — is this actually a token
          your service should accept?
        </li>
      </ol>

      <p>
        Step 2 is the part you can't fake. Without the key, you can't produce a valid signature, and
        the receiving server will reject your token.
      </p>

      <h2>Where this goes wrong in real code</h2>

      <p>
        Two patterns I've watched ship to production:
      </p>

      <h3>Mistake 1: Using decoded claims as authorization</h3>

      <pre>
        <code>{`// DON'T DO THIS
const { payload } = decodeJwt(req.headers.authorization);
if (payload.role === 'admin') {
  return doAdminThing();
}`}</code>
      </pre>

      <p>
        This is a security hole. The attacker controls the token. They can set any claim they want
        in the payload and base64-encode it. Without verification, your server will trust whatever
        they sent.
      </p>

      <p>
        The fix is exactly one extra step:
      </p>

      <pre>
        <code>{`import { jwtVerify } from 'jose';

const { payload } = await jwtVerify(token, secret, {
  issuer: 'https://auth.example.com',
  audience: 'my-api',
});
if (payload.role === 'admin') {
  return doAdminThing();
}`}</code>
      </pre>

      <h3>Mistake 2: Trusting the alg header</h3>

      <p>
        Some libraries, given a token with <code>alg: "none"</code>, would skip signature
        verification entirely and accept the payload. This was a real CVE class for years.
      </p>

      <p>
        Modern libraries refuse <code>alg: none</code> by default. But the rule is broader: never
        let the token tell you which algorithm to verify with. Pin the algorithm in your code, not
        in the token's header.
      </p>

      <h2>Where decoding is fine</h2>

      <p>
        Decoding without verifying is perfectly OK in two scenarios:
      </p>

      <ul>
        <li>
          <strong>You're debugging.</strong> You want to see what claims are in there. That's why
          our <a href="/tools/jwt-decode">JWT Decoder</a> exists — paste a token, see the
          structure, no signature check involved.
        </li>
        <li>
          <strong>You're showing the user their own claims in the UI.</strong> The user already
          trusts what's in their session — they generated it. Reading <code>payload.name</code> to
          display "Welcome back, Ada" is fine.
        </li>
      </ul>

      <p>
        Decoding becomes dangerous the moment any authorization decision depends on the result.
      </p>

      <h2>The expiry trap</h2>

      <p>
        Even with verification, one more class of bug: clock skew. If your server's clock is off by
        more than a couple of minutes, you'll either reject valid tokens (clock fast) or accept
        recently-expired ones (clock slow). Run NTP. And give your verifier a small leeway — most
        libraries accept a <code>clockTolerance: 30</code> option.
      </p>

      <h2>The summary</h2>

      <ul>
        <li>
          <strong>Decoding</strong> shows you what's in the token. Anyone can do it. Use it for
          debugging only.
        </li>
        <li>
          <strong>Verifying</strong> proves the token came from someone with the key. Always do this
          before trusting any claim.
        </li>
        <li>Pin the algorithm in code; don't let the token pick it.</li>
        <li>Don't store secrets in the payload — it's not encrypted.</li>
        <li>Always check <code>exp</code>, <code>iss</code>, and <code>aud</code> after the signature.</li>
      </ul>

      <p>
        If you remember nothing else: the dot-separated string in the Authorization header is fully
        readable to anyone holding it. The signature is the only part that proves it's real.
      </p>
    </>
  );
}
