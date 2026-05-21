import {  NextRequest, NextResponse  } from "next/server";
import { apiErr } from "@/lib/i18n/err";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { assertAdminApiAcl } from "@/lib/admin-acl/guards";
import { inviteExistingPortalClient } from "@/lib/invite-existing-portal-client";

const inviteSchema = z
  .object({
    email: z.string().email().max(255),
    notifyCustomer: z.boolean().optional().default(true),
  })
  .strict();

function forbidIfNotStaff(role: string | undefined) {
  const allowed = ["ADMIN", "SALES"];
  if (!role || !allowed.includes(role)) {
    return apiErr("sq", "forbidden", 403);
  }
  return null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return apiErr(req, "unauthorized", 401);
  const forbidden = forbidIfNotStaff(session.user.role);
  if (forbidden) return forbidden;
  const denied = await assertAdminApiAcl(session.user.id, "clients", "write");
  if (denied) return denied;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErr(req, "invalidJson", 400);
  }

  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return apiErr(req, "invalidBody", 400, { details: parsed.error.flatten() });
  }

  const locale = session.user.language === "en" ? "en" : "sq";

  try {
    const result = await inviteExistingPortalClient({
      userId: id,
      email: parsed.data.email,
      locale,
      notifyCustomer: parsed.data.notifyCustomer,
    });

    const { emitNotificationSafe } = await import("@/lib/notifications");
    emitNotificationSafe({
      type: "CLIENT_INVITED",
      actorId: session.user.id,
      payload: { userId: id },
      skipEmail: result.credentialsEmailSent,
    });

    return NextResponse.json({
      ok: true,
      notifyEmailAttempted: result.notifyEmailAttempted,
      credentialsEmailSent: result.credentialsEmailSent,
      temporaryPassword: result.temporaryPassword,
      isFirstInvite: result.isFirstInvite,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return apiErr(req, "notFound", 404);
      }
      if (err.message === "INACTIVE") {
        return NextResponse.json({ error: "Client account is suspended" }, { status: 400 });
      }
      if (err.message === "EMAIL_EXISTS") {
        return apiErr(req, "emailInUse", 409);
      }
    }
    return NextResponse.json({ error: "Invite failed" }, { status: 500 });
  }
}
