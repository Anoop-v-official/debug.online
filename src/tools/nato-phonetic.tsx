import { useMemo, useState } from 'react';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['nato-phonetic']!;

const NATO: Record<string, string> = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot',
  G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima',
  M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo',
  S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray',
  Y: 'Yankee', Z: 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
};

function transliterate(s: string, sep: string): string {
  return s
    .toUpperCase()
    .split('')
    .map((c) => {
      if (NATO[c]) return NATO[c];
      if (c === ' ') return '(space)';
      if (c === '-') return 'Dash';
      if (c === '.') return 'Stop';
      return c;
    })
    .join(sep);
}

export default function NatoPhonetic() {
  const [input, setInput] = useState('Order-66');
  const [sep, setSep] = useState<' ' | ' - ' | '\n'>(' ');

  const output = useMemo(() => transliterate(input, sep), [input, sep]);

  return (
    <ToolFrame
      tool={tool}
      share={{
        getState: () => ({ input, sep }),
        applyState: (s) => {
          const v = s as { input?: string; sep?: typeof sep };
          if (typeof v.input === 'string') setInput(v.input);
          if (v.sep === ' ' || v.sep === ' - ' || v.sep === '\n') setSep(v.sep);
        },
      }}
      actions={
        <select
          value={sep}
          onChange={(e) => setSep(e.target.value as typeof sep)}
          className="input w-auto py-1.5"
          aria-label="Separator"
        >
          <option value=" ">Space</option>
          <option value=" - ">Dash</option>
          <option value={'\n'}>Newline</option>
        </select>
      }
    >
      <div className="space-y-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input"
          spellCheck={false}
          placeholder="Type something to spell out…"
        />
        <OutputPane text={output} wrap copyLabel="Copy spelling" />
        <p className="text-2xs text-subtle font-mono">
          ICAO/NATO phonetic alphabet — what airline crews and emergency services use. Digits speak their English number; spaces become "(space)".
        </p>
      </div>
    </ToolFrame>
  );
}
