import { describe, expect, it, vi } from 'vitest';
import { clearEvents, readEvents } from './observability';
import { runWebhookEmulator } from './emulator';

describe('runWebhookEmulator', () => {
  it('returns a trace, summary, latency, and replay URL', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    clearEvents();

    const result = runWebhookEmulator({
      endpoint: 'https://clear.run/hooks/temp',
      event: 'ai.checkout.completed',
      body: '{"customer":"Ada","plan":"Pro"}',
    });

    expect(result.traceId).toMatch(/^req_/);
    expect(result.status).toBe('transformed');
    expect(result.summary).toContain('customer');
    expect(result.replayUrl).toContain(result.traceId);
    expect(readEvents()[0]?.name).toBe('emulator.request.sent');
  });
});
