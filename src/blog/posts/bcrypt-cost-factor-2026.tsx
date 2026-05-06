export default function Post() {
  return (
    <>
      <p>
        Bcrypt has one knob: the cost factor. Set it too low and an attacker who steals your
        database can crack passwords in days. Set it too high and your login endpoint takes a full
        second per request. Six years ago, "10" was the safe default. In 2026, it isn't anymore.
      </p>

      <h2>What the cost factor actually does</h2>

      <p>
        The cost factor is the number of rounds, expressed as a power of 2. A cost of 10 means{' '}
        <code>2^10 = 1,024</code> internal iterations. A cost of 12 means <code>2^12 = 4,096</code>{' '}
        iterations. <strong>Each +1 doubles the work.</strong>
      </p>

      <p>
        That doubling is the entire point of bcrypt. It exists to make hashing slow — slow enough
        that an attacker who steals your hashed passwords cannot try billions of guesses per second.
      </p>

      <h2>The original "10 is fine" advice</h2>

      <p>
        When bcrypt was popularized in the mid-2010s, cost 10 took roughly 100 ms on a typical
        server CPU. That's the sweet spot most people quote: about 100 ms means a login takes
        a perceptibly slow but still-usable amount of time, while making bulk cracking costly.
      </p>

      <p>
        At cost 10 on a modern GPU farm, an attacker can try around{' '}
        <strong>30,000 hashes per second</strong>. That sounds like a lot until you realize a
        leaked database with weak passwords gets cracked in hours.
      </p>

      <h2>Why 10 stops being enough</h2>

      <p>
        Two things have changed since bcrypt's defaults were set:
      </p>

      <ol>
        <li>
          <strong>Hardware got faster.</strong> Each year, attackers' hash rate goes up. Bcrypt was
          designed to be GPU-unfriendly, but newer specialized hardware (and clever CPU
          implementations) have eaten into its margin.
        </li>
        <li>
          <strong>Servers got faster too.</strong> A login that took 100 ms in 2016 takes ~25 ms
          today on the same cost. Which means an unchanged cost factor gets cheaper for the
          attacker, AND has slack on the legitimate side.
        </li>
      </ol>

      <p>
        The OWASP recommendation as of 2024 is <strong>cost 10 minimum, cost 12+ preferred</strong>.
        The cost-12 rule of thumb is: ~250 ms on a typical server, which is about{' '}
        <strong>3,800 attacker hashes per second</strong> on a GPU. An order of magnitude harder
        than cost 10.
      </p>

      <h2>How to actually pick</h2>

      <p>
        Don't pick by Internet advice — pick by measurement. The right cost is "the highest one your
        login endpoint can tolerate." Aim for <strong>250–500 ms</strong> per hash on production
        hardware. Concretely:
      </p>

      <ol>
        <li>
          On the same server hardware that handles logins, time how long{' '}
          <code>bcrypt.hash(password, cost)</code> takes for cost values from 10 to 14.
        </li>
        <li>
          Pick the largest cost where the time is under your latency budget. A 250 ms hash is
          aggressive; 500 ms is fine for sites where login is a once-a-month action.
        </li>
        <li>
          Multiply by your concurrency. If 100 logins per second is realistic, hashing each one for
          500 ms means 50 hash-seconds of CPU per second — i.e. you need at least 50 cores spending
          that time only on hashes. Adjust if that doesn't fit.
        </li>
      </ol>

      <p>
        Our <a href="/tools/bcrypt-tester">Bcrypt Hash Tester</a> lets you do this in the browser
        for a quick "how slow is cost 14?" eyeball check. Don't ship browser numbers — production
        Node/Python is faster — but it's a fast way to feel the curve.
      </p>

      <h2>Cost migration without downtime</h2>

      <p>
        You don't have to rehash everyone's password to upgrade the cost. Standard pattern:
      </p>

      <pre>
        <code>{`async function login(email, password) {
  const user = await db.users.find({ email });
  if (!user) throw unauthorized();

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw unauthorized();

  // Lazy upgrade: if their hash uses an old cost, rehash now.
  if (bcrypt.getRounds(user.passwordHash) < TARGET_COST) {
    const newHash = await bcrypt.hash(password, TARGET_COST);
    await db.users.update(user.id, { passwordHash: newHash });
  }

  return signSession(user);
}`}</code>
      </pre>

      <p>
        Every successful login at the old cost gets transparently upgraded. Inactive users keep
        their old hashes — a real risk if they don't log in, but no worse than before.
      </p>

      <h2>The 72-byte truncation</h2>

      <p>
        Bcrypt silently truncates input at 72 bytes. If your users have long passphrases, only the
        first 72 bytes are hashed — the rest is discarded. Two passphrases that share the first 72
        bytes will hash to the same value.
      </p>

      <p>
        The standard fix is to pre-hash with SHA-256 before bcrypt:
      </p>

      <pre>
        <code>{`const prehashed = crypto.createHash('sha256').update(password).digest('base64');
const finalHash = await bcrypt.hash(prehashed, cost);`}</code>
      </pre>

      <p>
        You now hash a fixed-length 44-character base64 string regardless of the original
        passphrase length. This pattern is sometimes called "pepper-style" and is what Dropbox uses.
      </p>

      <h2>When to leave bcrypt entirely</h2>

      <p>
        Bcrypt is fine. It's not the fashionable choice anymore — argon2id is. The differences:
      </p>

      <ul>
        <li>
          <strong>Argon2id</strong> is memory-hard. It's harder to attack with GPUs because GPUs
          have lots of cores but limited memory bandwidth. The 2015 password hashing competition
          winner.
        </li>
        <li>
          <strong>scrypt</strong> is similar in spirit, slightly older. Bitcoin uses it for
          proof-of-work.
        </li>
        <li>
          <strong>bcrypt</strong> is older still, but battle-tested. Every language has a stable
          implementation. It's still acceptable in 2026.
        </li>
      </ul>

      <p>
        For new projects, argon2id is the better default if your stack has a stable library. For
        existing bcrypt deployments, the migration is rarely worth it — bumping the cost factor and
        adding lazy rehash gets you most of the way without a one-way migration.
      </p>

      <h2>The take-home</h2>

      <ul>
        <li>Cost 10 is no longer enough. Move to 12 or higher.</li>
        <li>Pick the cost by measurement on your production hardware, not by Internet advice.</li>
        <li>Use lazy rehashing on login to upgrade existing hashes without forcing resets.</li>
        <li>SHA-256 pre-hash to dodge the 72-byte truncation if your users use long passphrases.</li>
        <li>For greenfield, argon2id is the modern default. Bcrypt is acceptable, not fashionable.</li>
      </ul>
    </>
  );
}
