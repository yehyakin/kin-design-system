import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";

const root = path.join(process.cwd(), "examples");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function resolveRequest(url) {
  try {
    const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
    if (pathname !== "/examples" && !pathname.startsWith("/examples/")) return null;
    const relativePath = pathname.slice("/examples".length) || "/";
    const candidate = path.resolve(root, `.${relativePath}`);
    if (!candidate.startsWith(root + path.sep) && candidate !== root) return null;
    const file = fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()
      ? path.join(candidate, "index.html")
      : candidate;
    return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
  } catch {
    return null;
  }
}

const server = http.createServer((request, response) => {
  const file = resolveRequest(request.url ?? "/");
  if (!file) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": types.get(path.extname(file)) ?? "application/octet-stream",
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`KIN reference server: http://${host}:${port}/examples/workspace-reference/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
