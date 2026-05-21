/**
 * Financa5Client — typed wrapper for the Financa5Api.
 *
 * Reads the public URL and API key from environment variables:
 *   FINANCA5_API_URL  — e.g. https://api.itarena.al
 *   FINANCA5_API_KEY  — raw API key seeded in the C# API's database
 *
 * All methods throw on network / HTTP errors so the caller can decide
 * how to handle them.
 */

// ─── Types (mirrors the C# DTOs) ─────────────────────────────────────────────

export interface Financa5Product {
  id: number;
  kod: string;
  name: string;
  barcode: string | null;
  price: number;         // excl. VAT
  priceWithVat: number;  // incl. VAT (retail display price)
  vatRate: number;       // e.g. 20, 10, 6 or 0
  costPrice: number;
  unit: string;
  categoryId: string;
  categoryName: string;
  supplierCode: string;
  stock: number;
  isActive: boolean;
}

export interface Financa5Category {
  id: string;       // LISTE.KOD
  name: string;     // LISTE.PERSHKRIM
  parentId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type ApiPagedResult<T> = {
  items?: T[];
  data?: T[];
  Data?: T[];
  totalCount?: number;
  TotalCount?: number;
  page?: number;
  Page?: number;
  pageSize?: number;
  PageSize?: number;
  totalPages?: number;
  TotalPages?: number;
};

function normalizePagedResult<T>(raw: ApiPagedResult<T>): PagedResult<T> {
  const items = raw.items ?? raw.data ?? raw.Data;
  if (!Array.isArray(items)) {
    throw new Error(
      "Financa5Api paged response missing items/data array — check API URL and auth"
    );
  }

  const page = Number(raw.page ?? raw.Page ?? 1);
  const pageSize = Number(raw.pageSize ?? raw.PageSize ?? items.length);
  const totalCount = Number(raw.totalCount ?? raw.TotalCount ?? items.length);
  const totalPages = Number(
    raw.totalPages ?? raw.TotalPages ?? Math.max(1, Math.ceil(totalCount / pageSize))
  );

  return { items, page, pageSize, totalCount, totalPages };
}

function normalizeProduct(raw: Record<string, unknown>): Financa5Product {
  const categoryName = String(raw.categoryName ?? raw.CategoryName ?? "");
  const categoryId = String(
    raw.categoryId ?? raw.CategoryId ?? categoryName
  );

  return {
    id: Number(raw.id ?? raw.Id ?? 0),
    kod: String(raw.kod ?? raw.Kod ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    barcode: (raw.barcode ?? raw.Barcode ?? null) as string | null,
    price: Number(raw.price ?? raw.Price ?? 0),
    priceWithVat: Number(raw.priceWithVat ?? raw.PriceWithVat ?? 0),
    vatRate: Number(raw.vatRate ?? raw.VatRate ?? 0),
    costPrice: Number(raw.costPrice ?? raw.CostPrice ?? 0),
    unit: String(raw.unit ?? raw.Unit ?? ""),
    categoryId,
    categoryName,
    supplierCode: String(raw.supplierCode ?? raw.SupplierCode ?? ""),
    stock: Number(raw.stock ?? raw.Stock ?? 0),
    isActive: (raw.isActive ?? raw.IsActive ?? true) as boolean,
  };
}

function normalizeCategory(raw: Record<string, unknown>): Financa5Category {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    parentId: (raw.parentId ?? raw.ParentId ?? null) as string | null,
    level: Number(raw.level ?? raw.Level ?? 0),
    sortOrder: Number(raw.sortOrder ?? raw.SortOrder ?? 0),
    isActive: (raw.isActive ?? raw.IsActive ?? true) as boolean,
  };
}

function isConnectionRefused(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as Error & { cause?: unknown; code?: string };
  if (err.code === "ECONNREFUSED") return true;
  const c = err.cause;
  if (c && typeof c === "object") {
    if ("code" in c && (c as { code?: string }).code === "ECONNREFUSED") return true;
    const agg = c as { errors?: unknown[] };
    if (Array.isArray(agg.errors)) {
      return agg.errors.some(
        (x) =>
          x &&
          typeof x === "object" &&
          "code" in x &&
          (x as { code?: string }).code === "ECONNREFUSED"
      );
    }
  }
  return false;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export class Financa5Client {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(baseUrl?: string, apiKey?: string) {
    const raw = (baseUrl ?? process.env.FINANCA5_API_URL ?? "").replace(/\/$/, "");
    // Node often resolves `localhost` to IPv6 first; many local APIs listen on IPv4 only.
    this.baseUrl = raw
      .replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1")
      .replace(/^https:\/\/localhost(?=[:/]|$)/i, "https://127.0.0.1");
    this.apiKey = apiKey ?? process.env.FINANCA5_API_KEY ?? "";

    if (!this.baseUrl) throw new Error("FINANCA5_API_URL is not set");
    if (!this.apiKey) throw new Error("FINANCA5_API_KEY is not set");
  }

  private get headers(): HeadersInit {
    const h: Record<string, string> = {
      "X-Api-Key": this.apiKey,
      "Content-Type": "application/json",
    };
    // Required for ngrok free tier — skips browser interstitial on API calls
    if (this.baseUrl.includes("ngrok")) {
      h["ngrok-skip-browser-warning"] = "true";
    }
    return h;
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: this.headers,
        cache: "no-store",
      });
    } catch (e) {
      if (isConnectionRefused(e) || (e instanceof Error && /fetch failed/i.test(e.message))) {
        throw new Error(
          `Financa5 API nuk është i arritshëm (${this.baseUrl}). ` +
            `Në zhvillim lokal: nis mock-un me \`npm run dev:with-mock\` ose \`node dev-mock/financa5/server.js\` në një terminal tjetër.`
        );
      }
      throw e;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Financa5Api ${res.status} on GET ${path}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  // ── Products ──────────────────────────────────────────────────────────────

  /** Fetch a single page of products (1-indexed). */
  async getProductsPage(page: number, pageSize = 100): Promise<PagedResult<Financa5Product>> {
    const raw = await this.get<ApiPagedResult<Record<string, unknown>>>(
      `/api/products?page=${page}&pageSize=${pageSize}`
    );
    const paged = normalizePagedResult(raw);
    return {
      ...paged,
      items: paged.items.map(normalizeProduct),
    };
  }

  /** Fetch ALL products across all pages and return a flat array. */
  async getAllProducts(): Promise<Financa5Product[]> {
    const first = await this.getProductsPage(1, 200);
    const results: Financa5Product[] = [...first.items];

    for (let p = 2; p <= first.totalPages; p++) {
      const page = await this.getProductsPage(p, 200);
      results.push(...page.items);
    }

    return results;
  }

  /** Fetch a single product by its ERP article code (KOD). */
  async getProductByKod(kod: string): Promise<Financa5Product> {
    const raw = await this.get<Record<string, unknown>>(
      `/api/products/kod/${encodeURIComponent(kod)}`
    );
    return normalizeProduct(raw);
  }

  /** Server-side product search (paginated; does not load the full catalog). */
  async searchProducts(opts: {
    search: string;
    page?: number;
    pageSize?: number;
    inStock?: boolean;
  }): Promise<PagedResult<Financa5Product>> {
    const params = new URLSearchParams();
    params.set("page", String(opts.page ?? 1));
    params.set("pageSize", String(opts.pageSize ?? 50));
    params.set("search", opts.search);
    if (opts.inStock) params.set("inStock", "true");
    const raw = await this.get<ApiPagedResult<Record<string, unknown>>>(
      `/api/products?${params.toString()}`
    );
    const paged = normalizePagedResult(raw);
    return {
      ...paged,
      items: paged.items.map(normalizeProduct),
    };
  }

  /** Lookup by exact barcode (EAN). */
  async getProductByBarcode(barcode: string): Promise<Financa5Product> {
    const raw = await this.get<Record<string, unknown>>(
      `/api/products/barcode/${encodeURIComponent(barcode)}`
    );
    return normalizeProduct(raw);
  }

  // ── Categories ────────────────────────────────────────────────────────────

  /** Fetch all categories (the API returns them all in one call). */
  async getAllCategories(): Promise<Financa5Category[]> {
    const result = await this.get<
      PagedResult<Record<string, unknown>> | Record<string, unknown>[]
    >(`/api/categories`);

    if (Array.isArray(result)) {
      return result.map((row) => normalizeCategory(row));
    }

    const paged = normalizePagedResult(result as ApiPagedResult<Record<string, unknown>>);
    return paged.items.map(normalizeCategory);
  }

  // ── Health ────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get("/api/health");
  }
}

/** Singleton factory — creates one instance per process using env vars. */
let _client: Financa5Client | null = null;
export function getFinanca5Client(): Financa5Client {
  if (!_client) _client = new Financa5Client();
  return _client;
}
