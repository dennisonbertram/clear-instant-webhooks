export type EndpointStatus = 'healthy' | 'watching' | 'paused';
export type DeliveryStatus = 'delivered' | 'transformed' | 'retrying' | 'failed';

export interface WebhookEndpoint {
  id: string;
  name: string;
  route: string;
  status: EndpointStatus;
  requests24h: number;
  successRate: number;
  latencyMs: number;
  aiSummary: string;
}

export interface DeliveryLog {
  id: string;
  endpoint: string;
  status: DeliveryStatus;
  method: 'POST' | 'GET';
  source: string;
  latencyMs: number;
  timestamp: string;
  summary: string;
}

export interface ObservableEvent {
  name: string;
  level: 'info' | 'warn' | 'error';
  detail: string;
  timestamp: string;
}

export const endpoints: WebhookEndpoint[] = [
  {
    id: 'stripe-test',
    name: 'Stripe test events',
    route: '/hooks/stripe-test',
    status: 'healthy',
    requests24h: 1428,
    successRate: 99.97,
    latencyMs: 84,
    aiSummary: 'Checkout, dispute, and subscription events normalized into one billing stream.',
  },
  {
    id: 'github-triage',
    name: 'GitHub triage',
    route: '/hooks/github-triage',
    status: 'watching',
    requests24h: 394,
    successRate: 99.21,
    latencyMs: 121,
    aiSummary: 'Issues are classified, deduped, and routed to product areas with confidence labels.',
  },
  {
    id: 'sandbox-demo',
    name: 'Disposable sandbox',
    route: '/hooks/temp-4h2x',
    status: 'healthy',
    requests24h: 86,
    successRate: 100,
    latencyMs: 42,
    aiSummary: 'Ephemeral webhook for QA runs. Auto-expires after the current testing session.',
  },
];

export const logs: DeliveryLog[] = [
  {
    id: 'evt_91a',
    endpoint: 'Stripe test events',
    status: 'transformed',
    method: 'POST',
    source: 'checkout.session.completed',
    latencyMs: 72,
    timestamp: '12:41:08',
    summary: 'AI extracted customer, plan, and renewal window. Forwarded to billing.ops.',
  },
  {
    id: 'evt_91b',
    endpoint: 'GitHub triage',
    status: 'delivered',
    method: 'POST',
    source: 'issues.opened',
    latencyMs: 118,
    timestamp: '12:40:32',
    summary: 'Labeled docs, priority medium, owner developer experience.',
  },
  {
    id: 'evt_91c',
    endpoint: 'Disposable sandbox',
    status: 'delivered',
    method: 'POST',
    source: 'local.emulator',
    latencyMs: 38,
    timestamp: '12:39:55',
    summary: 'Captured payload, replay token created, no downstream mutations.',
  },
  {
    id: 'evt_91d',
    endpoint: 'Stripe test events',
    status: 'retrying',
    method: 'POST',
    source: 'invoice.payment_failed',
    latencyMs: 243,
    timestamp: '12:38:04',
    summary: 'Destination returned 429. Retry scheduled with jitter in 42 seconds.',
  },
];

export const observableEvents: ObservableEvent[] = [
  {
    name: 'request.accepted',
    level: 'info',
    detail: 'Webhook request received, validated, and assigned trace req_7JH9.',
    timestamp: '12:41:08.104',
  },
  {
    name: 'ai.transform.complete',
    level: 'info',
    detail: 'Payload summarized and mapped to billing.ops schema in 23 ms.',
    timestamp: '12:41:08.142',
  },
  {
    name: 'destination.retry.scheduled',
    level: 'warn',
    detail: '429 from destination. Retry policy selected backoff window 42 s.',
    timestamp: '12:38:04.955',
  },
];

export const docs = [
  {
    title: 'Create an endpoint',
    body: 'Name a webhook, choose disposable or persistent mode, then copy the endpoint URL.',
    code: 'curl -X POST https://clear.run/hooks/temp-4h2x \\\n  -H "content-type: application/json" \\\n  -d \'{"event":"demo.created","user":"ada"}\'',
  },
  {
    title: 'Add AI transformation',
    body: 'Describe the shape you want. Clear keeps the raw payload, extracted fields, and model output connected by trace ID.',
    code: 'transform: summarize intent, extract account_id, set priority, redact secrets',
  },
  {
    title: 'Observe every hop',
    body: 'Each delivery includes request logs, retries, destination status, and the exact replay control.',
    code: 'trace req_7JH9 → accepted → transformed → delivered',
  },
];
