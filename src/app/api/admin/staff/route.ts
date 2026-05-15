import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const STAFF_ROLES = ["ADMIN", "ENGINEER", "SALES", "OPS"];

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const staff = await db.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: {
        select: {
          assignedTickets: true,
        },
      },
    },
    orderBy: { role: "asc" },
  });

  return NextResponse.json(staff);
}
