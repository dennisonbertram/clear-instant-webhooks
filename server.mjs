import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const host = process.env.HOST ?? '0.0.0.0';
const distDir = join(process.cwd(), 'dist');
const startedAt = new Date().toISOString();

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

function log(event, fields = {}) {
  console.info(JSON.stringify({
    service: 'clear-instant-webhooks',
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  }));
}

function resolveAsset(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const safePath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const candidate = join(distDir, safePath === '/' ? 'index.html' : safePath);

  if (candidate.startsWith(distDir) && existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  return join(distDir, 'index.html');
}

const server = createServer((request, response) => {
  const started = performance.now();
  const path = request.url ?? '/';

  if (path === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true, startedAt }));
    log('healthcheck', { status: 200, durationMs: Math.round(performance.now() - started) });
    return;
  }

  const assetPath = resolveAsset(path);
  const extension = extname(assetPath);
  const contentType = mimeTypes[extension] ?? 'application/octet-stream';
  const cacheControl = assetPath.includes('/assets/')
    ? 'public, max-age=31536000, immutable'
    : 'no-cache';

  response.writeHead(200, {
    'cache-control': cacheControl,
    'content-type': contentType,
  });

  createReadStream(assetPath)
    .on('error', (error) => {
      log('static_asset_error', { path, message: error.message });
      if (!response.headersSent) {
        response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      }
      response.end('Internal Server Error');
    })
    .on('end', () => {
      log('request', {
        method: request.method,
        path,
        status: response.statusCode,
        durationMs: Math.round(performance.now() - started),
      });
    })
    .pipe(response);
});

server.listen(port, host, () => {
  log('server_started', { host, port, distDir });
});
