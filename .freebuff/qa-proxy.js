// QA proxy: localhost:3001 -> https://dreamgadgets.in
// Serves the LIVE site same-origin so the preview webview behaves exactly
// like a browser pointed at dreamgadgets.in (no CORS, cookies work, all
// methods pass through). Only for QA driving; not part of the product.
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Hardcode: a stray PORT=0 in this shell's env made an earlier run bind port 0
const PORT = 3001;
const TARGET = 'https://dreamgadgets.in';

const server = http.createServer((req, res) => {
  const target = new URL(TARGET + req.url);
  const headers = { ...req.headers };
  headers.host = target.host;

  const proxyReq = https.request(
    {
      hostname: target.hostname,
      port: 443,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      const outHeaders = { ...proxyRes.headers };

      // Rewrite redirects back to the proxy so navigation stays local
      if (outHeaders.location) {
        const loc = String(outHeaders.location);
        if (loc.startsWith(TARGET)) {
          outHeaders.location = loc.replace(TARGET, `http://localhost:${PORT}`);
        } else if (loc.startsWith('/')) {
          outHeaders.location = `http://localhost:${PORT}${loc}`;
        }
      }

      // Strip cookie Domain so the browser stores them for localhost
      if (Array.isArray(outHeaders['set-cookie'])) {
        outHeaders['set-cookie'] = outHeaders['set-cookie'].map((c) =>
          c.replace(/Domain=[^;]+;?/i, ''),
        );
      }

      // HSTS only applies over https; harmless to drop here
      delete outHeaders['strict-transport-security'];

      res.writeHead(proxyRes.statusCode, outHeaders);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (e) => {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('QA proxy error: ' + e.message);
  });

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`qa-proxy listening on http://localhost:${PORT} -> ${TARGET}`);
});
