import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/stays/sync-google
 * 
 * Syncs accommodation data from Google Travel/Places-like API.
 * This is a stub implementation - replace with actual API integration.
 * 
 * Key behaviors:
 * - Creates new stays with sourceType = "GOOGLE_TRAVEL"
 * - Updates existing external stays (matched by externalPlaceId)
 * - Does NOT overwrite manual fields like affiliateMatchName, affiliateDeepLink
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
    await upsertSyncStatus("GOOGLE_TRAVEL", "IN_PROGRESS");

    try {
      // Fetch data from Google Travel-like API
      // In production, this would call the actual Google API
      const externalData = await fetchGoogleTravelData();

      let created = 0;
      let updated = 0;

      for (const hotel of externalData) {
        const existingStay = await prisma.stay.findFirst({
          where: { externalPlaceId: hotel.placeId },
        });

        if (existingStay) {
          // Update existing stay - preserve manual fields
          await prisma.stay.update({
            where: { id: existingStay.id },
            data: {
              // Only update fields from external source
              title: hotel.name,
              rating: hotel.rating,
              reviewCount: hotel.reviewCount,
              priceFrom: hotel.priceEstimate,
              lat: hotel.lat,
              lng: hotel.lng,
              // Do NOT update these manual fields:
              // affiliateMatchName, affiliateProvider, affiliateDeepLink,
              // description, shortDescription, longDescription, image, gallery
            },
          });
          updated++;
        } else {
          // Create new stay
          const slug = generateSlug(hotel.name);
          await prisma.stay.create({
            data: {
              title: hotel.name,
              slug: await ensureUniqueSlug(slug),
              description: hotel.description || `${hotel.name} in Kuala Kubu Bharu`,
              image: hotel.photo || "/images/stays/placeholder.jpg",
              gallery: JSON.stringify(hotel.photos || []),
              location: hotel.address || "Kuala Kubu Bharu, Selangor",
              lat: hotel.lat,
              lng: hotel.lng,
              coordinates: JSON.stringify({ lat: hotel.lat, lng: hotel.lng }),
              pricePerNight: hotel.priceEstimate || 0,
              priceFrom: hotel.priceEstimate,
              type: mapGoogleTypeToStayType(hotel.types),
              amenities: (hotel.amenities || []).join(","),
              maxGuests: 2,
              rooms: 1,
              sourceType: "GOOGLE_TRAVEL",
              externalPlaceId: hotel.placeId,
              rating: hotel.rating,
              reviewCount: hotel.reviewCount,
              rankingScore: calculateRankingScore(hotel),
              status: "PUBLISHED",
              autoMatchEnabled: true,
            },
          });
          created++;
        }
      }

      // Update sync status
      await upsertSyncStatus("GOOGLE_TRAVEL", "SUCCESS", null, created, updated);

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
      const errorMessage = syncError instanceof Error ? syncError.message : "Unknown sync error";
      await upsertSyncStatus("GOOGLE_TRAVEL", "FAILED", errorMessage);
      throw syncError;
    }
  } catch (error) {
    console.error("Error syncing Google Travel data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync Google Travel data" },
      { status: 500 }
    );
  }
}

// GET /api/stays/sync-google - Get sync status
export async function GET() {
  try {
    const status = await prisma.dataSyncStatus.findUnique({
      where: { sourceType: "GOOGLE_TRAVEL" },
    });

    return NextResponse.json({
      success: true,
      data: status || {
        sourceType: "GOOGLE_TRAVEL",
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
      lastSyncAt: status === "SUCCESS" || status === "FAILED" ? new Date() : undefined,
      lastErrorMessage: errorMessage ?? null,
      recordsCreated: created ?? undefined,
      recordsUpdated: updated ?? undefined,
    },
    create: {
      sourceType,
      lastStatus: status,
      lastSyncAt: status === "SUCCESS" || status === "FAILED" ? new Date() : null,
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

  while (await prisma.stay.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Helper: Map Google place types to our stay types
function mapGoogleTypeToStayType(types: string[]): string {
  if (types.includes("lodging") || types.includes("hotel")) return "HOTEL";
  if (types.includes("campground")) return "CAMPING";
  if (types.includes("rv_park")) return "CAMPING";
  if (types.includes("resort")) return "RESORT";
  return "HOMESTAY";
}

// Helper: Calculate ranking score
function calculateRankingScore(hotel: {
  rating: number;
  reviewCount: number;
  priceEstimate?: number;
}): number {
  // Weighted scoring: rating (60%), review count (30%), price competitiveness (10%)
  const ratingScore = (hotel.rating / 5) * 60;
  const reviewScore = Math.min(hotel.reviewCount / 100, 1) * 30;
  const priceScore = hotel.priceEstimate ? Math.max(0, (500 - hotel.priceEstimate) / 500) * 10 : 5;

  return Math.round(ratingScore + reviewScore + priceScore);
}

/**
 * STUB: Fetch data from Google Travel-like API
 * 
 * In production, replace this with actual Google Places API calls:
 * - Use Google Places API Nearby Search
 * - Filter by type: lodging, hotel, resort
 * - Location: Kuala Kubu Bharu, Malaysia (3.5728, 101.6411)
 * - Fetch place details for photos, reviews, etc.
 */
async function fetchGoogleTravelData(): Promise<
  Array<{
    placeId: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    reviewCount: number;
    priceEstimate: number;
    types: string[];
    photo?: string;
    photos?: string[];
    description?: string;
    amenities?: string[];
  }>
> {
  // Simulated data - replace with actual API call
  return [
    {
      placeId: "google_place_001",
      name: "KKB River View Hotel",
      address: "Jalan Dato Muda Jaafar, Kuala Kubu Bharu",
      lat: 3.5745,
      lng: 101.6398,
      rating: 4.2,
      reviewCount: 156,
      priceEstimate: 180,
      types: ["lodging", "hotel"],
      description: "Riverside hotel with mountain views",
      amenities: ["wifi", "parking", "breakfast", "air_conditioning"],
    },
    {
      placeId: "google_place_002",
      name: "Hillside Retreat Resort",
      address: "Jalan Kolam Air, Kuala Kubu Bharu",
      lat: 3.5812,
      lng: 101.6425,
      rating: 4.5,
      reviewCount: 89,
      priceEstimate: 350,
      types: ["lodging", "resort"],
      description: "Luxury resort near hot springs",
      amenities: ["wifi", "pool", "spa", "restaurant", "parking"],
    },
    {
      placeId: "google_place_003",
      name: "Kampung Stay Heritage House",
      address: "Lorong Sungai, Kuala Kubu Bharu",
      lat: 3.5698,
      lng: 101.6378,
      rating: 4.7,
      reviewCount: 42,
      priceEstimate: 120,
      types: ["lodging"],
      description: "Traditional Malay house experience",
      amenities: ["wifi", "parking", "breakfast"],
    },
  ];
}

