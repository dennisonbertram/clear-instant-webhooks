export type TelemetryLevel = 'info' | 'warn' | 'error';

export interface TelemetryEvent {
  name: string;
  level: TelemetryLevel;
  message: string;
  timestamp: string;
  fields?: Record<string, string | number | boolean>;
}

const storageKey = 'clear.telemetry.events';

export function recordEvent(
  name: string,
  message: string,
  fields?: TelemetryEvent['fields'],
  level: TelemetryLevel = 'info',
): TelemetryEvent {
  const event: TelemetryEvent = {
    name,
    level,
    message,
    fields,
    timestamp: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    const existing = readEvents();
    window.localStorage.setItem(storageKey, JSON.stringify([event, ...existing].slice(0, 60)));
    window.dispatchEvent(new CustomEvent('clear:telemetry', { detail: event }));
  }
  console.info(JSON.stringify({ source: 'clear-dashboard', ...event }));
  return event;
}

export function readEvents(): TelemetryEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as TelemetryEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey);
}
