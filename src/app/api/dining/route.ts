import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/dining - List all dining places
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const type = searchParams.get("type");
    const types = type ? type.split(",") : null;
    const tag = searchParams.get("tag"); // Cuisine tag or HALAL
    const price = searchParams.get("price"); // $, $$, $$$
    const sourceType = searchParams.get("sourceType");
    const sort = searchParams.get("sort") || "rankingScore";
    const order = searchParams.get("order") || "desc";
    const featured = searchParams.get("featured") === "true";
    const halal = searchParams.get("halal") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (types && types.length > 0) {
      where.type = { in: types };
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (halal || tag === "HALAL") {
      where.isHalal = true;
    }

    if (tag && tag !== "HALAL") {
      // Search in cuisineTags JSON field
      where.cuisineTags = { contains: tag };
    }

    if (price) {
      where.priceRange = price;
    }

    // Build orderBy
    const orderBy: Record<string, string> = {};
    if (sort === "price") {
      orderBy.priceLevel = order;
    } else if (sort === "rating") {
      orderBy.rating = order;
    } else if (sort === "name") {
      orderBy.name = order === "desc" ? "desc" : "asc";
    } else {
      orderBy.rankingScore = "desc";
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        operator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.restaurant.count({ where });

    return NextResponse.json({
      success: true,
      data: restaurants,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + restaurants.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching dining places:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dining places" },
      { status: 500 }
    );
  }
}

// POST /api/dining - Create new dining place
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields - be flexible with arrays to avoid "expected array" errors
    const restaurantSchema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1).optional(),
      description: z.string().min(1),
      shortDescription: z.string().optional().nullable(),
      image: z.string().optional().nullable(), // Allow empty, will use default
      gallery: z.union([z.array(z.string()), z.string(), z.null()]).optional(), // Accept array, string, or null
      location: z.string().min(1),
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
      type: z.string().min(1),
      cuisine: z.string().min(1),
      cuisineTags: z.union([z.array(z.string()), z.string(), z.null()]).optional(), // Accept array, string, or null
      priceRange: z.string().min(1),
      priceLevel: z.number().min(1).max(4).optional().nullable(),
      specialties: z.string().optional(),
      // Operating hours - now optional
      hours: z.string().optional().nullable(),
      opensAt: z.string().optional().nullable(),
      closesAt: z.string().optional().nullable(),
      openDays: z.union([z.array(z.string()), z.null()]).optional(),
      operatingHoursJson: z.any().optional().nullable(), // Structured weekly schedule
      hoursVerified: z.boolean().optional(),
      isHalal: z.boolean().optional(),
      isVegetarianFriendly: z.boolean().optional(),
      operatorId: z.string().optional().nullable(),
      status: z.enum(["PUBLISHED", "DRAFT", "HIDDEN"]).optional(),
      isFeatured: z.boolean().optional(),
      // Affiliate fields
      affiliateMatchName: z.string().optional().nullable(),
      primaryAffiliateProvider: z.enum(["FOODPANDA", "GRABFOOD", "SHOPEEFOOD"]).optional().nullable(),
      foodpandaSlug: z.string().optional().nullable(),
      grabfoodSlug: z.string().optional().nullable(),
      shopeefoodSlug: z.string().optional().nullable(),
      affiliateDeepLink: z.string().optional().nullable(),
      autoMatchEnabled: z.boolean().optional(),
    });

    const validatedData = restaurantSchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);

    // Check for unique slug
    const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (existingRestaurant) {
      return NextResponse.json(
        { success: false, error: "A restaurant with this slug already exists" },
        { status: 400 }
      );
    }

    // Determine default image based on type
    const getDefaultImage = (type: string): string => {
      const t = type.toUpperCase();
      if (t.includes("WARUNG")) return "/images/dining/default-warung.jpg";
      if (t.includes("CAFE")) return "/images/dining/default-cafe.jpg";
      if (t.includes("MAMAK")) return "/images/dining/default-mamak.jpg";
      if (t.includes("BAKERY")) return "/images/dining/default-bakery.jpg";
      return "/images/dining/default.jpg";
    };

    // Normalize arrays (might come as string, array, or null)
    const normalizeArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.filter(Boolean);
      if (typeof val === 'string' && val.trim()) {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
          // If not JSON, split by comma
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    const galleryArray = normalizeArray(validatedData.gallery);
    const cuisineTagsArray = normalizeArray(validatedData.cuisineTags);

    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription || null,
        image: validatedData.image || getDefaultImage(validatedData.type),
        gallery: JSON.stringify(galleryArray),
        location: validatedData.location,
        lat: validatedData.lat || null,
        lng: validatedData.lng || null,
        coordinates: validatedData.lat && validatedData.lng
          ? JSON.stringify({ lat: validatedData.lat, lng: validatedData.lng })
          : null,
        type: validatedData.type,
        cuisine: validatedData.cuisine,
        cuisineTags: cuisineTagsArray.length > 0
          ? JSON.stringify(cuisineTagsArray)
          : null,
        priceRange: validatedData.priceRange,
        priceLevel: validatedData.priceLevel || null,
        specialties: validatedData.specialties || "",
        // Operating hours
        hours: validatedData.hours || "Hours not set",
        opensAt: validatedData.opensAt || null,
        closesAt: validatedData.closesAt || null,
        openDays: validatedData.openDays
          ? JSON.stringify(validatedData.openDays)
          : null,
        operatingHoursJson: validatedData.operatingHoursJson 
          ? JSON.stringify(validatedData.operatingHoursJson)
          : null,
        hoursVerified: validatedData.hoursVerified || false,
        isHalal: validatedData.isHalal || false,
        isVegetarianFriendly: validatedData.isVegetarianFriendly || false,
        operatorId: validatedData.operatorId || null,
        status: validatedData.status || "DRAFT",
        sourceType: "MANUAL",
        isFeatured: validatedData.isFeatured || false,
        // Affiliate fields
        affiliateMatchName: validatedData.affiliateMatchName || null,
        primaryAffiliateProvider: validatedData.primaryAffiliateProvider || null,
        foodpandaSlug: validatedData.foodpandaSlug || null,
        grabfoodSlug: validatedData.grabfoodSlug || null,
        shopeefoodSlug: validatedData.shopeefoodSlug || null,
        affiliateDeepLink: validatedData.affiliateDeepLink || null,
        autoMatchEnabled: validatedData.autoMatchEnabled ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: restaurant,
      message: "Restaurant created successfully",
    });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

