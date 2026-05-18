import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { generateContractPdfForDocument } from "@/lib/templates/generate-document";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "templates", "write");
  if (denied) return denied;

  const { id } = await params;
  try {
    const doc = await generateContractPdfForDocument(id);
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
