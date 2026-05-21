import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPublicSharePasscode } from "@/lib/public-share/verify-passcode";
import { loadShareByToken } from "@/lib/public-share/assert-share-access";

const schema = z.object({
  token: z.string().min(1),
  passcode: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const share = await loadShareByToken(parsed.data.token);
  if (!share) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const result = await verifyPublicSharePasscode(parsed.data.token, parsed.data.passcode);
  if (!result.ok) {
    const status =
      result.error === "locked" ? 429 : result.error === "invalid_passcode" ? 401 : 404;
    return NextResponse.json({ error: result.error }, { status });
  }

  const res = NextResponse.json({
    ok: true,
    clientName: share.clientName,
    resourceType: share.resourceType,
  });
  res.cookies.set(result.cookie);
  return res;
}
