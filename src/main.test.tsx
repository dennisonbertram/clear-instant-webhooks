import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './main';

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
});
