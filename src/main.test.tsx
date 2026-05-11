import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell, formatTraceTime } from './main';

describe('Clear website', () => {
  it('renders the marketing promise, emulator, dashboard, and docs', async () => {
    render(<AppShell />);

    expect(await screen.findByRole('heading', { name: /Instant AI webhooks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Try a webhook/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Everything important/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Speak from the right level/i })).toBeInTheDocument();
  });

  it('keeps the app renderable in test containers', () => {
    const host = document.createElement('div');
    host.id = 'custom-root';
    document.body.appendChild(host);
    render(<div>Clear smoke</div>, { container: host });
    expect(screen.getByText('Clear smoke')).toBeInTheDocument();
  });

  it('keeps fixture trace timestamps readable', () => {
    expect(formatTraceTime('12:41:08.104')).toBe('12:41:08.104');
    expect(formatTraceTime('2026-05-11T03:52:03.352Z')).not.toBe('Invalid Date');
  });
});
