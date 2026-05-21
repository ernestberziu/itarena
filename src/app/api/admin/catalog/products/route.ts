import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { loadAdminCatalogRows } from "@/lib/admin-catalog-list";
import { paginatedResponse, parseListPageParams } from "@/lib/admin-list-pagination";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "catalog", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const { page, pageSize, skip } = parseListPageParams(searchParams);

  try {
    const { rows } = await loadAdminCatalogRows({
      q: searchParams.get("q"),
      categorySlug: searchParams.get("category"),
    });
    const total = rows.length;
    const items = rows.slice(skip, skip + pageSize);
    return NextResponse.json(paginatedResponse(items, total, page, pageSize));
  } catch {
    return NextResponse.json({ error: "Catalog unavailable" }, { status: 503 });
  }
}
