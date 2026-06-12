import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const createReviewSchema = z.object({
  itemType: z.enum(["activity", "stay", "restaurant"]),
  itemId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(3).max(100).optional(),
  content: z.string().min(10).max(1000),
  images: z.array(z.string()).max(5).optional(),
});

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    // Check if user has a completed booking for this item
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: user.userId,
        status: "COMPLETED",
        ...(validated.itemType === "activity" && {
          activityId: validated.itemId,
        }),
        ...(validated.itemType === "stay" && { stayId: validated.itemId }),
      },
    });

    if (!hasBooking) {
      return NextResponse.json(
        { success: false, error: "You can only review items you have booked" },
        { status: 403 },
      );
    }

    // Check if user already reviewed this item
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.userId,
        ...(validated.itemType === "activity" && {
          activityId: validated.itemId,
        }),
        ...(validated.itemType === "stay" && { stayId: validated.itemId }),
        ...(validated.itemType === "restaurant" && {
          restaurantId: validated.itemId,
        }),
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this item" },
        { status: 400 },
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.userId,
        ...(validated.itemType === "activity" && {
          activityId: validated.itemId,
        }),
        ...(validated.itemType === "stay" && { stayId: validated.itemId }),
        ...(validated.itemType === "restaurant" && {
          restaurantId: validated.itemId,
        }),
        rating: validated.rating,
        title: validated.title,
        content: validated.content,
        images: JSON.stringify(validated.images || []),
        verified: !!hasBooking,
      },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error) {
    console.error("Review creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid review data", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}

// GET /api/reviews - Get reviews for an item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get("itemType");
    const itemId = searchParams.get("itemId");
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = Number(searchParams.get("offset")) || 0;

    if (!itemType || !itemId) {
      return NextResponse.json(
        { success: false, error: "itemType and itemId are required" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (itemType === "activity") where.activityId = itemId;
    if (itemType === "stay") where.stayId = itemId;
    if (itemType === "restaurant") where.restaurantId = itemId;

    const [reviews, totalCount, averageRating] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount,
        },
        stats: {
          averageRating: averageRating._avg.rating || 0,
          totalReviews: totalCount,
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
