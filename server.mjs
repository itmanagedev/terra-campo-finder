// Production Node.js server for TanStack Start (used in Docker / EasyPanel).
// Serves static client assets from dist/client and forwards everything else
// to the SSR fetch handler exported by dist/server/server.js.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import server from "./dist/server/server.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = resolve(__dirname, "dist/client");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

async function tryServeStatic(urlPath) {
  // Strip query string and decode
  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  if (cleanPath.includes("..")) return null;
  const filePath = join(CLIENT_DIR, cleanPath);
  try {
    const s = await stat(filePath);
    if (!s.isFile()) return null;
    const data = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
    return { data, type, immutable: cleanPath.startsWith("/assets/") };
  } catch {
    return null;
  }
}

function nodeReqToWebRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host || `${HOST}:${PORT}`;
  const url = `${proto}://${host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }
  const init = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req;
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function writeWebResponse(res, webResponse) {
  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => res.setHeader(key, value));
  if (!webResponse.body) {
    res.end();
    return;
  }
  const reader = webResponse.body.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}

const httpServer = createServer(async (req, res) => {
  try {
    // 1. Try static assets first
    const asset = await tryServeStatic(req.url || "/");
    if (asset) {
      res.statusCode = 200;
      res.setHeader("content-type", asset.type);
      if (asset.immutable) {
        res.setHeader("cache-control", "public, max-age=31536000, immutable");
      }
      res.end(asset.data);
      return;
    }
    // 2. Fall back to SSR handler
    const webRequest = nodeReqToWebRequest(req);
    const webResponse = await server.fetch(webRequest);
    await writeWebResponse(res, webResponse);
  } catch (err) {
    console.error("[server] request error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/plain; charset=utf-8");
    }
    res.end("Internal Server Error");
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`▲ Server listening on http://${HOST}:${PORT}`);
});
