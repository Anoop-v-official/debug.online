import { useMemo, useState } from 'react';
import yaml from 'js-yaml';
import { ToolFrame } from '../components/ToolFrame';
import { OutputPane } from '../components/OutputPane';
import { toolBySlug } from '../lib/tools';

const tool = toolBySlug['docker-run-to-compose']!;

interface Service {
  image: string;
  container_name?: string;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  env_file?: string[];
  restart?: string;
  command?: string | string[];
  entrypoint?: string | string[];
  networks?: string[];
  network_mode?: string;
  user?: string;
  working_dir?: string;
  hostname?: string;
  privileged?: boolean;
  read_only?: boolean;
  tty?: boolean;
  stdin_open?: boolean;
  labels?: Record<string, string>;
  cap_add?: string[];
  cap_drop?: string[];
  depends_on?: string[];
  healthcheck?: { test: string[]; interval?: string; timeout?: string; retries?: number };
}

interface Parsed {
  service: Service;
  serviceName: string;
  detached: boolean;
}

// Tokenize a docker run command, respecting single/double quotes.
function tokenize(cmd: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  let buf = '';
  let quote: string | null = null;
  while (i < cmd.length) {
    const c = cmd[i];
    if (c === '\\' && i + 1 < cmd.length && (cmd[i + 1] === '\n' || cmd[i + 1] === ' ')) {
      i += 2;
      continue;
    }
    if (quote) {
      if (c === quote) {
        quote = null;
        i++;
        continue;
      }
      buf += c;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      i++;
      continue;
    }
    if (/\s/.test(c)) {
      if (buf) {
        tokens.push(buf);
        buf = '';
      }
      i++;
      continue;
    }
    buf += c;
    i++;
  }
  if (buf) tokens.push(buf);
  return tokens;
}

function consumeValue(tokens: string[], i: number, flag: string): [string, number] {
  // Support --flag=value or --flag value
  if (flag.includes('=')) return [flag.slice(flag.indexOf('=') + 1), i];
  return [tokens[i + 1] ?? '', i + 1];
}

function pushKv(map: Record<string, string>, kv: string) {
  const eq = kv.indexOf('=');
  if (eq === -1) {
    map[kv] = '';
  } else {
    map[kv.slice(0, eq)] = kv.slice(eq + 1);
  }
}

function parse(input: string): { ok: true; data: Parsed } | { ok: false; error: string } {
  const cmd = input.trim().replace(/\\\n/g, ' ');
  if (!/^\s*docker\s+run\b/.test(cmd)) {
    return { ok: false, error: 'Expected the command to start with `docker run`.' };
  }
  const tokens = tokenize(cmd).slice(2); // drop "docker", "run"

  const s: Service = { image: '' };
  let detached = false;
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];
    const flag = t.split('=')[0];
    const arg = (): string => {
      const [v, ni] = consumeValue(tokens, i, t);
      i = ni;
      return v;
    };

    if (!t.startsWith('-')) break;

    switch (flag) {
      case '-d':
      case '--detach':
        detached = true;
        break;
      case '-it':
      case '-ti':
        s.tty = true;
        s.stdin_open = true;
        break;
      case '-i':
      case '--interactive':
        s.stdin_open = true;
        break;
      case '-t':
      case '--tty':
        s.tty = true;
        break;
      case '--rm':
        // Compose doesn't have a direct equivalent; ignore.
        break;
      case '--privileged':
        s.privileged = true;
        break;
      case '--read-only':
        s.read_only = true;
        break;
      case '-p':
      case '--publish':
        (s.ports ||= []).push(arg());
        break;
      case '-v':
      case '--volume':
        (s.volumes ||= []).push(arg());
        break;
      case '-e':
      case '--env':
        pushKv((s.environment ||= {}), arg());
        break;
      case '--env-file':
        (s.env_file ||= []).push(arg());
        break;
      case '-l':
      case '--label':
        pushKv((s.labels ||= {}), arg());
        break;
      case '--name':
        s.container_name = arg();
        break;
      case '--restart':
        s.restart = arg();
        break;
      case '--network':
      case '--net':
        s.network_mode = arg();
        break;
      case '--hostname':
      case '-h':
        s.hostname = arg();
        break;
      case '-u':
      case '--user':
        s.user = arg();
        break;
      case '-w':
      case '--workdir':
        s.working_dir = arg();
        break;
      case '--entrypoint':
        s.entrypoint = arg();
        break;
      case '--cap-add':
        (s.cap_add ||= []).push(arg());
        break;
      case '--cap-drop':
        (s.cap_drop ||= []).push(arg());
        break;
      case '--link':
        (s.depends_on ||= []).push(arg().split(':')[0]);
        break;
      default:
        // Unknown flag — try to consume its value if it has one.
        if (flag.includes('=')) {
          // consumed
        } else if (tokens[i + 1] && !tokens[i + 1].startsWith('-')) {
          i++; // skip value
        }
    }
    i++;
  }

  if (i >= tokens.length) {
    return { ok: false, error: 'Missing image name.' };
  }
  s.image = tokens[i++];
  if (i < tokens.length) {
    s.command = tokens.slice(i);
  }
  if (detached) {
    // detached is implicit in compose
  }
  const serviceName =
    s.container_name?.replace(/[^A-Za-z0-9_]/g, '_') ??
    s.image.split('/').pop()?.split(':')[0] ??
    'app';
  return { ok: true, data: { service: s, serviceName, detached } };
}

const SAMPLE =
  'docker run -d --name web -p 8080:80 -v ./html:/usr/share/nginx/html:ro -e NGINX_HOST=example.com --restart always nginx:1.27-alpine';

export default function DockerRunToCompose() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => {
    const parsed = parse(input);
    if (!parsed.ok) return parsed;
    const composeObj = {
      services: { [parsed.data.serviceName]: parsed.data.service },
    };
    const text = yaml.dump(composeObj, { indent: 2, lineWidth: 100, noRefs: true, sortKeys: false });
    return { ok: true as const, text };
  }, [input]);

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
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          spellCheck={false}
          className="textarea font-mono text-xs min-h-0"
          placeholder="docker run …"
        />

        {result.ok ? (
          <>
            <div className="text-2xs uppercase tracking-wide text-subtle font-mono">
              docker-compose.yml
            </div>
            <OutputPane text={result.text} copyLabel="Copy compose" />
          </>
        ) : (
          <OutputPane text={result.error} wrap tone="error" />
        )}

        <p className="text-2xs text-subtle font-mono">
          Supports the common flags: -p/--publish, -v/--volume, -e/--env, -l/--label,
          --name, --restart, --network, -w, -u, --entrypoint, --cap-add/drop, --link,
          --privileged, --read-only, -i/-t. Unknown flags are skipped — review before deploying.
        </p>
      </div>
    </ToolFrame>
  );
}
