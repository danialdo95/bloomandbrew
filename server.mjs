import { createServer } from "node:http";
import next from "next";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const hostname = "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  if (req.url === "/kaithhealth") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end('{"status":"ok"}');
    return;
  }

  handle(req, res);
}).listen(port, hostname, () => {
  console.log(`Server ready on http://${hostname}:${port}`);
});
