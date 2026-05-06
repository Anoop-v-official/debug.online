export default function Post() {
  return (
    <>
      <p>
        If your team's transactional email is hitting spam folders, the cause is almost always one
        of three records: <strong>SPF</strong>, <strong>DKIM</strong>, or <strong>DMARC</strong>.
        Each is a TXT record in DNS. Each does a different job. And each fails in its own
        characteristic way. This is the practical debugging guide.
      </p>

      <h2>What each one actually does</h2>

      <p>
        <strong>SPF (Sender Policy Framework)</strong> answers: "Is this server allowed to send mail
        from this domain?" You publish a list of approved sending IPs. The receiver checks the
        envelope sender's domain, looks up the SPF record, and verifies the connecting IP is on the
        list.
      </p>

      <p>
        <strong>DKIM (DomainKeys Identified Mail)</strong> answers: "Was this message actually sent
        by someone holding the domain's private key?" The sending server cryptographically signs
        the message; the receiver fetches the public key from DNS and verifies the signature.
      </p>

      <p>
        <strong>DMARC (Domain-based Message Authentication, Reporting & Conformance)</strong>{' '}
        answers: "What should happen when SPF or DKIM fails?" It also adds the alignment requirement
        — the domain visible to the user (in the From header) has to match the domain SPF/DKIM
        validated.
      </p>

      <p>
        Think of them as: SPF is the IP allow-list, DKIM is the cryptographic signature, DMARC is
        the policy that ties them together.
      </p>

      <h2>Reading an SPF record</h2>

      <p>
        SPF lives at the apex of the domain as a single TXT record:
      </p>

      <pre>
        <code>{`debugdaily.online.   300   IN   TXT   "v=spf1 include:_spf.google.com include:mailgun.org -all"`}</code>
      </pre>

      <p>
        The pieces:
      </p>

      <ul>
        <li>
          <code>v=spf1</code> — the version. Always this.
        </li>
        <li>
          <code>include:_spf.google.com</code> — pull in Google's allow-list (Workspace mail).
        </li>
        <li>
          <code>include:mailgun.org</code> — pull in Mailgun's allow-list (transactional mail).
        </li>
        <li>
          <code>-all</code> — anything not matched fails hard. Other variants:
          <code> ~all</code> (soft fail; treat as suspicious),
          <code> ?all</code> (no policy),
          <code> +all</code> (allow everyone — never use this).
        </li>
      </ul>

      <p>
        <strong>The 10-lookup limit.</strong> SPF caps total DNS lookups at 10. Each
        <code> include: </code> costs one. Stack three transactional providers (each with their own
        nested includes) and you'll silently exceed it. Most receivers treat over-10 as
        "permerror" — same as no SPF at all. Use a flattening service if you need many providers.
      </p>

      <h2>Reading a DKIM record</h2>

      <p>
        DKIM lives at <code>{'<selector>'}._domainkey.example.com</code>. Each provider uses its
        own selector (Google Workspace uses <code>google</code>, Mailgun uses
        <code> mailo</code>, etc.).
      </p>

      <pre>
        <code>{`google._domainkey.debugdaily.online.   300   IN   TXT
  "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQ..."`}</code>
      </pre>

      <p>
        Important fields:
      </p>

      <ul>
        <li>
          <code>v=DKIM1</code> — version.
        </li>
        <li>
          <code>k=rsa</code> — key algorithm. Almost always RSA. <code>ed25519</code> is supported
          but rarely used.
        </li>
        <li>
          <code>p=...</code> — the public key. <strong>This is the part that breaks most often.</strong>
        </li>
      </ul>

      <p>
        TXT records have a 255-byte string limit. A 2048-bit RSA key is longer. Most DNS providers
        accept the long string and split it correctly across multiple sub-strings, but if your
        registrar's UI mangles it (truncates, adds whitespace, drops a character), the public key
        won't match what the sending server signs with — and every message will fail DKIM.
      </p>

      <h2>Reading a DMARC record</h2>

      <p>
        DMARC lives at <code>_dmarc.example.com</code>:
      </p>

      <pre>
        <code>{`_dmarc.debugdaily.online.   300   IN   TXT
  "v=DMARC1; p=reject; rua=mailto:dmarc-reports@debugdaily.online; pct=100; aspf=s; adkim=s"`}</code>
      </pre>

      <p>
        The key tags:
      </p>

      <ul>
        <li>
          <code>p=reject</code> — what to do when SPF and DKIM both fail. Other values:
          <code> none</code> (just report, do nothing),
          <code> quarantine</code> (mark as spam).
        </li>
        <li>
          <code>rua=mailto:...</code> — where to send aggregate reports. Set this; it's the only
          way to find out who's spoofing your domain.
        </li>
        <li>
          <code>pct=100</code> — percent of messages the policy applies to. Useful for gradual
          rollout (start at 10, raise to 100 once stable).
        </li>
        <li>
          <code>aspf=s, adkim=s</code> — strict alignment. Without these, "alignment" allows
          subdomain matches; with them, the From domain must match exactly.
        </li>
      </ul>

      <h2>The classic failure modes</h2>

      <h3>1. SPF passes, DKIM fails, DMARC rejects</h3>

      <p>
        Symptom: messages bounce or land in spam from one specific provider. SPF is configured
        correctly (the IP is allow-listed), but the DKIM signature doesn't validate.
      </p>

      <p>
        Causes: copy-paste error in the public key, wrong selector configured at the provider, or
        the provider rotated keys without you publishing the new selector.
      </p>

      <p>
        How to debug: send a test message to a Gmail address, view "Show original," and look at the
        <code> Authentication-Results </code> header. It'll say <code>dkim=fail (bad signature)</code>{' '}
        or <code>dkim=neutral (no key for signature)</code> — those are different fixes.
      </p>

      <h3>2. SPF and DKIM both pass, DMARC still fails</h3>

      <p>
        Cause: alignment. The domain SPF or DKIM validated isn't the same as the From header your
        users see.
      </p>

      <p>
        Common scenario: you're sending through Mailchimp's pool. Mailchimp signs with{' '}
        <code>mcsv.net</code>. SPF passes (the IP is in Mailchimp's allow-list, and the envelope
        sender is <code>bounces.mailchimp.com</code>). DKIM passes (the message is signed for{' '}
        <code>mcsv.net</code>). But your From: header is <code>hello@yourdomain.com</code>. DMARC
        says: "the validated domain has to match From." It doesn't. Reject.
      </p>

      <p>
        Fix: set up a CNAME so that Mailchimp signs as your domain (DKIM custom domain), and use a
        custom return-path so SPF aligns. Every transactional provider documents this.
      </p>

      <h3>3. DMARC reports show messages from IPs you don't recognize</h3>

      <p>
        That's the system working. The aggregate reports (<code>rua=mailto:...</code>) tell you
        every IP that tried to send mail claiming to be your domain. Some are legitimate services
        you forgot about (a status-page provider, a CRM). Others are real spoofing attempts.
      </p>

      <p>
        Read the reports. Find the legitimate ones, add them to SPF or get them onto a DKIM-signed
        path. Then move <code>p=none</code> → <code>p=quarantine</code> → <code>p=reject</code>.
        The whole process should take a few weeks if your sending estate is well-known, longer if
        it isn't.
      </p>

      <h2>The debugging order</h2>

      <p>
        When mail is broken, check in this order:
      </p>

      <ol>
        <li>
          Does the SPF record exist and is it under the 10-lookup limit? (
          <a href="/tools/dns-lookup">DNS Lookup</a> for the apex TXT record.)
        </li>
        <li>
          Does the DKIM record exist at the selector your sender uses? (DNS Lookup for
          <code> selector._domainkey.yourdomain.com</code>.)
        </li>
        <li>
          Does DMARC exist and what is its policy? (DNS Lookup for{' '}
          <code>_dmarc.yourdomain.com</code>.)
        </li>
        <li>
          Send a test message and read the receiving server's Authentication-Results header. Use
          our <a href="/tools/email-header-analyzer">Email Header Analyzer</a> to see SPF/DKIM/DMARC
          verdicts at a glance.
        </li>
        <li>
          If alignment is the issue, look at exactly which domain SPF and DKIM validated against
          and compare it to the From header.
        </li>
      </ol>

      <p>
        Most "my email isn't being delivered" support tickets are one of these five steps.
      </p>

      <h2>The take-home</h2>

      <ul>
        <li>SPF is the IP allow-list. DKIM is the signature. DMARC is the policy.</li>
        <li>
          Stay under SPF's 10-lookup limit. Stack too many providers and your record silently
          breaks.
        </li>
        <li>DKIM keys longer than 255 bytes need careful TXT record handling at the registrar.</li>
        <li>
          DMARC alignment requires the From domain to match the SPF/DKIM-validated domain — set up
          custom DKIM and SPF for every transactional provider.
        </li>
        <li>
          Always read the receiving server's Authentication-Results header. It'll tell you exactly
          which check failed.
        </li>
      </ul>
    </>
  );
}
