import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"]),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = ["ADMIN", "OPS"].includes(session.user.role);
  if (!isStaff) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "CONFIRMED") updateData.confirmedAt = new Date();
  if (parsed.data.status === "DISPATCHED") updateData.dispatchedAt = new Date();
  if (parsed.data.status === "DELIVERED") updateData.deliveredAt = new Date();
  if (parsed.data.notes) updateData.deliveryNotes = parsed.data.notes;

  await db.order.update({ where: { id }, data: updateData });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPDATE",
      resource: "Order",
      resourceId: id,
      metadata: JSON.stringify({ status: parsed.data.status }),
    },
  });

  return NextResponse.json({ success: true });
}
