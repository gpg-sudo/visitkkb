import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

// POST /api/analytics - Track an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { event, metadata, sessionId } = body;

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event name is required" },
        { status: 400 },
      );
    }

    // Get user if authenticated
    const user = await verifyToken(request);

    // Track analytics event
    await prisma.analytics.create({
      data: {
        event,
        userId: user?.userId,
        sessionId: sessionId || null,
        metadata: metadata || {},
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Don't fail the request if analytics fails
    return NextResponse.json({ success: true });
  }
}

// GET /api/analytics - Get analytics data (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const event = searchParams.get("event");

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (event) {
      where.event = event;
    }

    // Get analytics data
    const [events, eventCounts] = await Promise.all([
      prisma.analytics.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.analytics.groupBy({
        by: ["event"],
        where,
        _count: true,
      }),
    ]);

    // Get booking stats
    const bookingStats = await prisma.booking.groupBy({
      by: ["status", "bookingType"],
      _count: true,
      _sum: { totalAmount: true },
      where: {
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      },
    });

    // Get user stats
    const userStats = await prisma.user.count({
      where: {
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      },
    });

    // Get popular items
    const popularActivities = await prisma.activity.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { bookings: { _count: "desc" } },
      take: 5,
    });

    const popularStays = await prisma.stay.findMany({
      select: {
        id: true,
        title: true,
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { bookings: { _count: "desc" } },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        events,
        eventCounts,
        bookingStats,
        userStats: {
          totalUsers: userStats,
        },
        popular: {
          activities: popularActivities,
          stays: popularStays,
        },
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
