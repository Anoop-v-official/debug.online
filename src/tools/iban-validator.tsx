import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['iban-validator']!;

// Country code → expected total length
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28, BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  BY: 28, CH: 21, CR: 22, CY: 28, CZ: 24, DE: 22, DK: 18, DO: 28, EE: 20, EG: 29,
  ES: 24, FI: 18, FO: 18, FR: 27, GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HR: 21, HU: 28, IE: 22, IL: 23, IQ: 23, IS: 26, IT: 27, JO: 30, KW: 30, KZ: 20,
  LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21, MC: 27, MD: 24, ME: 22, MK: 19,
  MR: 27, MT: 31, MU: 30, NL: 18, NO: 15, PK: 24, PL: 28, PS: 29, PT: 25, QA: 29,
  RO: 24, RS: 22, SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, ST: 25, SV: 28, TL: 23,
  TN: 24, TR: 26, UA: 29, VG: 24, XK: 20,
};

function normalize(s: string): string {
  return s.toUpperCase().replace(/\s+/g, '').replace(/[^A-Z0-9]/g, '');
}

function letterToDigits(c: string): string {
  return String(c.charCodeAt(0) - 55); // A=10..Z=35
}

function mod97(s: string): number {
  // process in 9-digit chunks to stay inside safe integer
  let rem = 0;
  for (let i = 0; i < s.length; i += 7) {
    const chunk = String(rem) + s.slice(i, i + 7);
    rem = Number(chunk) % 97;
  }
  return rem;
}

interface ValidResult {
  ok: true;
  country: string;
  checkDigits: string;
  bban: string;
  formatted: string;
}
interface InvalidResult {
  ok: false;
  reason: string;
}

function validate(raw: string): ValidResult | InvalidResult {
  const iban = normalize(raw);
  if (iban.length < 4) return { ok: false, reason: 'IBAN is too short.' };
  const country = iban.slice(0, 2);
  const check = iban.slice(2, 4);
  const bban = iban.slice(4);
  const expected = IBAN_LENGTHS[country];
  if (!expected) return { ok: false, reason: `Unknown country code "${country}".` };
  if (iban.length !== expected) {
    return {
      ok: false,
      reason: `${country} IBANs are ${expected} characters; got ${iban.length}.`,
    };
  }
  if (!/^\d{2}$/.test(check)) return { ok: false, reason: 'Check digits must be numeric.' };

  // Rearrange: move first 4 chars to the end, replace letters with numbers
  const rearranged = (bban + country + check)
    .split('')
    .map((c) => (/[A-Z]/.test(c) ? letterToDigits(c) : c))
    .join('');

  if (mod97(rearranged) !== 1) {
    return { ok: false, reason: 'Check digits do not validate (mod-97 failed).' };
  }

  return {
    ok: true,
    country,
    checkDigits: check,
    bban,
    formatted: iban.match(/.{1,4}/g)?.join(' ') ?? iban,
  };
}

export default function IbanValidator() {
  const [input, setInput] = useState('GB29 NWBK 6016 1331 9268 19');
  const result = useMemo(() => validate(input), [input]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input }),
        applyState: (s) => {
          const v = s as { input?: string };
          if (typeof v.input === 'string') setInput(v.input);
        },
      }}
    >
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input font-mono"
          spellCheck={false}
          placeholder="GB29 NWBK 6016 1331 9268 19"
        />

        {result.ok ? (
          <div className="card p-4 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-accent">✓ Valid</span>
              <span className="text-2xs text-subtle font-mono uppercase tracking-wide">
                mod-97 passes
              </span>
            </div>
            <div className="font-mono text-base text-text break-all">{result.formatted}</div>
            <div className="grid sm:grid-cols-3 gap-2 text-sm font-mono">
              <Row label="Country" value={result.country} />
              <Row label="Check digits" value={result.checkDigits} />
              <Row label="BBAN" value={result.bban} />
            </div>
          </div>
        ) : (
          <div className="card p-4 border-error/40 bg-error/5">
            <div className="font-display text-2xl font-semibold text-error mb-1">✕ Invalid</div>
            <div className="text-sm text-muted">{result.reason}</div>
          </div>
        )}

        <p className="text-2xs text-subtle font-mono">
          Validates structure (country length) and the mod-97 check used by all ISO 13616 IBANs. Does NOT verify the account actually exists — that requires bank-side lookups.
        </p>
      </div>
    </ToolFrame>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-2.5">
      <div className="text-2xs uppercase tracking-wide text-subtle">{label}</div>
      <div className="text-text break-all mt-0.5">{value}</div>
    </div>
  );
}
