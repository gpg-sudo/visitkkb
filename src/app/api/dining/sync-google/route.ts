import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/dining/sync-google
 *
 * Syncs restaurant/dining data from Google Places API (Food & Drink categories).
 * This is a stub implementation - replace with actual Google Places API integration.
 *
 * Key behaviors:
 * - Creates new restaurants with sourceType = "GOOGLE_PLACES"
 * - Updates existing external restaurants (matched by googlePlaceId)
 * - Does NOT overwrite manual fields like:
 *   - description, isHalal, affiliateMatchName, affiliate slugs
 * - Updates: rating, reviewCount, priceLevel, googlePlaceId, lat/lng
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update sync status to IN_PROGRESS
    await upsertSyncStatus("GOOGLE_PLACES_FOOD", "IN_PROGRESS");

    try {
      // Fetch data from Google Places API
      // In production, this would call the actual Google Places API
      const externalData = await fetchGooglePlacesFoodData();

      let created = 0;
      let updated = 0;

      for (const place of externalData) {
        const existingRestaurant = await prisma.restaurant.findFirst({
          where: { googlePlaceId: place.placeId },
        });

        if (existingRestaurant) {
          // Update existing restaurant - preserve manual fields
          await prisma.restaurant.update({
            where: { id: existingRestaurant.id },
            data: {
              // Only update fields from external source
              name: place.name,
              rating: place.rating,
              reviewCount: place.reviewCount,
              priceLevel: place.priceLevel,
              lat: place.lat,
              lng: place.lng,
              coordinates: JSON.stringify({ lat: place.lat, lng: place.lng }),
              // Do NOT update these manual fields:
              // description, shortDescription, isHalal, affiliateMatchName,
              // primaryAffiliateProvider, foodpandaSlug, grabfoodSlug, shopeefoodSlug
            },
          });
          updated++;
        } else {
          // Create new restaurant
          const slug = await ensureUniqueSlug(generateSlug(place.name));
          await prisma.restaurant.create({
            data: {
              name: place.name,
              slug,
              description: place.description || `${place.name} in Kuala Kubu Bharu`,
              image: place.photo || "/images/dining/placeholder.jpg",
              gallery: JSON.stringify(place.photos || []),
              location: place.address || "Kuala Kubu Bharu, Selangor",
              lat: place.lat,
              lng: place.lng,
              coordinates: JSON.stringify({ lat: place.lat, lng: place.lng }),
              type: mapGoogleTypeToRestaurantType(place.types),
              cuisine: place.cuisine || "Local",
              cuisineTags: place.cuisineTags ? JSON.stringify(place.cuisineTags) : null,
              priceRange: priceLevelToRange(place.priceLevel),
              priceLevel: place.priceLevel,
              specialties: "",
              hours: place.openingHours || "Hours vary",
              sourceType: "GOOGLE_PLACES",
              googlePlaceId: place.placeId,
              rating: place.rating,
              reviewCount: place.reviewCount,
              rankingScore: calculateRankingScore(place),
              status: "PUBLISHED",
              autoMatchEnabled: true,
              isHalal: false, // Manual override required
            },
          });
          created++;
        }
      }

      // Update sync status
      await upsertSyncStatus("GOOGLE_PLACES_FOOD", "SUCCESS", null, created, updated);

      return NextResponse.json({
        success: true,
        data: {
          created,
          updated,
          total: externalData.length,
        },
        message: `Sync complete: ${created} created, ${updated} updated`,
      });
    } catch (syncError) {
      const errorMessage =
        syncError instanceof Error ? syncError.message : "Unknown sync error";
      await upsertSyncStatus("GOOGLE_PLACES_FOOD", "FAILED", errorMessage);
      throw syncError;
    }
  } catch (error) {
    console.error("Error syncing Google Places food data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync Google Places data" },
      { status: 500 }
    );
  }
}

