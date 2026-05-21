import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import {
  assertProjectAccess,
  reorderProjectStepsSchema,
  revalidateProjectPaths,
} from "@/lib/projects";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const denied = await assertAdminApiAcl(session.user.id, "projects", "write");
  if (denied) return denied;

  const { id: projectId } = await params;
  const accessDenied = await assertProjectAccess(session.user.id, projectId, "write");
  if (accessDenied) return accessDenied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = reorderProjectStepsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await db.projectStep.findMany({
    where: { projectId },
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });

  const existingIds = new Set(existing.map((s) => s.id));
  if (
    parsed.data.orderedIds.length !== existing.length ||
    parsed.data.orderedIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  await db.$transaction(
    parsed.data.orderedIds.map((id, i) =>
      db.projectStep.update({
        where: { id },
        data: { sortOrder: i },
      })
    )
  );

  revalidateProjectPaths(projectId);
  return NextResponse.json({ ok: true });
}
