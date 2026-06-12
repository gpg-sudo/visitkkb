/**
 * Public API: Get Stays (Database-only)
 * 
 * GET /api/public/stays
 * Returns stay listings from the database only.
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
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const amenities = searchParams.get("amenities"); // Comma-separated
    const experience = searchParams.get("experience"); // e.g., family_friendly
    
    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "rankingScore";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (type) {
      where.type = type;
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) (where.pricePerNight as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.pricePerNight as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (amenities) {
      // Filter by amenities (stored as comma-separated string)
      const amenityList = amenities.split(",");
      where.AND = amenityList.map((amenity) => ({
        amenities: { contains: amenity.trim() },
      }));
    }

    if (experience) {
      // Filter by experience tags (stored as JSON array string)
      where.experienceTags = { contains: experience };
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    if (sortBy === "price") {
      orderBy.pricePerNight = sortOrder;
    } else if (sortBy === "rating") {
      orderBy.rating = sortOrder;
    } else if (sortBy === "newest") {
      orderBy.createdAt = sortOrder;
    } else {
      // Default: by ranking score (featured first, then by score)
      orderBy.isFeatured = "desc";
    }

    // Get total count
    const total = await prisma.stay.count({ where });

    // Get stays from DATABASE ONLY
    const stays = await prisma.stay.findMany({
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
        title: true,
        slug: true,
        description: true,
        shortDescription: true,
        image: true,
        gallery: true,
        location: true,
        lat: true,
        lng: true,
        type: true,
        amenities: true,
        pricePerNight: true,
        priceFrom: true,
        currency: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
        experienceTags: true,
        sourceType: true,
        // Don't expose internal affiliate data to public
      },
    });

    return NextResponse.json({
      success: true,
      data: stays,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + stays.length < total,
      },
    });
  } catch (error) {
    console.error("Get stays error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stays" },
      { status: 500 }
    );
  }
}

