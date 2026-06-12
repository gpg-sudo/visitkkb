import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getMapPins, invalidateMapPinsCache } from "@/lib/mapPins";

// GET /api/map/pins - Public: Get all visible pins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minLat = searchParams.get('minLat');
    const maxLat = searchParams.get('maxLat');
    const minLng = searchParams.get('minLng');
    const maxLng = searchParams.get('maxLng');

    let pins;

    if (minLat && maxLat && minLng && maxLng) {
      // Use bbox filtering if provided
      // Note: We import getMapPinsByBbox dynamically or add it to imports
      const { getMapPinsByBbox } = await import("@/lib/mapPins");
      pins = await getMapPinsByBbox(
        parseFloat(minLat),
        parseFloat(maxLat),
        parseFloat(minLng),
        parseFloat(maxLng)
      );
    } else {
      // Default to all pins (cached)
      pins = await getMapPins();
    }

    return NextResponse.json(
      {
        success: true,
        data: pins,
        count: pins.length,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error("Error fetching map pins:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch map pins" },
      { status: 500 }
    );
  }
}

// POST /api/map/pins - Admin only: Create new pin
export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper auth check for admin role
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      category,
      lat,
      lng,
      address,
      linkType,
      activityId,
      stayId,
      restaurantId,
      externalUrl,
      iconType,
      isVisible,
      priority,
    } = body;

    // Validate required fields
    if (!title || !slug || !category || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, slug, category, lat, lng" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existingPin = await prisma.mapPin.findUnique({
      where: { slug },
    });

    if (existingPin) {
      return NextResponse.json(
        { success: false, error: "A pin with this slug already exists" },
        { status: 400 }
      );
    }

    const pin = await prisma.mapPin.create({
      data: {
        title,
        slug,
        description,
        category,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address,
        linkType: linkType ?? "none",
        activityId: linkType === "activity" ? activityId : null,
        stayId: linkType === "stay" ? stayId : null,
        restaurantId: linkType === "restaurant" ? restaurantId : null,
        externalUrl: linkType === "external" ? externalUrl : null,
        iconType: iconType ?? "default",
        isVisible: isVisible ?? true,
        priority: priority ?? 0,
      },
      include: {
        activity: true,
        stay: true,
        restaurant: true,
      },
    });

    // Invalidate cache
    invalidateMapPinsCache();

    return NextResponse.json({
      success: true,
      data: pin,
      message: "Map pin created successfully",
    });
  } catch (error) {
    console.error("Error creating map pin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create map pin" },
      { status: 500 }
    );
  }
}

