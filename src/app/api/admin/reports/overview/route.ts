import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { resolveReportRange } from "@/lib/reports/date-range";
import { fetchReportsOverview } from "@/lib/reports/fetch-overview";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiErr(req, "unauthorized", 401);
  }
  const denied = await assertAdminApiAcl(session.user.id, "reports", "read");
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const range = resolveReportRange({
    preset: searchParams.get("preset"),
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    tz: searchParams.get("tz"),
  });
  const cacheKey = `${range.from}|${range.to}|${range.tz}`;

  try {
    const getOverview = unstable_cache(
      async () => fetchReportsOverview(range),
      [cacheKey],
      { revalidate: 60, tags: ["reports-overview"] }
    );
    const data = await getOverview();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
