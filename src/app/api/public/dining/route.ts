/**
 * Public API: Get Dining (Database-only)
 * 
 * GET /api/public/dining
 * Returns dining listings from the database only.
 * 
 * IMPORTANT: This endpoint reads ONLY from the database.
 * External API data is synced via background cron jobs.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filters
    const type = searchParams.get("type"); // CAFE, RESTAURANT, WARUNG, etc.
    const cuisine = searchParams.get("cuisine");
    const halal = searchParams.get("halal");
    const featured = searchParams.get("featured");
    const priceLevel = searchParams.get("price"); // 1, 2, 3, 4

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (type) {
      where.type = type;
    }

    if (cuisine) {
      where.OR = [
        { cuisine: { contains: cuisine } },
        { cuisineTags: { contains: cuisine } },
      ];
    }

    if (halal === "true") {
      where.isHalal = true;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (priceLevel) {
      where.priceLevel = parseInt(priceLevel);
    }

    // Get total count
    const total = await prisma.restaurant.count({ where });

    // Get dining from DATABASE ONLY
    const dining = await prisma.restaurant.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { rankingScore: "desc" },
        { rating: "desc" },
      ],
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        shortDescription: true,
        image: true,
        gallery: true,
        location: true,
        lat: true,
        lng: true,
        type: true,
        cuisine: true,
        cuisineTags: true,
        priceRange: true,
        priceLevel: true,
        specialties: true,
        hours: true,
        isHalal: true,
        isVegetarianFriendly: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        sourceType: true,
        // Don't expose internal affiliate data to public
      },
    });

    return NextResponse.json({
      success: true,
      data: dining,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + dining.length < total,
      },
    });
  } catch (error) {
    console.error("Get dining error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dining" },
      { status: 500 }
    );
  }
}

