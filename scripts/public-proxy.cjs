const http = require('http');

const TARGET_HOST = process.env.PROXY_TARGET_HOST || '127.0.0.1';
const TARGET_PORT = Number(process.env.PROXY_TARGET_PORT || 5000);
const LISTEN_PORT = Number(process.env.PROXY_LISTEN_PORT || 8081);

const server = http.createServer((req, res) => {
  const options = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'content-type': 'text/plain' });
    res.end(`Upstream error: ${err.message}`);
  });
  req.pipe(proxyReq);
});

server.on('upgrade', (req, socket, head) => {
  const upstream = require('net').connect(TARGET_PORT, TARGET_HOST, () => {
    const headerLines = [
      `${req.method} ${req.url} HTTP/${req.httpVersion}`,
      ...Object.entries(req.headers).map(([k, v]) =>
        Array.isArray(v) ? v.map((x) => `${k}: ${x}`).join('\r\n') : `${k}: ${v}`,
      ),
      '',
      '',
    ].join('\r\n');
    upstream.write(headerLines);
    if (head && head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on('error', () => socket.end());
  socket.on('error', () => upstream.end());
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(`[public-proxy] listening on 0.0.0.0:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
