export default function Post() {
  return (
    <>
      <p>
        A regex that takes 5 milliseconds on one input and 30 seconds on a slightly longer one is
        not slow. It is exponential. The phenomenon has a name —{' '}
        <em>catastrophic backtracking</em> — and it has taken down a meaningful number of
        production systems, including the famous Cloudflare outage of July 2019 and the StackOverflow
        outage of July 2016. Both were caused by one regex line. Here is how to spot it before it
        gets near production.
      </p>

      <h2>What backtracking is</h2>

      <p>
        Most regex engines you use day to day — JavaScript, Python <code>re</code>, .NET, Perl,
        Java — implement a strategy called <em>backtracking NFA</em>. When a quantifier like{' '}
        <code>+</code> or <code>*</code> can match multiple lengths, the engine commits to the
        greediest interpretation first, then if a later part of the pattern fails, it backs up and
        tries a shorter one. This usually finishes in linear time.
      </p>

      <p>
        The problem appears when a pattern allows the same characters to be matched in many
        different ways and the input cannot satisfy the trailing requirement. The engine has to
        enumerate all the ways before giving up. Two patterns make this happen:
      </p>

      <ul>
        <li>
          <strong>Nested quantifiers.</strong> Something like <code>(a+)+</code> — an inner
          quantifier inside an outer quantifier where both can match the same substring.
        </li>
        <li>
          <strong>Overlapping alternation.</strong> Something like <code>(a|aa)+</code> — two
          branches that both consume <code>a</code>, so each <code>a</code> in the input can be
          assigned to either branch.
        </li>
      </ul>

      <h2>The classic example</h2>

      <p>
        Paste this into the <a href="/tools/regex-tester">regex tester</a> and try increasing the
        input length:
      </p>

      <pre>
        <code>{`Pattern: ^(a+)+$
Input:   aaaaaaaaaaaaaaaaaaaaaaaaab`}</code>
      </pre>

      <p>
        With 5 <code>a</code>s, the engine finishes in microseconds. With 20, in tens of
        milliseconds. With 30, several seconds. Add a few more and the browser tab hangs. The
        exponent is roughly 2^n where n is the number of <code>a</code>s — every additional
        character doubles the work.
      </p>

      <p>
        The pattern looks innocent and is something you might write while quickly sanity-checking
        "one or more groups of one or more <code>a</code>". Without the trailing <code>b</code>{' '}
        the engine matches happily; with the <code>b</code> that cannot match, the engine has to
        exhaustively try every way to partition the input <code>a</code>s between the inner and
        outer <code>+</code> before reporting failure.
      </p>

      <h2>The real-world patterns that bite</h2>

      <p>
        The reason this is not an academic problem is that the same shape appears in patterns
        people actually write. A few recurring offenders:
      </p>

      <pre>
        <code>{`# Email validation — looks reasonable
^([a-zA-Z0-9_\\.\\-]+)+@([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,}$

# Strip trailing whitespace on each line
^(\\s*.+)+$

# Naive URL matcher
^(https?://)?(www\\.)?([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}(/.*)?$

# CSV cell with optional quoting
"((?:[^"]|"")*)+"`}</code>
      </pre>

      <p>
        Each one has a nested quantifier where the inner and outer can match the same characters.
        Each one is fine for valid input. Each one explodes on a long string that <em>almost</em>{' '}
        matches but fails at the end. An attacker who can supply input to a server-side regex can
        cause an unbounded CPU spike — this is called a Regular Expression Denial of Service
        (ReDoS) attack, and it is a real CVE category.
      </p>

      <h2>How to spot it without running it</h2>

      <p>
        Three rules of thumb, in order of usefulness:
      </p>

      <ol>
        <li>
          <strong>Look for a quantifier inside a group that itself has a quantifier.</strong>{' '}
          <code>(a+)+</code>, <code>(a*)+</code>, <code>(a+)*</code>, <code>(.*)+</code> — all are
          suspect. The classic test: can the inner subpattern match an empty string or a
          one-character string in more than one way? If yes, the outer quantifier multiplies the
          ambiguity.
        </li>
        <li>
          <strong>Look for alternation where both branches can match the same prefix.</strong>{' '}
          <code>(a|aa)+</code>, <code>(\d+|\d+\.\d+)+</code>. If yes, the engine has to enumerate
          all the ways to split the input between the branches.
        </li>
        <li>
          <strong>Look for <code>.*</code> or <code>.+</code> followed by something that{' '}
          <code>.</code> could also match.</strong> <code>.*foo</code> against an input ending in{' '}
          <code>fobar</code> is fine; <code>.*\d+</code> against a long digit string is not,
          because <code>.</code> can match digits.
        </li>
      </ol>

      <h2>How to fix it</h2>

      <p>
        There are three reliable fixes, in roughly decreasing order of how much you should reach
        for each:
      </p>

      <h3>1. Make the inner part unambiguous</h3>

      <p>
        Replace the inner quantifier with a character class that doesn&apos;t overlap with the
        delimiter. For email-style validation, instead of:
      </p>

      <pre>
        <code>{`^([a-zA-Z0-9_\\.\\-]+)+@...`}</code>
      </pre>

      <p>
        Write:
      </p>

      <pre>
        <code>{`^[a-zA-Z0-9_\\.\\-]+@...`}</code>
      </pre>

      <p>
        The outer <code>+</code> was contributing nothing — one or more groups of one or more
        characters is the same as one or more characters. Remove the wrapping group entirely.
      </p>

      <h3>2. Use possessive quantifiers or atomic groups</h3>

      <p>
        Some engines (Java, PCRE, .NET, recent Python) support possessive quantifiers
        (<code>++</code>, <code>*+</code>, <code>?+</code>) and atomic groups (<code>(?&gt;...)</code>).
        Both tell the engine: <em>once you have committed to this match, do not back up.</em>{' '}
        That kills the exponential search.
      </p>

      <pre>
        <code>{`# Possessive — works in Java, PCRE, .NET, modern Python
^(a++)+$

# Atomic group — same idea, broader support
^(?>a+)+$`}</code>
      </pre>

      <p>
        JavaScript regex does not support either as of 2026, although the proposal is on track.
        For JavaScript-only code, fall back to fix 1 or fix 3.
      </p>

      <h3>3. Anchor or limit input length</h3>

      <p>
        If the regex must remain as written, validate input length at the boundary. ReDoS is only
        a problem at scale; a pattern that takes 30 seconds on 50 characters takes microseconds on
        20. Cap the input before you let it near the regex.
      </p>

      <pre>
        <code>{`if (input.length > 200) {
  throw new Error('input too long');
}
if (!riskyRegex.test(input)) { ... }`}</code>
      </pre>

      <p>
        This is not a real fix — it is a mitigation. The right fix is to write a non-exponential
        regex. But cap input length anyway as defense in depth.
      </p>

      <h2>RE2-style engines and where to use them</h2>

      <p>
        A separate engine family — RE2 (used by Go, the C++ RE2 library, and re2-wasm in Node) —
        guarantees linear time at the cost of forbidding backreferences and lookarounds. If you are
        processing untrusted input at scale, RE2 is the safer choice: it cannot catastrophically
        backtrack because it does not backtrack at all. The constraint of "no backreferences" turns
        out not to matter for most real patterns.
      </p>

      <p>
        Go and CloudFlare&apos;s post-2019 stack default to RE2. Python recently shipped{' '}
        <code>regex</code> as an alternative to <code>re</code> that supports possessive
        quantifiers. JavaScript has only the built-in backtracking engine, which is part of why
        client-side regex is more dangerous than it looks.
      </p>

      <h2>A debugging workflow</h2>

      <p>
        When a regex is suddenly slow in production:
      </p>

      <ol>
        <li>
          Pull a sample of the input strings that triggered the slowness. The exponential pattern
          fires on specific shapes, not on average traffic.
        </li>
        <li>
          Paste the pattern and one of the slow inputs into the{' '}
          <a href="/tools/regex-tester">regex tester</a>. If the tab hangs, you have your culprit.
        </li>
        <li>
          Simplify the pattern step by step. Remove one quantifier at a time, re-test. The
          quantifier whose removal restores linear time is your problem child.
        </li>
        <li>
          Rewrite using fix 1 (eliminate the nesting) when possible. Use fix 2 if your engine
          supports possessive matching. Use fix 3 as a stopgap until you have time to rewrite.
        </li>
      </ol>

      <h2>The take-home</h2>

      <ul>
        <li>Catastrophic backtracking is exponential. A pattern that is fast on short input may take seconds on slightly longer input.</li>
        <li>It shows up in nested quantifiers, overlapping alternation, and <code>.*</code> followed by something <code>.</code> could match.</li>
        <li>Most "looks reasonable" email/URL/CSV regexes have it. The classic ReDoS patterns are not academic.</li>
        <li>The right fix is to remove the ambiguity. The fallback is a possessive quantifier or atomic group. The mitigation is to cap input length.</li>
        <li>For untrusted input at scale, prefer an RE2-style engine. JavaScript&apos;s built-in regex is the most dangerous of the common ones.</li>
        <li>The <a href="/tools/regex-tester">regex tester</a> uses the JavaScript engine, so a pattern that hangs there will also hang in your code.</li>
      </ul>
    </>
  );
}
