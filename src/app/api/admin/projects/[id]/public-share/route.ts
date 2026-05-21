import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { assertProjectAccess } from "@/lib/projects";
import { createPublicShare } from "@/lib/public-share/create-share";
import { toShareListItem } from "@/lib/public-share/assert-share-access";
import { publicShareUrl } from "@/lib/public-share/urls";

type Params = { params: Promise<{ id: string }> };

const postSchema = z.object({
  clientName: z.string().min(1).max(200),
  recipientEmail: z.string().email().optional(),
  sendEmail: z.boolean().optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "read");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "read");
  if (accessDenied) return accessDenied;

  const shares = await db.clientResourceShare.findMany({
    where: { projectId, resourceType: "PROJECT" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    shares.map((s) => ({
      ...toShareListItem(s),
      url: publicShareUrl("PROJECT", s.token),
    }))
  );
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  const parsed = postSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  try {
    const created = await createPublicShare({
      resourceType: "PROJECT",
      projectId,
      clientName: parsed.data.clientName,
      recipientEmail: parsed.data.recipientEmail,
      createdById: session.user.id,
      expiresInDays: parsed.data.expiresInDays,
    });

    let emailSent = false;
    if (parsed.data.sendEmail !== false && parsed.data.recipientEmail) {
      const mail = await import("@/lib/public-share/send-share-email").then((m) =>
        m.sendShareAccessEmail(created.id)
      );
      emailSent = mail.sent;
    }

    return NextResponse.json({ ...created, emailSent }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "CLIENT_NAME_REQUIRED") {
      return NextResponse.json({ error: "Client name required" }, { status: 400 });
    }
    throw e;
  }
}
