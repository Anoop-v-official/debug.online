export default function Post() {
  return (
    <>
      <p>
        For two decades the answer to "which UUID version should I use" was reflexive: v4. Random,
        boring, safe. As of 2026, that reflex deserves a second look. UUIDv7 is now a published
        standard (<a href="https://www.rfc-editor.org/rfc/rfc9562" rel="noreferrer">RFC 9562</a>),
        has implementations in every major language, and fixes the one real problem v4 has when
        you use it as a database primary key: insertion order. Here is when each one is right.
      </p>

      <h2>What the versions actually are</h2>

      <p>
        A UUID is a 128-bit value. The bits are not all equal — six of them are reserved to
        identify the version and the variant. The version digit appears in the third group of the
        canonical form:
      </p>

      <pre>
        <code>{`xxxxxxxx-xxxx-Vxxx-Yxxx-xxxxxxxxxxxx
                  ^      ^
                  |      variant (8, 9, a, b)
                  version (1, 4, 7, ...)`}</code>
      </pre>

      <ul>
        <li>
          <strong>v1</strong> — 60 bits of timestamp + 14 bits of clock sequence + a 48-bit "node"
          (originally the MAC address). Sortable, but leaks identifying information and the host
          MAC. Effectively deprecated for anything user-visible.
        </li>
        <li>
          <strong>v4</strong> — 122 random bits, 6 fixed bits. The default since the mid-2000s.
          What our <a href="/tools/uuid-generator">UUID generator</a> emits by default.
        </li>
        <li>
          <strong>v7</strong> — 48 bits of millisecond Unix timestamp + 74 random bits + 6 fixed
          bits. Sortable like v1, but without the MAC leak. New in 2024.
        </li>
        <li>
          <strong>v8</strong> — application-defined. Vendors put their own scheme inside the UUID
          envelope.
        </li>
      </ul>

      <p>
        v2, v3 and v5 exist (v3 and v5 are namespaced hashes) but you almost never need them.
      </p>

      <h2>The case for v4</h2>

      <p>
        For an identifier that does not need to be sortable, has no relationship to any wall clock,
        and just needs to be globally unique with negligible collision probability, v4 is still the
        right answer. It is:
      </p>

      <ul>
        <li>
          <strong>Trivially supported everywhere.</strong> Every language and database has a
          stable, well-tested implementation. The browser-native <code>crypto.randomUUID()</code>{' '}
          returns v4.
        </li>
        <li>
          <strong>Information-free.</strong> No timestamp, no machine ID, no monotonically
          increasing counter — nothing to leak. If a customer should not be able to learn anything
          from an ID (a row count, when an account was created, which node served it), v4 is the
          safe choice.
        </li>
        <li>
          <strong>Unguessable.</strong> 122 random bits means that, given one valid ID, you cannot
          predict any other valid ID. This matters if your IDs are used in user-visible URLs and
          you do not want enumeration attacks.
        </li>
      </ul>

      <p>
        Use v4 for request-IDs, correlation-IDs, idempotency keys, file names that must not
        collide, password reset tokens (with adequate length checks elsewhere), and anything you do
        not insert into a B-tree-indexed primary key column.
      </p>

      <h2>The case against v4 as a primary key</h2>

      <p>
        v4 is random. By design. That is the feature that makes it safe — and the property that
        makes it slow as a primary key in a clustered index.
      </p>

      <p>
        Postgres, MySQL InnoDB, SQL Server and most other relational databases store rows in
        physical order by primary key. A monotonically-increasing key (a bigint counter, a sortable
        UUID) appends new rows to the end of the index. A random key inserts new rows everywhere,
        which means:
      </p>

      <ul>
        <li>
          Page splits. New rows arrive in the middle of leaf pages, the engine has to split the
          page, half the rows move, the index fragments.
        </li>
        <li>
          Cache misses. The "hot" pages are spread across the whole table instead of clustered at
          the recent end, so the buffer pool has to keep more pages warm to handle the same write
          rate.
        </li>
        <li>
          Bigger indexes on disk and in memory, and slower range scans for time-ordered queries
          ("last 100 events") because there is no on-disk ordering to exploit.
        </li>
      </ul>

      <p>
        At low write rates this is not a problem you notice. At hundreds or thousands of writes per
        second, it is the difference between a healthy database and a database that needs
        emergency tuning.
      </p>

      <h2>The case for v7</h2>

      <p>
        UUIDv7 was designed specifically to fix this. The first 48 bits are a Unix millisecond
        timestamp, big-endian, so two UUIDs generated a millisecond apart sort in the right order.
        The remaining 74 random bits (after the version/variant overhead) give you uniqueness
        within a single millisecond — well over a quadrillion possibilities per millisecond per
        process, so collisions are not a realistic concern.
      </p>

      <p>
        A v7 looks like:
      </p>

      <pre>
        <code>{`018f5dba-1c34-7a91-b3d5-2e8c4f1a7b09
^^^^^^^^^^^^      ^
millisecond Unix time
                  version 7`}</code>
      </pre>

      <p>
        Read left-to-right: hex <code>018f5dba1c34</code> is{' '}
        <code>0x018f5dba1c34 = 1715694128692</code> ms since 1970, which is around{' '}
        <code>14 May 2024 14:22:08 UTC</code>. Sortable as a string.
      </p>

      <p>
        Use v7 for primary keys, anything you might put in a clustered index, anything you want to
        sort chronologically without a separate timestamp column, and anywhere you would have used
        a Twitter-style snowflake ID a few years ago.
      </p>

      <h2>What v7 gives up versus v4</h2>

      <p>
        Two things, both rarely a problem in practice but worth flagging:
      </p>

      <ol>
        <li>
          <strong>Approximate creation time leaks.</strong> Anyone with a v7 can read the
          millisecond it was generated. For a public-facing ID that&apos;s usually fine. For a
          password reset token or anything where the creation timestamp must be private, use v4.
        </li>
        <li>
          <strong>Reduced unguessability.</strong> 74 random bits is still vastly more than enough
          to make brute-force enumeration infeasible (you would need to guess one in 2^74 ≈ 10^22
          IDs), but it is meaningfully less than v4&apos;s 122. Treat IDs that need to be
          unpredictable, not just unique, as a v4 use case.
        </li>
      </ol>

      <h2>The migration question</h2>

      <p>
        If your database is fine, do not migrate. v7 fixes a problem v4 has, but only if you
        actually have that problem. The standard signs that you need to consider v7:
      </p>

      <ul>
        <li>
          Your primary keys are UUIDs, your tables are large (millions of rows or more), and your
          insert rate is high enough that index maintenance shows up in profiles.
        </li>
        <li>
          You are designing a new schema and the IDs will live for years.
        </li>
        <li>
          You want to drop a separate <code>created_at</code> column because it would duplicate the
          embedded timestamp.
        </li>
      </ul>

      <p>
        Migrating an existing table from v4 to v7 is invasive: you cannot retroactively make old
        IDs sortable. The realistic move is to switch new inserts to v7 and accept that the table
        will have a mixed-order section corresponding to the v4 era. New tables get v7 from the
        start.
      </p>

      <h2>UUIDv7 versus ULID</h2>

      <p>
        ULIDs are conceptually identical to v7: a 48-bit timestamp followed by 80 bits of random
        data, sortable, collision-resistant. The differences are surface:
      </p>

      <ul>
        <li>
          <strong>Encoding.</strong> ULIDs are Crockford base-32, so a ULID is 26 characters with
          no hyphens. UUIDv7 is the familiar 36-character hyphenated hex form.
        </li>
        <li>
          <strong>Standard.</strong> UUIDv7 is RFC 9562; ULID is a community spec. Adoption is
          comparable but UUIDv7 will probably win because it fits inside the existing UUID
          ecosystem (database column types, ORM integrations, OpenAPI <code>format: uuid</code>).
        </li>
      </ul>

      <p>
        If your stack already has a UUID column type and ORM support, UUIDv7 is the lower-friction
        choice. ULIDs remain attractive when you want shorter strings — useful in URLs that get
        copy-pasted by humans. We expose both via the <a href="/tools/uuid-generator">UUID
        generator</a> and the <a href="/tools/ulid-generator">ULID generator</a>.
      </p>

      <h2>How to generate v7 today</h2>

      <p>
        The browser-native <code>crypto.randomUUID()</code> still returns v4 only — there is a
        proposal to add a flag, but it has not shipped at the time of writing. To generate v7
        today, use a small library:
      </p>

      <pre>
        <code>{`// Node 22+ has built-in crypto.randomUUID with options; older versions use a userland lib
import { v7 } from 'uuid';
const id = v7();

// Python
import uuid
id = uuid.uuid7()  // available in python-uuid7 or via uuid_utils

// Go
import "github.com/google/uuid"
id, _ := uuid.NewV7()

// PostgreSQL 18+
SELECT uuidv7();`}</code>
      </pre>

      <h2>The take-home</h2>

      <ul>
        <li>v4 is still the right default when the ID has no relationship to time.</li>
        <li>v7 is the right default when the ID will be inserted into a clustered index.</li>
        <li>v7 leaks creation time; if that is a problem, stay on v4.</li>
        <li>For tokens that must be unguessable (password reset, session), use v4 or a longer random value.</li>
        <li>For new database primary keys in 2026, plan for v7. For existing tables, do not migrate unless you have measured pain.</li>
        <li>ULIDs and UUIDv7 solve the same problem; pick by ecosystem fit, not by raw merits.</li>
      </ul>
    </>
  );
}
