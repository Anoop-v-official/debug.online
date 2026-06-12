export default function Post() {
  return (
    <>
      <p>
        Webhooks are how systems tell each other about events: a payment cleared, a deploy
        finished, a user signed up. They are also a tempting attack surface — your endpoint
        accepts traffic from anywhere, and the payload claims to come from a service you trust.
        HMAC signatures are how you turn &quot;claims to come from&quot; into &quot;actually came
        from&quot;. Here is how they work, and how to verify them safely.
      </p>

      <h2>The problem HMAC solves</h2>

      <p>
        Your webhook endpoint receives a POST that claims to be from Stripe. The body looks like a
        Stripe event. The headers look reasonable. How do you know it is not an attacker
        replaying or fabricating a payload?
      </p>

      <p>
        You could ask Stripe to authenticate with mTLS, a JWT, or basic auth, but most webhook
        providers use a simpler approach: when they send the request, they compute a signature of
        the body with a shared secret and include it in a header. You compute the same signature
        on your side. If they match, the request is genuine. If they do not, drop it.
      </p>

      <h2>What HMAC is, briefly</h2>

      <p>
        HMAC is a construction that turns a hash function (SHA-256, SHA-512) into a
        keyed-authentication code. The naive version, <code>SHA256(secret + message)</code>, is
        broken: length-extension attacks let an attacker append data to the message and produce a
        valid hash without knowing the secret.
      </p>

      <p>
        HMAC wraps the hash with two carefully-chosen XOR masks (<code>ipad</code> = 0x36,{' '}
        <code>opad</code> = 0x5C) in a nested construction:
      </p>

      <pre>
        <code>{`HMAC(K, m) = H( (K ⊕ opad) || H( (K ⊕ ipad) || m ) )`}</code>
      </pre>

      <p>
        The math means an attacker who can see HMAC outputs cannot forge new ones without the key.
        The output is the same size as the underlying hash — 32 bytes for HMAC-SHA-256.
      </p>

      <h2>What providers actually send</h2>

      <p>
        Every provider has slight conventions. The common patterns:
      </p>

      <h3>Stripe-style: timestamp + payload</h3>

      <pre>
        <code>{`Stripe-Signature: t=1740000000,v1=abc123…

signed_payload = "1740000000.{the_raw_body}"
expected_sig = HMAC-SHA-256(webhook_secret, signed_payload)
expected_sig == v1`}</code>
      </pre>

      <p>
        The timestamp is part of the signed payload so attackers cannot replay old requests
        forever. Reject anything more than ~5 minutes old.
      </p>

      <h3>GitHub-style: prefix in the header</h3>

      <pre>
        <code>{`X-Hub-Signature-256: sha256=abc123…

expected = "sha256=" + HMAC-SHA-256(webhook_secret, raw_body)
header == expected`}</code>
      </pre>

      <p>
        Simpler — body only, prefixed with the algorithm. GitHub does not include a timestamp, so
        replay protection is up to you (idempotency at the event level usually).
      </p>

      <h3>Slack-style: timestamp in a separate header</h3>

      <pre>
        <code>{`X-Slack-Request-Timestamp: 1740000000
X-Slack-Signature: v0=abc123…

basestring = "v0:" + timestamp + ":" + raw_body
expected = "v0=" + HMAC-SHA-256(signing_secret, basestring)
header == expected`}</code>
      </pre>

      <p>
        Same idea as Stripe but with the timestamp split out. Note the version prefix —{' '}
        <code>v0</code> is the current scheme; future versions would bump it.
      </p>

      <h2>The verification code that always works</h2>

      <p>
        In Node, the canonical verification looks like:
      </p>

      <pre>
        <code>{`import crypto from 'node:crypto';

function verifyWebhook(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const provided = signatureHeader.replace(/^sha256=/, '');

  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(provided, 'hex'),
  );
}`}</code>
      </pre>

      <p>
        Three things are critical:
      </p>

      <ol>
        <li>
          <strong>Verify on the raw body</strong>, not a parsed-and-re-serialized version. Most
          web frameworks parse JSON automatically; you need to capture the bytes before that
          happens. In Express, use the <code>raw</code> body parser; in Next.js, disable the
          body parser for the route.
        </li>
        <li>
          <strong>Use timing-safe comparison</strong>. A naive <code>==</code> compares byte by
          byte and short-circuits on the first mismatch — an attacker can measure response time
          to learn the signature one byte at a time. <code>timingSafeEqual</code> compares the
          full length in constant time.
        </li>
        <li>
          <strong>Same encoding on both sides</strong>. Hex on the wire, hex in the comparison.
          Base64 on the wire, base64 in the comparison. Mixing them is a frequent source of false
          rejections.
        </li>
      </ol>

      <h2>The mistakes that ship</h2>

      <p>
        In rough order of frequency:
      </p>

      <ul>
        <li>
          <strong>Verifying on the parsed body.</strong> Your framework JSON-parses the body, you
          re-stringify, and the resulting bytes do not match what was signed. Spaces and key
          order are different. Capture the raw body BEFORE parsing.
        </li>
        <li>
          <strong>Using <code>==</code> instead of timing-safe compare.</strong> Practical
          attacks exploiting this are rare in the wild, but the fix is one line.
        </li>
        <li>
          <strong>Not checking the timestamp.</strong> Without a recency check, an attacker who
          captures one valid request can replay it forever. Reject anything older than 5 minutes.
        </li>
        <li>
          <strong>Treating the secret as a hex string.</strong> Some providers display the secret
          as a base64 or hex value but actually expect the raw bytes for HMAC. Decode first.
        </li>
        <li>
          <strong>Returning 200 before verifying.</strong> Some frameworks send a default OK
          early. Make sure your handler runs verification before any response is committed.
        </li>
        <li>
          <strong>Logging the secret.</strong> Webhook secrets end up in logs, error reports,
          Sentry breadcrumbs. Add scrubbing, and rotate aggressively when you suspect leakage.
        </li>
      </ul>

      <h2>Storing webhook secrets</h2>

      <p>
        Treat them like passwords: environment variables, secret managers, never committed to
        git. One secret per provider per environment. Rotate when an employee leaves who had
        access, and have a tested procedure to do so without downtime.
      </p>

      <p>
        The pattern for zero-downtime rotation: accept BOTH the old and the new signing secret
        for a window of an hour or two. Update the provider to use the new secret. After the
        window, drop the old secret from your code. No webhook is missed.
      </p>

      <h2>What HMAC does not protect against</h2>

      <p>
        HMAC proves the request came from someone with the secret. It does not protect against:
      </p>

      <ul>
        <li>
          <strong>The secret leaking.</strong> If your secret is in a public GitHub commit, the
          signature is meaningless because anyone can produce valid ones.
        </li>
        <li>
          <strong>Replay attacks past the time window.</strong> Without a timestamp check, a
          valid request can be sent again.
        </li>
        <li>
          <strong>Idempotency.</strong> The same event delivered twice (because the provider
          retried) will have the same signature. Use event IDs to dedupe.
        </li>
        <li>
          <strong>Confidentiality.</strong> HMAC signs, it does not encrypt. The body is still in
          plaintext on the wire. Use HTTPS.
        </li>
      </ul>

      <h2>The take-home</h2>

      <ul>
        <li>HMAC turns &quot;trust me, this is from Stripe&quot; into provable origin.</li>
        <li>Always verify on the raw bytes, not a re-serialized payload.</li>
        <li>Always use constant-time comparison.</li>
        <li>Include a timestamp check to prevent replay.</li>
        <li>HMAC-SHA-256 is the modern default. Match what the provider documents.</li>
        <li>For ad-hoc testing, the <a href="/tools/hmac-generator">HMAC Generator</a> lets you reproduce any provider&apos;s signature locally.</li>
      </ul>
    </>
  );
}
