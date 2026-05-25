const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = path.resolve(__dirname);
const DATA_FILE = path.join(ROOT, "data.json");

const mimeTypes = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "text/javascript",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
};

// Load data.json or return defaults
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return { categories: [], settings: {}, appearance: {} };
  }
}

// Save data.json
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Read full request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 5e6) req.destroy(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  // ── API routes ──────────────────────────────────────────
  if (url === "/api/data" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(loadData()));
  }

  if (url === "/api/data" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const incoming = JSON.parse(body);
      const current  = loadData();
      // Merge only provided keys
      if (incoming.categories !== undefined) current.categories = incoming.categories;
      if (incoming.settings   !== undefined) current.settings   = incoming.settings;
      if (incoming.appearance !== undefined) current.appearance = incoming.appearance;
      saveData(current);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  }

  // ── Static files ─────────────────────────────────────────
  const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, "");
  const isRoot = safePath === "/" || safePath === "\\" || safePath === ".";
  const filePath = path.join(ROOT, isRoot ? "index.html" : safePath);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || "text/plain";

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h2>404 - Not Found</h2>");
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`\n  🚀 FAYDA running at http://${HOST}:${PORT}\n`);
});

process.on("SIGINT",  () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
