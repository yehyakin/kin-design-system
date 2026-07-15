import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";

const root = path.join(process.cwd(), ".site-dist");
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4173);
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
]);

function resolveRequest(url) {
  try {
    const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
    const sitePath = pathname === "/kin-design-system"
      ? "/"
      : pathname.startsWith("/kin-design-system/")
        ? pathname.slice("/kin-design-system".length)
        : pathname;
    const candidate = path.resolve(root, `.${sitePath}`);
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
    const notFound = path.join(root, "404.html");
    response.writeHead(404, { "cache-control": "no-store", "content-type": "text/html; charset=utf-8" });
    fs.createReadStream(notFound).pipe(response);
    return;
  }
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": types.get(path.extname(file)) ?? "application/octet-stream",
    "x-content-type-options": "nosniff",
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, host, () => console.log(`KIN showcase: http://${host}:${port}/`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
