import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/map/settings - Public: Get map settings
export async function GET() {
  try {
    // Get or create default settings
    let settings = await prisma.mapSettings.findFirst();

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.mapSettings.create({
        data: {
          provider: "google",
          defaultCenterLat: 3.5728,
          defaultCenterLng: 101.6411,
          defaultZoom: 13,
          showOnNavbar: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        // Check if API key is available from environment
        hasApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      },
    });
  } catch (error) {
    console.error("Error fetching map settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch map settings" },
      { status: 500 }
    );
  }
}

// PUT /api/map/settings - Admin only: Update map settings
export async function PUT(request: NextRequest) {
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
      provider,
      defaultCenterLat,
      defaultCenterLng,
      defaultZoom,
      mapStyleJson,
      showOnNavbar,
    } = body;

    // Get existing settings or create new
    let settings = await prisma.mapSettings.findFirst();

    if (settings) {
      settings = await prisma.mapSettings.update({
        where: { id: settings.id },
        data: {
          provider: provider ?? settings.provider,
          defaultCenterLat: defaultCenterLat ?? settings.defaultCenterLat,
          defaultCenterLng: defaultCenterLng ?? settings.defaultCenterLng,
          defaultZoom: defaultZoom ?? settings.defaultZoom,
          mapStyleJson: mapStyleJson !== undefined ? mapStyleJson : settings.mapStyleJson,
          showOnNavbar: showOnNavbar ?? settings.showOnNavbar,
        },
      });
    } else {
      settings = await prisma.mapSettings.create({
        data: {
          provider: provider ?? "google",
          defaultCenterLat: defaultCenterLat ?? 3.5728,
          defaultCenterLng: defaultCenterLng ?? 101.6411,
          defaultZoom: defaultZoom ?? 13,
          mapStyleJson,
          showOnNavbar: showOnNavbar ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Map settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating map settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update map settings" },
      { status: 500 }
    );
  }
}

