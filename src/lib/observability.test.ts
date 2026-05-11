import { describe, expect, it, vi } from 'vitest';
import { clearEvents, readEvents, recordEvent } from './observability';

describe('observability', () => {
  it('stores recent telemetry and writes structured logs', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});
    clearEvents();

    const event = recordEvent('test.event', 'Something observable happened.', { ok: true });

    expect(event.timestamp).toBeTruthy();
    expect(readEvents()).toHaveLength(1);
    expect(readEvents()[0]?.fields?.ok).toBe(true);
    expect(info.mock.calls[0]?.[0]).toContain('clear-dashboard');
  });
});
