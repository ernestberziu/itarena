import {  NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { buildPdfBufferForDocument } from "@/lib/templates/generate-document";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "templates", "read");
  if (denied) return denied;

  const { id } = await params;
  const langParam = new URL(req.url).searchParams.get("lang");
  const languageOverride =
    langParam === "en" || langParam === "sq" ? langParam : undefined;

  try {
    const { buffer, filename } = await buildPdfBufferForDocument(id, languageOverride);
    return new NextResponse(buffer.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
