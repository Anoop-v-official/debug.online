export default function Post() {
  return (
    <>
      <p>
        DNS is one of those systems most engineers half-understand. You know <code>A</code> records
        point a name at an IP, you know <code>MX</code> is for mail, and you know <code>TXT</code> is
        where SPF lives. But why <em>those</em> specific record types? What's the boundary between them?
        And which one do you reach for when you're configuring a fresh domain at 2 a.m.?
      </p>

      <p>
        This is the practical map. No "RFC 1035 says…" — just what each record actually does, when
        you'd use it, and the failure modes that bite people in production.
      </p>

      <h2>The shape of a DNS record</h2>

      <p>
        Every DNS record is a tuple: <code>name, type, value, TTL</code>. The <strong>name</strong> is
        what you're asking about (<code>www.debugdaily.online</code>). The <strong>type</strong> tells
        the resolver what kind of answer you want (an IP, a hostname, an arbitrary string). The
        <strong> value</strong> is the answer. The <strong>TTL</strong> tells caches how long they
        can keep the answer before re-fetching.
      </p>

      <p>
        Get the type right and DNS is boring. Get it wrong and you'll spend an afternoon debugging
        "but it works for me" issues that aren't really bugs — just stale caches.
      </p>

      <h2>A: the workhorse</h2>

      <p>
        An <code>A</code> record maps a name to an IPv4 address. That's the entire job.
        Almost every DNS lookup that matters ends in an <code>A</code> record somewhere.
      </p>

      <pre>
        <code>{`debugdaily.online.   300   IN   A   76.76.21.21`}</code>
      </pre>

      <p>
        <strong>When to use it:</strong> apex domains pointing at a server, CDN, or load balancer.
        For anything subdomain-shaped that has a single hostname target (Vercel, Netlify, GitHub
        Pages), prefer <code>CNAME</code> instead — easier to update.
      </p>

      <p>
        <strong>Gotcha:</strong> the apex (the bare domain like <code>debugdaily.online</code>) cannot
        legally hold a <code>CNAME</code> per RFC 1912. Most managed DNS providers fake this with an
        ALIAS / ANAME record, but if you're at a basic registrar, your only option for the apex is
        <code> A</code>.
      </p>

      <h2>AAAA: the IPv6 cousin</h2>

      <p>
        <code>AAAA</code> ("quad-A") is identical to <code>A</code> in shape but holds an IPv6
        address. If your provider supports IPv6 (Cloudflare, AWS ALB, Vercel), publishing
        <code> AAAA </code> records gets you faster paths for clients on IPv6 networks.
      </p>

      <p>
        <strong>Gotcha:</strong> if you publish <code>AAAA</code> but your origin can't actually
        accept IPv6 traffic, dual-stack clients will silently fail to one and slowly time out before
        falling back to IPv4. Either publish both or neither.
      </p>

      <h2>CNAME: alias</h2>

      <p>
        A <code>CNAME</code> says "this name is really an alias for that other name." When a resolver
        looks up <code>www.debugdaily.online</code> and finds a <code>CNAME</code> pointing at
        <code> debugdaily.online</code>, it does a second lookup against that target.
      </p>

      <pre>
        <code>{`www.debugdaily.online.   3600   IN   CNAME   debugdaily.online.`}</code>
      </pre>

      <p>
        <strong>When to use it:</strong> subdomains pointing at a single hostname target — Vercel,
        Netlify, your CDN, etc. You get the benefit that the target's own A records can change
        without you touching anything.
      </p>

      <p>
        <strong>Two big gotchas:</strong>
      </p>

      <ul>
        <li>
          A <code>CNAME</code> is exclusive — a name with a <code>CNAME</code> can't have any other
          record types (<code>A</code>, <code>TXT</code>, <code>MX</code>) under it. So you can't put
          a <code>CNAME</code> at apex if you also need an <code>MX</code> there.
        </li>
        <li>
          Each <code>CNAME</code> hop costs another DNS lookup. Chains of CNAMEs (
          <code>www → app → cdn → origin</code>) add real latency. Two hops is fine; five is a
          problem.
        </li>
      </ul>

      <h2>MX: where mail goes</h2>

      <p>
        <code>MX</code> records say "if you want to send mail to this domain, deliver it to these
        hostnames in this order of preference." Each <code>MX</code> record has a priority number;
        lower numbers are tried first.
      </p>

      <pre>
        <code>{`debugdaily.online.   3600   IN   MX   10   aspmx.l.google.com.
debugdaily.online.   3600   IN   MX   20   alt1.aspmx.l.google.com.`}</code>
      </pre>

      <p>
        <strong>Gotcha:</strong> <code>MX</code> values must be hostnames, never IPs. If your
        registrar's UI lets you type an IP into the MX field, it's accepting bad data — every
        sending mail server will reject it.
      </p>

      <h2>TXT: the everything bucket</h2>

      <p>
        <code>TXT</code> records hold arbitrary strings. They started as a free-form notes field;
        modern DNS uses them for a stack of crucial things:
      </p>

      <ul>
        <li>
          <strong>SPF</strong> — declares which servers are allowed to send mail "from" your domain.
          Starts with <code>v=spf1</code>.
        </li>
        <li>
          <strong>DKIM</strong> — public key used to verify mail signatures. Lives at
          <code> selector._domainkey.example.com</code>.
        </li>
        <li>
          <strong>DMARC</strong> — policy on what to do when SPF/DKIM fail. Lives at
          <code> _dmarc.example.com</code>.
        </li>
        <li>
          <strong>Domain verification</strong> — Google, Microsoft, Vercel, GitHub, and basically
          every SaaS asks you to publish a TXT record proving you control the domain.
        </li>
      </ul>

      <p>
        <strong>Gotcha:</strong> <code>TXT</code> records have a 255-byte limit per string, but you
        can publish multiple strings under one record and they get concatenated. A long DKIM key
        often spans two strings. If your registrar's UI mangles this, you'll spend a frustrating
        afternoon wondering why mail keeps being marked as spam.
      </p>

      <h2>NS: the boundary record</h2>

      <p>
        <code>NS</code> records list the authoritative name servers for a zone. When you delegate a
        subdomain to a different DNS provider (e.g. <code>api.example.com</code> handled by AWS
        Route 53 while the apex is at Cloudflare), <code>NS</code> records mark the boundary.
      </p>

      <p>
        <strong>When to care:</strong> almost never, until you do — at which point misconfigured
        <code> NS </code> delegation is the most painful kind of DNS bug, because resolvers cache it
        for hours and changes can take a full day to propagate.
      </p>

      <h2>The real production gotcha: TTL</h2>

      <p>
        TTL is a count of seconds telling caches how long to remember the answer. Three numbers worth
        memorizing:
      </p>

      <ul>
        <li>
          <strong>300 (5 min):</strong> short TTL, friendly to changes. Use during migrations or for
          records you might need to flip in an emergency.
        </li>
        <li>
          <strong>3600 (1 hour):</strong> reasonable default for stable records.
        </li>
        <li>
          <strong>86400 (24 hours):</strong> long TTL, friendly to load. Use for records that almost
          never change (apex domain at a major CDN).
        </li>
      </ul>

      <p>
        <strong>Pro move:</strong> a few days <em>before</em> a planned change, lower the TTL to 300.
        After the change is stable, raise it back. This shrinks the window during which half the
        internet is using stale data.
      </p>

      <h2>Tools we built around this</h2>

      <p>
        We have a few tools at <a href="/">debugdaily.online</a> that come up constantly when
        debugging DNS:
      </p>

      <ul>
        <li>
          <a href="/tools/dns-lookup">DNS Lookup</a> — query A, AAAA, MX, TXT, NS, CNAME against
          public resolvers (Cloudflare, Google).
        </li>
        <li>
          <a href="/tools/whois">WHOIS Lookup</a> — registrar, expiry, nameservers via RDAP.
        </li>
        <li>
          <a href="/tools/ssl-check">SSL Certificate Checker</a> — for when DNS works but the cert is
          the actual issue.
        </li>
        <li>
          <a href="/tools/email-header-analyzer">Email Header Analyzer</a> — when SPF/DKIM/DMARC
          starts to look broken.
        </li>
      </ul>

      <p>
        DNS is boring when it works and the worst kind of late-night puzzle when it doesn't. Every
        sysadmin eventually develops the muscle memory for these record types. Hopefully this map
        shaves a few months off the process.
      </p>
    </>
  );
}
