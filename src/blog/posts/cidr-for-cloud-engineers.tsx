export default function Post() {
  return (
    <>
      <p>
        Every cloud engineer eventually hits the moment of designing a VPC and having to pick CIDR
        ranges. The doc says &quot;use a /16&quot;. Why a /16? What does that even mean? And how do
        you split it into subnets without overlapping or running out of address space later? This
        post is the practical bitmath for cloud network design.
      </p>

      <h2>The slash notation, demystified</h2>

      <p>
        An IPv4 address is 32 bits. A CIDR like <code>10.0.0.0/16</code> means &quot;a network
        where the first 16 bits are fixed and the last 16 bits identify hosts within the
        network&quot;.
      </p>

      <pre>
        <code>{`10.0.0.0/16
─────┬─────  ─┬─
network    /  prefix length (how many bits are fixed)`}</code>
      </pre>

      <p>
        The prefix length determines the network size. The remaining bits are the host space:
      </p>

      <ul>
        <li><code>/16</code> = 16 host bits = 2^16 = 65,536 addresses</li>
        <li><code>/20</code> = 12 host bits = 4,096 addresses</li>
        <li><code>/24</code> = 8 host bits = 256 addresses</li>
        <li><code>/28</code> = 4 host bits = 16 addresses</li>
        <li><code>/30</code> = 2 host bits = 4 addresses (point-to-point links)</li>
        <li><code>/32</code> = 0 host bits = 1 address (single host)</li>
      </ul>

      <p>
        Two addresses in every block are reserved: the network address (all host bits zero) and
        the broadcast (all host bits one). So &quot;usable hosts&quot; is one less than the
        block size minus two for cloud VPCs (more on that below).
      </p>

      <h2>The cloud reservation surprise</h2>

      <p>
        AWS reserves not two but <strong>five</strong> addresses per subnet:
      </p>

      <ul>
        <li>The network address (.0)</li>
        <li>VPC router (.1)</li>
        <li>DNS server (.2)</li>
        <li>Reserved for future use (.3)</li>
        <li>The broadcast (.255 for a /24)</li>
      </ul>

      <p>
        That means a /28 in AWS gives you only 11 usable IPs, not 14. A /29 gives you 3, not 6. A
        /30 gives you 0 — completely unusable. GCP and Azure have similar but not identical
        conventions. Always check before sizing too small.
      </p>

      <h2>The standard cloud-network template</h2>

      <p>
        For most VPC designs, the recipe is:
      </p>

      <pre>
        <code>{`VPC:        10.0.0.0/16        (65,536 addresses)

Public  subnets (one per AZ):
  10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24

Private subnets (one per AZ):
  10.0.10.0/24, 10.0.11.0/24, 10.0.12.0/24

Database subnets (one per AZ):
  10.0.20.0/24, 10.0.21.0/24, 10.0.22.0/24`}</code>
      </pre>

      <p>
        That gives you 256 addresses per subnet (251 usable in AWS), 3 availability zones, and
        room to grow. The /16 has 65,536 addresses total — you have used 9 × 256 = 2,304. Plenty
        of breathing room.
      </p>

      <p>
        Why /24 for subnets? Because it is the largest size your operational eye can grok
        without effort, and it matches the third-octet boundary in dotted notation. <code>10.0.10.*</code>{' '}
        is obviously the AZ-A private subnet.
      </p>

      <h2>How to avoid overlap with other VPCs</h2>

      <p>
        The moment you peer VPCs or connect to a corporate network via VPN, overlapping CIDR
        ranges become a problem you cannot route around. The defensive pattern:
      </p>

      <ul>
        <li>Reserve a different /16 per environment. <code>10.0.0.0/16</code> for prod,{' '}
          <code>10.1.0.0/16</code> for staging, <code>10.2.0.0/16</code> for dev.</li>
        <li>Reserve a different /12 per region or account if you have many. <code>10.0.0.0/12</code>{' '}
          (covers 10.0–10.15) for us-east, <code>10.16.0.0/12</code> for us-west.</li>
        <li>
          Avoid <code>172.16.0.0/12</code> if your corporate network uses it (very common in
          enterprises).
        </li>
        <li>
          Stay out of the popular default ranges (<code>192.168.0.0/16</code>) so home users can
          VPN in without conflict.
        </li>
      </ul>

      <h2>The math you actually have to do</h2>

      <p>
        Three calculations come up over and over:
      </p>

      <h3>How many addresses does a /N have?</h3>

      <p>
        2^(32 - N). For /24: 2^8 = 256. For /20: 2^12 = 4,096. For /16: 2^16 = 65,536.
      </p>

      <h3>What is the next CIDR after a /N?</h3>

      <p>
        Add the size in addresses to the network address. After <code>10.0.0.0/24</code> comes{' '}
        <code>10.0.1.0/24</code>. After <code>10.0.0.0/20</code> comes <code>10.0.16.0/20</code>{' '}
        (because /20 has 4,096 addresses, and 0 + 4096 = 4096, which is 16 in the third octet).
      </p>

      <h3>Does CIDR A overlap CIDR B?</h3>

      <p>
        Take the network address of the longer prefix and mask it with the shorter prefix. If the
        result equals the shorter network address, they overlap.
      </p>

      <p>
        Example: does <code>10.0.5.0/24</code> overlap <code>10.0.0.0/16</code>? Mask{' '}
        <code>10.0.5.0</code> with /16 (keep first 16 bits, zero the rest): <code>10.0.0.0</code>.
        That equals the /16. So yes, they overlap (in fact /24 is fully inside /16).
      </p>

      <h2>Point-to-point links and /31</h2>

      <p>
        Site-to-site VPN tunnels, router-to-router links, and other point-to-point connections
        only need two addresses. Historically, you used a /30 (4 addresses, 2 usable). RFC 3021
        defined /31 as a special two-address point-to-point block where BOTH addresses are usable
        — there is no network/broadcast distinction.
      </p>

      <p>
        Use /31 when you can. It saves address space and is widely supported.
      </p>

      <h2>IPv6: the math is the same, the numbers are bigger</h2>

      <p>
        IPv6 prefixes work identically — <code>2001:db8::/32</code> means the first 32 bits are
        fixed. The host space is so big (96 bits for a /32) that there is no point reserving
        addresses for network/broadcast — IPv6 does not have a broadcast at all.
      </p>

      <p>
        Conventions for cloud:
      </p>

      <ul>
        <li>VPCs are /56 or /48 (16+ million addresses per subnet — more than the entire IPv4 space).</li>
        <li>Subnets are /64 (the standard, because SLAAC requires it).</li>
        <li>You never run out. Sizing concerns from IPv4 do not apply.</li>
      </ul>

      <h2>The cheat sheet</h2>

      <ul>
        <li>VPC: <code>10.0.0.0/16</code>. One per environment.</li>
        <li>Subnets: <code>/24</code> each. One per AZ per tier (public, private, database).</li>
        <li>AWS reserves 5 IPs per subnet, not 2.</li>
        <li>Avoid overlapping with any network you might ever peer with or VPN to.</li>
        <li>Stay in <code>10.0.0.0/8</code> for clouds; <code>172.16.0.0/12</code> often conflicts with corp networks; <code>192.168.0.0/16</code> conflicts with home networks.</li>
        <li>For point-to-point links, use /31.</li>
        <li>For doing the math by hand, the <a href="/tools/cidr-calculator">CIDR Calculator</a> shows you every field at once.</li>
      </ul>
    </>
  );
}
