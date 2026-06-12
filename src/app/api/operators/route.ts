import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

// GET /api/operators - Get all operators/agents
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // OPERATOR or AGENT

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (type) where.type = type;

    const operators = await prisma.operator.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { activities: true, stays: true, restaurants: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: operators });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch operators" },
      { status: 500 },
    );
  }
}

// POST /api/operators - Create new operator/agent
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const operator = await prisma.operator.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        type: body.type || "OPERATOR",
        whatsapp: body.whatsapp,
        commission: parseFloat(body.commission || "0"),
        description: body.description,
        verified: true,
      },
    });

    return NextResponse.json({ success: true, data: operator });
  } catch (error) {
    console.error("Create operator error:", error);
    return NextResponse.json(
      { error: "Failed to create operator" },
      { status: 500 },
    );
  }
}
