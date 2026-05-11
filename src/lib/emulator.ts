import { recordEvent } from './observability';

export interface EmulatorRequest {
  endpoint: string;
  event: string;
  body: string;
}

export interface EmulatorResult {
  traceId: string;
  status: 'delivered' | 'transformed';
  summary: string;
  latencyMs: number;
  replayUrl: string;
}

export function runWebhookEmulator(input: EmulatorRequest): EmulatorResult {
  const parsed = safeParse(input.body);
  const traceId = `req_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const fields = typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).slice(0, 4) : [];
  const result: EmulatorResult = {
    traceId,
    status: input.event.includes('ai') ? 'transformed' : 'delivered',
    summary:
      fields.length > 0
        ? `Accepted ${input.event}. AI found ${fields.join(', ')} and prepared a clean delivery.`
        : `Accepted ${input.event}. Payload captured and ready to replay.`,
    latencyMs: 42 + fields.length * 17,
    replayUrl: `${input.endpoint.replace(/\/$/, '')}/replay/${traceId}`,
  };
  recordEvent('emulator.request.sent', result.summary, {
    traceId,
    latencyMs: result.latencyMs,
    endpoint: input.endpoint,
  });
  return result;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
