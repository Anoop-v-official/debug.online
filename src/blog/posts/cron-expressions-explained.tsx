export default function Post() {
  return (
    <>
      <p>
        Cron expressions look like a five-character puzzle: <code>0 0 * * *</code>. Stare at them
        long enough and the meaning starts to surface. But you shouldn't have to. This is a
        practical guide to reading, writing, and debugging cron — including the parts that vary
        between Unix, AWS EventBridge, and Quartz.
      </p>

      <h2>The five fields, in order</h2>

      <p>
        Standard Unix cron has five space-separated fields:
      </p>

      <pre>
        <code>{`*  *  *  *  *
│  │  │  │  └─ day of week  (0–7, where 0 and 7 both mean Sunday)
│  │  │  └──── month        (1–12, or JAN–DEC)
│  │  └─────── day of month (1–31)
│  └────────── hour          (0–23)
└───────────── minute        (0–59)`}</code>
      </pre>

      <p>
        Reading left-to-right is the small-to-big rule: minute → hour → day → month → weekday. Once
        that ordering is in your head, the rest is just symbols.
      </p>

      <h2>The four symbols you actually need</h2>

      <p>
        <strong>Star (<code>*</code>):</strong> any value. <code>* * * * *</code> means "every minute,
        of every hour, of every day, of every month, on every weekday" — that is, every 60 seconds
        forever.
      </p>

      <p>
        <strong>Comma (<code>,</code>):</strong> a list. <code>0 9,17 * * *</code> means "at 9:00
        AND 17:00 every day." Use this when there are a few specific values.
      </p>

      <p>
        <strong>Dash (<code>-</code>):</strong> a range. <code>0 9-17 * * *</code> means "at the top
        of every hour from 9 through 17." Use this when there are many consecutive values.
      </p>

      <p>
        <strong>Slash (<code>/</code>):</strong> step. <code>{'*/15 * * * *'}</code> means "every
        15 minutes." Combine with a range: <code>0-30/5 * * * *</code> means "every 5 minutes during
        the first half of each hour."
      </p>

      <p>
        That's basically all of standard cron. Once you can compose those four symbols across the
        five fields, you can express any periodic schedule.
      </p>

      <h2>Common patterns worth memorizing</h2>

      <ul>
        <li>
          <code>0 * * * *</code> — at the top of every hour
        </li>
        <li>
          <code>{'*/15 * * * *'}</code> — every 15 minutes
        </li>
        <li>
          <code>0 0 * * *</code> — every day at midnight
        </li>
        <li>
          <code>0 9 * * 1-5</code> — every weekday at 9 AM (business hours start)
        </li>
        <li>
          <code>{'*/15 9-17 * * 1-5'}</code> — every 15 minutes during business hours, weekdays
        </li>
        <li>
          <code>0 0 * * 0</code> — every Sunday at midnight
        </li>
        <li>
          <code>0 0 1 * *</code> — first day of every month at midnight
        </li>
        <li>
          <code>0 0 1 1 *</code> — January 1st at midnight (yearly)
        </li>
      </ul>

      <h2>The aliases</h2>

      <p>
        Most cron implementations accept named shortcuts:
      </p>

      <ul>
        <li>
          <code>@yearly</code> = <code>0 0 1 1 *</code>
        </li>
        <li>
          <code>@monthly</code> = <code>0 0 1 * *</code>
        </li>
        <li>
          <code>@weekly</code> = <code>0 0 * * 0</code>
        </li>
        <li>
          <code>@daily</code> (= <code>@midnight</code>) = <code>0 0 * * *</code>
        </li>
        <li>
          <code>@hourly</code> = <code>0 * * * *</code>
        </li>
      </ul>

      <p>
        Use these when they fit. They're more readable than the equivalent numeric form.
      </p>

      <h2>The day-of-month / day-of-week trap</h2>

      <p>
        Here's the part that surprises people: when you specify both day-of-month and day-of-week,
        most implementations treat them as <strong>OR</strong>, not AND. So:
      </p>

      <pre>
        <code>0 0 13 * 5</code>
      </pre>

      <p>
        is "midnight on the 13th of any month, OR midnight every Friday" — not "midnight on
        Friday the 13th." If you need the AND semantics, you usually have to do it in the job's own
        code (check `if today is Friday the 13th, run`).
      </p>

      <p>
        Quartz handles this differently: it requires you to use <code>?</code> in one of the two
        fields when the other is set. We'll get to Quartz in a moment.
      </p>

      <h2>The dialects: Unix vs Quartz vs AWS</h2>

      <p>
        Standard Unix cron has 5 fields. Two common variants extend it.
      </p>

      <h3>Quartz (Java schedulers, Spring)</h3>

      <p>
        Quartz uses <strong>6 or 7 fields</strong>: seconds, minute, hour, day-of-month, month,
        day-of-week, and optional year. So <code>0 0 12 ? * MON-FRI</code> is "noon every weekday."
        The leading <code>0</code> is seconds. The <code>?</code> means "no specific value" — used
        when day-of-month and day-of-week are mutually exclusive.
      </p>

      <p>
        The standout features Quartz adds:
      </p>

      <ul>
        <li>
          <code>L</code> — last. <code>0 0 0 L * ?</code> = "midnight on the last day of every
          month."
        </li>
        <li>
          <code>W</code> — nearest weekday. <code>0 0 0 15W * ?</code> = "the weekday closest to
          the 15th."
        </li>
        <li>
          <code>#</code> — Nth weekday. <code>0 0 0 ? * 2#3</code> = "the third Monday of every
          month."
        </li>
      </ul>

      <h3>AWS EventBridge / CloudWatch Events</h3>

      <p>
        AWS uses <strong>6 fields</strong>, no seconds: minute, hour, day-of-month, month,
        day-of-week, year. They also require either day-of-month or day-of-week to be{' '}
        <code>?</code> if the other is specified — same idea as Quartz.
      </p>

      <p>
        AWS-specific examples:
      </p>

      <ul>
        <li>
          <code>cron(0 12 * * ? *)</code> — every day at noon UTC
        </li>
        <li>
          <code>cron(0/15 * * * ? *)</code> — every 15 minutes
        </li>
        <li>
          <code>cron(0 18 ? * MON-FRI *)</code> — 6 PM UTC on weekdays
        </li>
      </ul>

      <p>
        Watch for: AWS EventBridge runs in <strong>UTC</strong> only. If you want "9 AM Pacific
        every weekday," you have to convert to UTC manually and remember it shifts by an hour
        across DST. (You're not the first person to be tripped up by that.)
      </p>

      <h2>The two debugging questions</h2>

      <p>
        When a cron job isn't behaving, ask:
      </p>

      <h3>1. What does this expression actually mean in English?</h3>

      <p>
        Plug it into our <a href="/tools/cron-parser">Cron Expression Explainer</a>. If the
        plain-English translation doesn't match what you intended, the bug is in the expression.
      </p>

      <h3>2. When does it fire next?</h3>

      <p>
        Many cron parsers can compute the next N fire times. Comparing those against your
        expectation usually surfaces the bug instantly. If a "every Monday at 9 AM" job's next-fire
        list shows Friday in there, you set the day-of-week field wrong.
      </p>

      <h2>Timezones, the silent footgun</h2>

      <p>
        Vanilla Unix cron runs in the system timezone. AWS runs in UTC. Quartz can be configured
        per-trigger. Kubernetes CronJobs run in UTC by default but can specify a timezone.
      </p>

      <p>
        The result: a single expression like <code>0 9 * * *</code> can mean "9 AM in Mumbai" on one
        host, "9 AM UTC" in EventBridge, and "9 AM in whatever your laptop is" when you test
        locally. Pick a convention (we recommend UTC for everything) and write it down.
      </p>

      <h2>The take-home</h2>

      <ul>
        <li>Five fields: minute, hour, day-of-month, month, day-of-week.</li>
        <li>Four symbols: <code>*</code> (any), <code>,</code> (list), <code>-</code> (range), <code>/</code> (step).</li>
        <li>Day-of-month and day-of-week combine with OR, not AND, in standard cron.</li>
        <li>
          Quartz and AWS use 6+ fields, and use <code>?</code> when day-of-month/day-of-week are
          mutually exclusive.
        </li>
        <li>
          Always confirm your timezone — UTC vs system vs explicit. Write it down somewhere.
        </li>
        <li>
          When in doubt, use the <a href="/tools/cron-parser">cron explainer</a> and read the
          plain-English translation. If it doesn't match your intent, the expression is wrong.
        </li>
      </ul>
    </>
  );
}
