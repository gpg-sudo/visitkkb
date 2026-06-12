/**
 * Public API: Get Activities (Database-only)
 * 
 * GET /api/public/activities
 * Returns activity listings from the database only.
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
    const difficulty = searchParams.get("difficulty"); // easy, moderate, hard
    const tag = searchParams.get("tag"); // hiking, water-sports, etc.
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const duration = searchParams.get("duration"); // half-day, full-day, multi-day
    
    // Pagination
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    // Build where clause
    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    if (minPrice || maxPrice) {
      where.pricePerPerson = {};
      if (minPrice) (where.pricePerPerson as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.pricePerPerson as Record<string, number>).lte = parseFloat(maxPrice);
    }

    if (duration) {
      where.duration = { contains: duration };
    }

    // Get total count
    const total = await prisma.activity.count({ where });

    // Get activities from DATABASE ONLY
    const activities = await prisma.activity.findMany({
      where,
      orderBy: [
        { [sortBy]: sortOrder },
      ],
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        longDescription: true,
        image: true,
        gallery: true,
        location: true,
        coordinates: true,
        pricePerPerson: true,
        difficulty: true,
        duration: true,
        maxParticipants: true,
        tags: true,
        minAge: true,
        status: true,
        operator: {
          select: {
            id: true,
            name: true,
            logo: true,
            verified: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + activities.length < total,
      },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get activities" },
      { status: 500 }
    );
  }
}

