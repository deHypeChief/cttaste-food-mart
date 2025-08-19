import path from "path";

const distDir = path.join(process.cwd(), "dist");
const port = Number(process.env.PORT || 3000);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

function contentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME[ext] || "application/octet-stream";
}

function cacheHeaders(filePath: string): Record<string, string> {
  const ext = path.extname(filePath).toLowerCase();
  // Cache static assets aggressively, never cache HTML
  if ([".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff2", ".woff", ".ttf"].includes(ext)) {
    return { "Cache-Control": "public, max-age=604800, immutable" };
  }
  if (ext === ".html") {
    return { "Cache-Control": "no-cache" };
  }
  return {};
}

function safeJoin(base: string, p: string) {
  const full = path.resolve(base, "." + p);
  if (!full.startsWith(base)) return null; // prevent path traversal
  return full;
}

async function serveFile(filePath: string): Promise<Response> {
  const file = Bun.file(filePath);
  const exists = await file.exists();
  if (!exists) return new Response("Not found", { status: 404 });
  const headers = {
    "Content-Type": contentType(filePath),
    ...cacheHeaders(filePath),
  };
  return new Response(file, { headers });
}

const server = Bun.serve({
  port,
  fetch: async (req) => {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Map directory paths to index.html check later via SPA fallback
    // Try to serve static file if it exists
    const candidate = safeJoin(distDir, pathname);
    if (candidate) {
      const file = Bun.file(candidate);
      if (await file.exists()) {
        return serveFile(candidate);
      }
    }

    // Fallback to index.html for SPA routes
    return serveFile(path.join(distDir, "index.html"));
  },
});

console.log(`Frontend running on http://localhost:${server.port}`);