// GET /api/dining/sync-google - Get sync status
export async function GET() {
  try {
    const status = await prisma.dataSyncStatus.findUnique({
      where: { sourceType: "GOOGLE_PLACES_FOOD" },
    });

    return NextResponse.json({
      success: true,
      data: status || {
        sourceType: "GOOGLE_PLACES_FOOD",
        lastStatus: "NEVER",
        lastSyncAt: null,
        recordsUpdated: 0,
        recordsCreated: 0,
      },
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}

// Helper: Update or create sync status
async function upsertSyncStatus(
  sourceType: string,
  status: string,
  errorMessage?: string | null,
  created?: number,
  updated?: number
) {
  await prisma.dataSyncStatus.upsert({
    where: { sourceType },
    update: {
      lastStatus: status,
      lastSyncAt:
        status === "SUCCESS" || status === "FAILED" ? new Date() : undefined,
      lastErrorMessage: errorMessage ?? null,
      recordsCreated: created ?? undefined,
      recordsUpdated: updated ?? undefined,
    },
    create: {
      sourceType,
      lastStatus: status,
      lastSyncAt:
        status === "SUCCESS" || status === "FAILED" ? new Date() : null,
      lastErrorMessage: errorMessage ?? null,
      recordsCreated: created ?? 0,
      recordsUpdated: updated ?? 0,
    },
  });
}

// Helper: Generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper: Ensure unique slug
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.restaurant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Helper: Map Google place types to our restaurant types
function mapGoogleTypeToRestaurantType(types: string[]): string {
  if (types.includes("cafe")) return "CAFE";
  if (types.includes("bakery")) return "BAKERY";
  if (types.includes("meal_takeaway")) return "WARUNG";
  if (types.includes("bar")) return "RESTAURANT";
  return "RESTAURANT";
}

// Helper: Convert price level to display range
function priceLevelToRange(priceLevel: number): string {
  switch (priceLevel) {
    case 1:
      return "$";
    case 2:
      return "$$";
    case 3:
      return "$$$";
    case 4:
      return "$$$$";
    default:
      return "$$";
  }
}

// Helper: Calculate ranking score
function calculateRankingScore(place: {
  rating: number;
  reviewCount: number;
  priceLevel?: number;
}): number {
  // Weighted scoring: rating (60%), review count (30%), price accessibility (10%)
  const ratingScore = (place.rating / 5) * 60;
  const reviewScore = Math.min(place.reviewCount / 50, 1) * 30;
  const priceScore = place.priceLevel
    ? Math.max(0, (4 - place.priceLevel) / 4) * 10
    : 5;

  return Math.round(ratingScore + reviewScore + priceScore);
}

/**
 * STUB: Fetch data from Google Places API
 *
 * In production, replace this with actual Google Places API calls:
 * - Use Google Places API Nearby Search
 * - Filter by type: restaurant, cafe, food, bakery, meal_takeaway
 * - Location: Kuala Kubu Bharu, Malaysia (3.5728, 101.6411)
 * - Fetch place details for photos, reviews, opening hours, etc.
 */
async function fetchGooglePlacesFoodData(): Promise<
  Array<{
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    reviewCount: number;
    priceLevel: number;
    types: string[];
    cuisine?: string;
    cuisineTags?: string[];
    photo?: string;
    photos?: string[];
    description?: string;
    openingHours?: string;
  }>
> {
  // Simulated data - replace with actual API call
  return [
    {
      placeId: "google_food_001",
      name: "Restoran Syed",
      address: "Jalan Dato Muda Jaafar, Kuala Kubu Bharu",
      lat: 3.5745,
      lng: 101.6398,
      rating: 4.3,
      reviewCount: 234,
      priceLevel: 1,
      types: ["restaurant", "meal_takeaway"],
      cuisine: "Malay",
      cuisineTags: ["MALAY", "HALAL"],
      description: "Popular local restaurant serving authentic Malay cuisine",
      openingHours: "7:00 AM - 10:00 PM",
    },
    {
      placeId: "google_food_002",
      name: "Kedai Kopi Sin Yoon",
      address: "Main Street, Kuala Kubu Bharu",
      lat: 3.5738,
      lng: 101.6402,
      rating: 4.5,
      reviewCount: 156,
      priceLevel: 1,
      types: ["cafe", "restaurant"],
      cuisine: "Chinese",
      cuisineTags: ["CHINESE", "KOPITIAM"],
      description: "Traditional kopitiam with local Chinese delicacies",
      openingHours: "6:30 AM - 4:00 PM",
    },
    {
      placeId: "google_food_003",
      name: "D'Qalish Cafe",
      address: "Jalan Kolam Air, Kuala Kubu Bharu",
      lat: 3.5752,
      lng: 101.6425,
      rating: 4.2,
      reviewCount: 89,
      priceLevel: 2,
      types: ["cafe"],
      cuisine: "Western",
      cuisineTags: ["WESTERN", "CAFE", "HALAL"],
      description: "Modern cafe with scenic views and Instagram-worthy spots",
      openingHours: "10:00 AM - 10:00 PM",
    },
    {
      placeId: "google_food_004",
      name: "Warung Pak Mat",
      address: "Kampung Sungai Tua, Kuala Kubu Bharu",
      lat: 3.5698,
      lng: 101.6378,
      rating: 4.7,
      reviewCount: 312,
      priceLevel: 1,
      types: ["restaurant", "meal_takeaway"],
      cuisine: "Malay",
      cuisineTags: ["MALAY", "HALAL", "LOCAL_FAVORITE"],
      description: "Famous warung known for traditional kampung cooking",
      openingHours: "11:00 AM - 9:00 PM",
    },
    {
      placeId: "google_food_005",
      name: "Roti Canai Corner",
      address: "Near KKB Market, Kuala Kubu Bharu",
      lat: 3.5742,
      lng: 101.6395,
      rating: 4.4,
      reviewCount: 178,
      priceLevel: 1,
      types: ["restaurant", "meal_takeaway"],
      cuisine: "Indian",
      cuisineTags: ["INDIAN", "MAMAK", "HALAL"],
      description: "Best roti canai in town with variety of curries",
      openingHours: "7:00 AM - 11:00 PM",
    },
  ];
}

