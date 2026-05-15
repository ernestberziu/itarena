// Financa5 Mock API Server
// Simulates all Financa5Api endpoints locally for ITArena shop testing.
// Usage: node server.js   (or: npm run dev  for auto-reload)

const http = require("http");
const { products, categories } = require("./data");

const PORT = process.env.PORT || 1234;
const API_KEY = process.env.MOCK_API_KEY || "mock-api-key-for-testing";

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  });
  res.end(body);
}

function checkApiKey(req, res) {
  const key = req.headers["x-api-key"];
  if (!key) {
    json(res, 401, { error: "Missing X-API-Key header" });
    return false;
  }
  // Accept any key in mock mode — or check exact match if env var set
  if (process.env.MOCK_STRICT_KEY && key !== API_KEY) {
    json(res, 401, { error: "Invalid API key" });
    return false;
  }
  return true;
}

function paginate(items, page, pageSize) {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const offset     = (page - 1) * pageSize;
  const sliced     = items.slice(offset, offset + pageSize);
  // "items" matches what financa5-client.ts expects (first.items)
  return { items: sliced, page, pageSize, totalCount, totalPages,
           hasNextPage: page < totalPages, hasPreviousPage: page > 1 };
}

function parseQuery(url) {
  const u = new URL(url, "http://localhost");
  return Object.fromEntries(u.searchParams.entries());
}

// ── Router ────────────────────────────────────────────────────────────────────

function route(req, res) {
  const url  = req.url || "/";
  const path = url.split("?")[0];

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    return res.end();
  }

  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  // ── GET /api/health ──────────────────────────────────────────────────────
  if (path === "/api/health") {
    return json(res, 200, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "ITA (mock)",
      version: "1.0.0-mock",
    });
  }

  // All routes below require API key
  if (!checkApiKey(req, res)) return;

  const q = parseQuery(url);

  // ── GET /api/categories ──────────────────────────────────────────────────
  if (path === "/api/categories") {
    return json(res, 200, categories);
  }

  // ── GET /api/products ────────────────────────────────────────────────────
  if (path === "/api/products") {
    const page     = Math.max(1, parseInt(q.page     || "1",   10));
    const pageSize = Math.min(200, parseInt(q.pageSize || "20",  10));
    const search   = (q.search  || "").toLowerCase();
    const catId    = (q.categoryId || "").toUpperCase();
    const inStock  = q.inStock;

    let items = [...products];

    if (search)          items = items.filter(p => p.name.toLowerCase().includes(search) || p.kod.toLowerCase().includes(search));
    if (catId)           items = items.filter(p => p.categoryId === catId);
    if (inStock === "true")  items = items.filter(p => p.stock > 0);
    if (inStock === "false") items = items.filter(p => p.stock === 0);

    // Sort
    const sortBy  = q.sortBy  || "name";
    const sortDir = q.sortDir === "desc" ? -1 : 1;
    items.sort((a, b) => {
      if (sortBy === "price") return sortDir * (a.price - b.price);
      if (sortBy === "stock") return sortDir * (a.stock - b.stock);
      return sortDir * a.name.localeCompare(b.name, "sq");
    });

    return json(res, 200, paginate(items, page, pageSize));
  }

  // ── GET /api/products/barcode/:bc ────────────────────────────────────────
  const bcMatch = path.match(/^\/api\/products\/barcode\/(.+)$/);
  if (bcMatch) {
    const bc = decodeURIComponent(bcMatch[1]);
    const product = products.find(p => p.barcode === bc);
    if (!product) return json(res, 404, { error: `Barcode '${bc}' not found` });
    return json(res, 200, product);
  }

  // ── GET /api/products/kod/:kod  (used by financa5-client.ts getProductByKod)
  const kodPrefixMatch = path.match(/^\/api\/products\/kod\/(.+)$/);
  if (kodPrefixMatch) {
    const kod = decodeURIComponent(kodPrefixMatch[1]);
    const product = products.find(p => p.kod === kod);
    if (!product) return json(res, 404, { error: `Product '${kod}' not found` });
    return json(res, 200, product);
  }

  // ── GET /api/products/:kod  (direct lookup fallback) ─────────────────────
  const kodMatch = path.match(/^\/api\/products\/(.+)$/);
  if (kodMatch) {
    const kod = decodeURIComponent(kodMatch[1]);
    const product = products.find(p => p.kod === kod);
    if (!product) return json(res, 404, { error: `Product '${kod}' not found` });
    return json(res, 200, product);
  }

  // ── GET /api/stock/:id ───────────────────────────────────────────────────
  const stockMatch = path.match(/^\/api\/stock\/(\d+)$/);
  if (stockMatch) {
    const id = parseInt(stockMatch[1], 10);
    const product = products.find(p => p.id === id);
    if (!product) return json(res, 404, { error: `Product id ${id} not found` });
    return json(res, 200, {
      productId: product.id,
      kod: product.kod,
      totalStock: product.stock,
      warehouses: [
        { warehouseId: "MAG-01", warehouseName: "Magazina Kryesore", stock: product.stock },
      ],
    });
  }

  return json(res, 404, { error: `Route '${path}' not found` });
}

// ── Start ─────────────────────────────────────────────────────────────────────

const server = http.createServer(route);

server.listen(PORT, () => {
  console.log("");
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║   Financa5 Mock API — Running                      ║");
  console.log("╚════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`  Base URL:  http://localhost:${PORT}`);
  console.log(`  API Key:   ${API_KEY}  (any key accepted in mock mode)`);
  console.log("");
  console.log("  Endpoints:");
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/categories`);
  console.log(`  GET  /api/products?page=1&pageSize=20&search=&categoryId=&inStock=true`);
  console.log(`  GET  /api/products/:kod          e.g. /api/products/LAP-001`);
  console.log(`  GET  /api/products/barcode/:bc`);
  console.log(`  GET  /api/stock/:id`);
  console.log("");
  console.log(`  Products: ${require("./data").products.length} | Categories: ${require("./data").categories.length}`);
  console.log("");
  console.log("  Set in ITArena .env.local:");
  console.log(`  FINANCA5_API_URL=http://localhost:${PORT}`);
  console.log(`  FINANCA5_API_KEY=mock-api-key-for-testing`);
  console.log("");
});
