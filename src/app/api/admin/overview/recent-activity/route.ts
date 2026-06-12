import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RecentActivityItem = {
  id: string;
  type: string;
  actor?: string | null;
  summary: string;
  createdAt: string;
  link?: string | null;
};

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 50) : 20;

    const [bookings, reviews, blogPosts, syncLogs] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          bookingType: true,
          status: true,
          confirmationCode: true,
        },
      }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          rating: true,
          activityId: true,
          stayId: true,
          restaurantId: true,
        },
      }),
      prisma.blogPost.findMany({
        orderBy: { publishedAt: "desc" },
        where: { status: "PUBLISHED" },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          publishedAt: true,
          title: true,
          slug: true,
        },
      }),
      prisma.syncLog.findMany({
        orderBy: { startedAt: "desc" },
        take: limit,
        select: {
          id: true,
          provider: true,
          type: true,
          status: true,
          startedAt: true,
          summary: true,
        },
      }),
    ]);

    const items: RecentActivityItem[] = [];

    for (const b of bookings) {
      items.push({
        id: `booking-${b.id}`,
        type: "BOOKING",
        summary: `Booking ${b.confirmationCode} (${b.bookingType}) - ${b.status}`,
        createdAt: b.createdAt.toISOString(),
        link: `/dashboard/system/bookings`,
      });
    }

    for (const r of reviews) {
      items.push({
        id: `review-${r.id}`,
        type: "REVIEW",
        summary: `New review (${r.rating}★)`,
        createdAt: r.createdAt.toISOString(),
        link: `/dashboard/reviews`,
      });
    }

    for (const p of blogPosts) {
      items.push({
        id: `blog-${p.id}`,
        type: "CONTENT",
        summary: `Blog published: ${p.title}`,
        createdAt: (p.publishedAt || p.createdAt).toISOString(),
        link: `/dashboard/content/blog`,
      });
    }

    for (const s of syncLogs) {
      items.push({
        id: `sync-${s.id}`,
        type: "SYNC",
        summary: `Sync ${s.type} via ${s.provider} - ${s.status}`,
        createdAt: s.startedAt.toISOString(),
        link: `/dashboard/integrations`,
      });
    }

    const sorted = items
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .slice(0, limit);

    return NextResponse.json({ success: true, data: sorted });
  } catch (error: unknown) {
    console.error("Error in recent activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load recent activity", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


