/**
 * Public API: Get Map Pins (Database-only)
 * 
 * GET /api/public/map-pins
 * Returns map pins from the database only.
 * 
 * IMPORTANT: This endpoint reads ONLY from the database.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filters
    const category = searchParams.get("category"); // HOT_SPRING, WATERFALL, HIKING, etc.
    
    // Build where clause
    const where: Record<string, unknown> = {
      isVisible: true,
    };

    if (category) {
      where.category = category;
    }

    // Get map settings
    const settings = await prisma.mapSettings.findFirst();

    // Get pins from DATABASE ONLY
    const pins = await prisma.mapPin.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { title: "asc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        category: true,
        lat: true,
        lng: true,
        address: true,
        linkType: true,
        activityId: true,
        stayId: true,
        restaurantId: true,
        externalUrl: true,
        iconType: true,
        priority: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        settings: settings ? {
          defaultCenterLat: settings.defaultCenterLat,
          defaultCenterLng: settings.defaultCenterLng,
          defaultZoom: settings.defaultZoom,
          mapStyleJson: settings.mapStyleJson,
        } : {
          defaultCenterLat: 3.5728,
          defaultCenterLng: 101.6411,
          defaultZoom: 13,
        },
        pins,
      },
    });
  } catch (error) {
    console.error("Get map pins error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get map pins" },
      { status: 500 }
    );
  }
}

