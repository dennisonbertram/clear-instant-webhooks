import { ClerkProvider, Show, SignInButton, UserButton } from '@clerk/react';
import { StrictMode, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clipboard,
  Code2,
  Copy,
  Gauge,
  KeyRound,
  Moon,
  PauseCircle,
  Play,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  TerminalSquare,
  Webhook,
  Zap,
} from 'lucide-react';
import { docs, endpoints, logs, observableEvents, type DeliveryLog, type WebhookEndpoint } from './lib/data';
import { runWebhookEmulator, type EmulatorResult } from './lib/emulator';
import { readEvents, recordEvent, type TelemetryEvent } from './lib/observability';
import './styles.css';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;

export function formatTraceTime(timestamp: string) {
  const parsed = new Date(timestamp);

  if (Number.isNaN(parsed.getTime())) {
    return timestamp;
  }

  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function AppShell() {
  return clerkKey ? (
    <ClerkProvider publishableKey={clerkKey}>
      <App />
    </ClerkProvider>
  ) : (
    <App demoAuth />
  );
}

function App({ demoAuth = false }: { demoAuth?: boolean }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [filter, setFilter] = useState('all');
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070b12' : '#f8fafc');
    recordEvent('ui.theme.changed', `Theme changed to ${theme}`, { theme });
  }, [theme]);

  useEffect(() => {
    setTelemetry(readEvents());
    const onTelemetry = () => setTelemetry(readEvents());
    window.addEventListener('clear:telemetry', onTelemetry);
    recordEvent('app.loaded', 'Clear dashboard mounted and telemetry is ready.');
    return () => window.removeEventListener('clear:telemetry', onTelemetry);
  }, []);

  const visibleLogs = useMemo(() => (filter === 'all' ? logs : logs.filter((log) => log.status === filter)), [filter]);
  const visibleEndpoints = useMemo(
    () =>
      endpoints.filter((endpoint) =>
        `${endpoint.name} ${endpoint.route}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <a className="brand" href="#hero" aria-label="Clear home">
          <span className="brand-mark"><Webhook size={18} /></span>
          <span>Clear</span>
        </a>
        <nav aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#logs">Logs</a>
          <a href="#docs">Docs</a>
        </nav>
        <div className="top-actions">
          {demoAuth ? (
            <span className="auth-pill"><KeyRound size={14} /> Demo auth</span>
          ) : (
            <>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="secondary-button" type="button">Sign In</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </>
          )}
          <button
            className="icon-button"
            type="button"
            aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      <main id="main">
        <Hero demoAuth={demoAuth} />
        <ProductDashboard
          selectedEndpoint={selectedEndpoint}
          endpoints={visibleEndpoints}
          onSelectEndpoint={setSelectedEndpoint}
          visibleLogs={visibleLogs}
          filter={filter}
          onFilter={setFilter}
          query={query}
          onQuery={setQuery}
          telemetry={telemetry}
        />
        <Documentation />
      </main>
    </div>
  );
}

function Hero({ demoAuth }: { demoAuth: boolean }) {
  const [eventName, setEventName] = useState('ai.checkout.completed');
  const [payload, setPayload] = useState('{"customer":"Ada","plan":"Pro","amount":99}');
  const [result, setResult] = useState<EmulatorResult | null>(null);

  const sendDemo = () => {
    setResult(
      runWebhookEmulator({
        endpoint: 'https://clear.run/hooks/temp-4h2x',
        event: eventName,
        body: payload,
      }),
    );
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15} /> Instant glue for teams that ship</div>
        <h1>Instant AI webhooks you can trust in production.</h1>
        <p>
          Create disposable webhooks, transform noisy payloads with AI, watch every hop, and replay safely from one calm dashboard.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#product">Open Dashboard <ArrowRight size={16} /></a>
          <a className="secondary-button" href="#docs">Read Docs</a>
        </div>
        <div className="trust-row" aria-label="Product promises">
          <span><Zap size={15} /> Instant webhooks</span>
          <span><Sparkles size={15} /> AI powered webhooks</span>
          <span><ShieldCheck size={15} /> Disposable webhooks</span>
        </div>
        {demoAuth && (
          <p className="clerk-note">
            Clerk is configured. Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> in Railway to enable hosted sign-in.
          </p>
        )}
      </div>
      <section className="emulator" aria-labelledby="emulator-title">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Live emulator</span>
            <h2 id="emulator-title">Try a webhook in 10 seconds</h2>
          </div>
          <span className="status-chip healthy">Ready</span>
        </div>
        <label>
          Event name
          <input value={eventName} onChange={(event) => setEventName(event.target.value)} />
        </label>
        <label>
          JSON payload
          <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={5} />
        </label>
        <button className="primary-button full" type="button" onClick={sendDemo}>
          <Send size={16} /> Send Test Event
        </button>
        <div className="result-box" aria-live="polite">
          {result ? (
            <>
              <div className="result-line"><CheckCircle2 size={16} /> {result.status}</div>
              <p>{result.summary}</p>
              <code>{result.traceId} · {result.latencyMs} ms</code>
            </>
          ) : (
            <>
              <div className="result-line muted"><TerminalSquare size={16} /> Waiting for a test event</div>
              <p>Send the example payload to see trace status, AI output, latency, and replay details.</p>
            </>
          )}
        </div>
      </section>
    </section>
  );
}

function ProductDashboard({
  selectedEndpoint,
  endpoints,
  onSelectEndpoint,
  visibleLogs,
  filter,
  onFilter,
  query,
  onQuery,
  telemetry,
}: {
  selectedEndpoint: WebhookEndpoint;
  endpoints: WebhookEndpoint[];
  onSelectEndpoint: (endpoint: WebhookEndpoint) => void;
  visibleLogs: DeliveryLog[];
  filter: string;
  onFilter: (filter: string) => void;
  query: string;
  onQuery: (query: string) => void;
  telemetry: TelemetryEvent[];
}) {
  return (
    <section className="dashboard-section" id="product">
      <div className="section-heading">
        <span className="panel-kicker">Dashboard</span>
        <h2>Everything important, nothing loud.</h2>
        <p>See health, traffic, AI transformations, retries, and raw observability without losing the thread.</p>
      </div>
      <div className="dashboard-grid">
        <aside className="sidebar-panel" aria-label="Webhook endpoints">
          <div className="search-box">
            <Search size={15} />
            <input
              aria-label="Search endpoints"
              placeholder="Search endpoints…"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
            />
          </div>
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                className={`endpoint-row ${endpoint.id === selectedEndpoint.id ? 'selected' : ''}`}
                type="button"
                onClick={() => {
                  recordEvent('endpoint.selected', `Selected ${endpoint.name}`, { endpoint: endpoint.id });
                  onSelectEndpoint(endpoint);
                }}
              >
                <span className={`dot ${endpoint.status}`} />
                <span>
                  <strong>{endpoint.name}</strong>
                  <small>{endpoint.route}</small>
                </span>
              </button>
            ))}
            {endpoints.length === 0 && (
              <div className="empty-state">
                <strong>No endpoints found</strong>
                <p>Try a different name or route.</p>
              </div>
            )}
          </div>
        </aside>
        <section className="main-panel" aria-labelledby="status-title">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Current endpoint</span>
              <h3 id="status-title">{selectedEndpoint.name}</h3>
            </div>
            <button className="secondary-button compact" type="button" onClick={() => recordEvent('endpoint.replay.opened', 'Replay drawer opened.', { endpoint: selectedEndpoint.id })}>
              <RefreshCcw size={15} /> Replay
            </button>
          </div>
          <div className="metric-grid">
            <Metric icon={<Activity size={18} />} label="24 h requests" value={selectedEndpoint.requests24h.toLocaleString()} />
            <Metric icon={<Gauge size={18} />} label="Success rate" value={`${selectedEndpoint.successRate}%`} />
            <Metric icon={<Zap size={18} />} label="P50 latency" value={`${selectedEndpoint.latencyMs} ms`} />
          </div>
          <div className="ai-summary">
            <Sparkles size={17} />
            <p>{selectedEndpoint.aiSummary}</p>
          </div>
          <div className="code-card">
            <div className="panel-header tight">
              <span className="panel-kicker">Endpoint URL</span>
              <button
                className="icon-button"
                type="button"
                aria-label="Copy endpoint URL"
                onClick={() => {
                  const url = `https://clear.run${selectedEndpoint.route}`;
                  void navigator.clipboard?.writeText(url);
                  recordEvent('endpoint.copied', 'Endpoint URL copied.', { endpoint: selectedEndpoint.id });
                }}
              >
                <Copy size={16} />
              </button>
            </div>
            <code>https://clear.run{selectedEndpoint.route}</code>
          </div>
        </section>
        <section className="logs-panel" id="logs" aria-labelledby="logs-title">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Delivery logs</span>
              <h3 id="logs-title">Live activity</h3>
            </div>
            <select aria-label="Filter logs" value={filter} onChange={(event) => onFilter(event.target.value)}>
              <option value="all">All logs</option>
              <option value="delivered">Delivered</option>
              <option value="transformed">Transformed</option>
              <option value="retrying">Retrying</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="log-list">
            {visibleLogs.map((log) => (
              <article className="log-row" key={log.id}>
                <div className="log-status">
                  <span className={`status-chip ${log.status}`}>{log.status}</span>
                  <small>{log.timestamp}</small>
                </div>
                <div>
                  <strong>{log.method} · {log.source}</strong>
                  <p>{log.summary}</p>
                </div>
                <code>{log.latencyMs} ms</code>
              </article>
            ))}
            {visibleLogs.length === 0 && (
              <div className="empty-state large">
                <CheckCircle2 size={18} />
                <strong>No matching deliveries</strong>
                <p>There are no {filter} logs right now. Clear keeps this view quiet until something needs attention.</p>
              </div>
            )}
          </div>
        </section>
        <section className="observability-panel" aria-labelledby="observability-title">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Observability</span>
              <h3 id="observability-title">Trace stream</h3>
            </div>
            <Bell size={17} aria-hidden="true" />
          </div>
          {[...telemetry.slice(0, 3), ...observableEvents].slice(0, 6).map((event, index) => (
            <div className="trace-row" key={`${event.name}-${index}`}>
              <span className={`trace-level ${event.level}`} />
              <div>
                <strong>{event.name}</strong>
                <p>{'message' in event ? event.message : event.detail}</p>
              </div>
              <small>{formatTraceTime(event.timestamp)}</small>
            </div>
          ))}
        </section>
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Documentation() {
  return (
    <section className="docs-section" id="docs">
      <div className="section-heading">
        <span className="panel-kicker">Documentation</span>
        <h2>Speak from the right level.</h2>
        <p>Start with the job to be done, then reveal the exact command, trace, and controls when they matter.</p>
      </div>
      <div className="docs-grid">
        {docs.map((doc) => (
          <article className="doc-card" key={doc.title}>
            <div className="doc-icon"><Code2 size={18} /></div>
            <h3>{doc.title}</h3>
            <p>{doc.body}</p>
            <pre><code>{doc.code}</code></pre>
          </article>
        ))}
      </div>
      <div className="final-band">
        <div>
          <span className="panel-kicker">Operational confidence</span>
          <h2>Replay safely. Pause quickly. Understand instantly.</h2>
        </div>
        <div className="final-actions">
          <button className="secondary-button" type="button" onClick={() => recordEvent('endpoint.pause.requested', 'Pause endpoint flow opened.')}>
            <PauseCircle size={16} /> Pause endpoint
          </button>
          <button className="primary-button" type="button" onClick={() => recordEvent('endpoint.create.requested', 'Create webhook flow opened.')}>
            <Play size={16} /> Create webhook
          </button>
        </div>
      </div>
    </section>
  );
}

const root = document.getElementById('root');
if (root) {
  const globalRoot = window as Window & { __clearRoot?: Root };
  globalRoot.__clearRoot ??= createRoot(root);
  globalRoot.__clearRoot.render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  );
}
