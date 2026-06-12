import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/dining/[slug] - Get single restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

// PUT /api/dining/[slug] - Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!existingRestaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Validate update data - be flexible with arrays
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      shortDescription: z.string().optional().nullable(),
      longDescription: z.string().optional().nullable(),
      image: z.string().optional().nullable(),
      gallery: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
      location: z.string().min(1).optional(),
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
      type: z.string().min(1).optional(),
      cuisine: z.string().min(1).optional(),
      cuisineTags: z.union([z.array(z.string()), z.string(), z.null()]).optional(),
      priceRange: z.string().min(1).optional(),
      priceLevel: z.number().min(1).max(4).optional().nullable(),
      specialties: z.string().optional(),
      hours: z.string().optional().nullable(),
      opensAt: z.string().optional().nullable(),
      closesAt: z.string().optional().nullable(),
      openDays: z.union([z.array(z.string()), z.null()]).optional(),
      // Structured operating hours
      operatingHoursJson: z.any().optional().nullable(),
      hoursVerified: z.boolean().optional(),
      isHalal: z.boolean().optional(),
      isVegetarianFriendly: z.boolean().optional(),
      status: z.enum(["PUBLISHED", "DRAFT", "HIDDEN"]).optional(),
      isFeatured: z.boolean().optional(),
      rankingScore: z.number().optional(),
      // Affiliate fields
      affiliateMatchName: z.string().optional().nullable(),
      primaryAffiliateProvider: z.enum(["FOODPANDA", "GRABFOOD", "SHOPEEFOOD"]).optional().nullable(),
      foodpandaSlug: z.string().optional().nullable(),
      grabfoodSlug: z.string().optional().nullable(),
      shopeefoodSlug: z.string().optional().nullable(),
      affiliateDeepLink: z.string().optional().nullable(),
      autoMatchEnabled: z.boolean().optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Normalize arrays helper
    const normalizeArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'string' && val.trim()) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.shortDescription !== undefined) updateData.shortDescription = validatedData.shortDescription;
    if (validatedData.longDescription !== undefined) updateData.longDescription = validatedData.longDescription;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.gallery !== undefined) {
      updateData.gallery = JSON.stringify(normalizeArray(validatedData.gallery));
    }
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.lat !== undefined) updateData.lat = validatedData.lat;
    if (validatedData.lng !== undefined) updateData.lng = validatedData.lng;
    if (validatedData.lat !== undefined && validatedData.lng !== undefined) {
      updateData.coordinates = JSON.stringify({ lat: validatedData.lat, lng: validatedData.lng });
    }
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.cuisine !== undefined) updateData.cuisine = validatedData.cuisine;
    if (validatedData.cuisineTags !== undefined) {
      updateData.cuisineTags = JSON.stringify(normalizeArray(validatedData.cuisineTags));
    }
    if (validatedData.priceRange !== undefined) updateData.priceRange = validatedData.priceRange;
    if (validatedData.priceLevel !== undefined) updateData.priceLevel = validatedData.priceLevel;
    if (validatedData.specialties !== undefined) updateData.specialties = validatedData.specialties;
    if (validatedData.hours !== undefined) updateData.hours = validatedData.hours;
    if (validatedData.opensAt !== undefined) updateData.opensAt = validatedData.opensAt;
    if (validatedData.closesAt !== undefined) updateData.closesAt = validatedData.closesAt;
    if (validatedData.openDays !== undefined) {
      updateData.openDays = JSON.stringify(validatedData.openDays);
    }
    // Structured operating hours
    if (validatedData.operatingHoursJson !== undefined) {
      updateData.operatingHoursJson = validatedData.operatingHoursJson 
        ? JSON.stringify(validatedData.operatingHoursJson) 
        : null;
    }
    if (validatedData.hoursVerified !== undefined) updateData.hoursVerified = validatedData.hoursVerified;
    if (validatedData.isHalal !== undefined) updateData.isHalal = validatedData.isHalal;
    if (validatedData.isVegetarianFriendly !== undefined) updateData.isVegetarianFriendly = validatedData.isVegetarianFriendly;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.isFeatured !== undefined) updateData.isFeatured = validatedData.isFeatured;
    if (validatedData.rankingScore !== undefined) updateData.rankingScore = validatedData.rankingScore;

    // Affiliate fields
    if (validatedData.affiliateMatchName !== undefined) updateData.affiliateMatchName = validatedData.affiliateMatchName;
    if (validatedData.primaryAffiliateProvider !== undefined) updateData.primaryAffiliateProvider = validatedData.primaryAffiliateProvider;
    if (validatedData.foodpandaSlug !== undefined) updateData.foodpandaSlug = validatedData.foodpandaSlug;
    if (validatedData.grabfoodSlug !== undefined) updateData.grabfoodSlug = validatedData.grabfoodSlug;
    if (validatedData.shopeefoodSlug !== undefined) updateData.shopeefoodSlug = validatedData.shopeefoodSlug;
    if (validatedData.affiliateDeepLink !== undefined) updateData.affiliateDeepLink = validatedData.affiliateDeepLink;
    if (validatedData.autoMatchEnabled !== undefined) updateData.autoMatchEnabled = validatedData.autoMatchEnabled;

    const restaurant = await prisma.restaurant.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: restaurant,
      message: "Restaurant updated successfully",
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

// DELETE /api/dining/[slug] - Delete restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!existingRestaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    await prisma.restaurant.delete({ where: { slug } });

    return NextResponse.json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}

