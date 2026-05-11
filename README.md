# Clear

Clear is a polished SaaS dashboard concept for instant AI-powered disposable webhooks.

## What It Shows

- A first-screen marketing page for “instant webhooks,” “AI powered webhooks,” and “disposable webhooks.”
- A live webhook emulator that produces trace IDs, summaries, latency, and replay URLs.
- A focused dashboard with endpoint health, traffic, AI summaries, delivery logs, and observability traces.
- Documentation that starts from user jobs and reveals exact commands when useful.
- Day mode first, with a complete night mode.
- Clerk authentication wiring with a demo fallback when no publishable key is configured.

## Clerk

Set this environment variable locally and in Railway to enable Clerk:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

Clear uses the Vite convention for client-exposed environment variables: `VITE_CLERK_PUBLISHABLE_KEY`. Without a publishable key, the app remains usable in demo mode and shows a visible configuration note.

## Development

```bash
pnpm install
pnpm run dev
pnpm run check
```

## Observability

The app records structured client events through `src/lib/observability.ts`.
Events are written to `console.info`, persisted to local storage, and reflected in the dashboard trace stream.
