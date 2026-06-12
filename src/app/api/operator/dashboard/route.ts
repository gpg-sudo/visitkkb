import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

// GET /api/operator/dashboard - Get operator specific stats
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !requireRole(user, ["OPERATOR", "AGENT"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the operator record linked to this user
    // Assuming User model has an operatorId or email matches
    const operator = await prisma.operator.findUnique({
      where: { email: user.email },
      include: {
        _count: {
          select: { activities: true, stays: true, restaurants: true },
        },
      },
    });

    if (!operator) {
      return NextResponse.json(
        { error: "Operator profile not found" },
        { status: 404 },
      );
    }

    // Get bookings for this operator's items
    // This is a simplified query - in production would need complex joins
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { activity: { operatorId: operator.id } },
          { stay: { operatorId: operator.id } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        activity: { select: { title: true } },
        stay: { select: { title: true } },
      },
    });

    // Calculate stats
    const totalBookings = bookings.length; // In real app, count all
    const revenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const commission = revenue * (operator.commission / 100);

    return NextResponse.json({
      success: true,
      data: {
        profile: operator,
        stats: {
          totalBookings,
          revenue,
          commission,
          itemsCount:
            operator._count.activities +
            operator._count.stays +
            operator._count.restaurants,
        },
        recentBookings: bookings,
      },
    });
  } catch (error) {
    console.error("Operator dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
