import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { invalidateMapPinsCache } from "@/lib/mapPins";

// GET /api/map/pins/[id] - Get single pin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const pin = await prisma.mapPin.findUnique({
      where: { id },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
        stay: {
          select: {
            id: true,
            title: true,
            slug: true,
            image: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
      },
    });

    if (!pin) {
      return NextResponse.json(
        { success: false, error: "Pin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pin,
    });
  } catch (error) {
    console.error("Error fetching map pin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch map pin" },
      { status: 500 }
    );
  }
}

// PUT /api/map/pins/[id] - Admin only: Update pin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add proper auth check for admin role
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const existingPin = await prisma.mapPin.findUnique({
      where: { id },
    });

    if (!existingPin) {
      return NextResponse.json(
        { success: false, error: "Pin not found" },
        { status: 404 }
      );
    }

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

    // Check for duplicate slug (excluding current pin)
    if (slug && slug !== existingPin.slug) {
      const duplicateSlug = await prisma.mapPin.findUnique({
        where: { slug },
      });
      if (duplicateSlug) {
        return NextResponse.json(
          { success: false, error: "A pin with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updatedPin = await prisma.mapPin.update({
      where: { id },
      data: {
        title: title ?? existingPin.title,
        slug: slug ?? existingPin.slug,
        description: description !== undefined ? description : existingPin.description,
        category: category ?? existingPin.category,
        lat: lat !== undefined ? parseFloat(lat) : existingPin.lat,
        lng: lng !== undefined ? parseFloat(lng) : existingPin.lng,
        address: address !== undefined ? address : existingPin.address,
        linkType: linkType ?? existingPin.linkType,
        activityId: linkType === "activity" ? activityId : null,
        stayId: linkType === "stay" ? stayId : null,
        restaurantId: linkType === "restaurant" ? restaurantId : null,
        externalUrl: linkType === "external" ? externalUrl : null,
        iconType: iconType ?? existingPin.iconType,
        isVisible: isVisible ?? existingPin.isVisible,
        priority: priority ?? existingPin.priority,
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
      data: updatedPin,
      message: "Map pin updated successfully",
    });
  } catch (error) {
    console.error("Error updating map pin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update map pin" },
      { status: 500 }
    );
  }
}

// DELETE /api/map/pins/[id] - Admin only: Delete pin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add proper auth check for admin role
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingPin = await prisma.mapPin.findUnique({
      where: { id },
    });

    if (!existingPin) {
      return NextResponse.json(
        { success: false, error: "Pin not found" },
        { status: 404 }
      );
    }

    await prisma.mapPin.delete({
      where: { id },
    });

    // Invalidate cache
    invalidateMapPinsCache();

    return NextResponse.json({
      success: true,
      message: "Map pin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting map pin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete map pin" },
      { status: 500 }
    );
  }
}
