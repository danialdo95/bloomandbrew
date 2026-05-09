import { createServer } from "node:http";
import next from "next";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();
const healthPaths = new Set([
  "/health",
  "/healthcheck",
  "/kaithhealth",
  "/kaithhealth/",
  "/kaithhealthcheck",
  "/kaithhealthcheck/",
]);

await app.prepare();

const server = createServer((req, res) => {
  const url = req.url ?? "/";
  const path = url.split("?")[0];

  console.log(`${req.method ?? "GET"} ${url}`);

  if (healthPaths.has(path)) {
    res.writeHead(200, { "content-type": "application/json" });
    res.end('{"status":"ok"}');
    return;
  }

  handle(req, res);
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

server.listen({ host: hostname, port }, () => {
  console.log(`Server ready on http://${hostname}:${port}`);
});
