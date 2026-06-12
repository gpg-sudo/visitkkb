import { PrismaClient } from "@prisma/client";

/**
 * Data ingestion script for VisitKKB "Where to Stay".
 *
 * Responsibilities:
 * - Fetch up to 10 stays for Kuala Kubu Bharu from a PUBLIC, configurable API
 *   (or scraping service that you configure), respecting that:
 *   - No paywalls or login-gated pages
 *   - Respect robots.txt on the data provider side
 * - Map results into the Stay table
 * - Upsert by slug
 * - Print a summary report (fetched / created / updated / failed)
 *
 * NOTE:
 * - This script does NOT ship with a hardcoded provider to avoid violating
 *   any third‑party ToS. You must point it at a data source you control or a
 *   clearly open/open‑data API by configuring environment variables.
 *
 * Expected environment variables:
 * - STAYS_INGEST_API_URL
 *     A public endpoint returning JSON list of hotels around
 *     Kuala Kubu Bharu, Selangor, Malaysia.
 *     Example (shape you control):
 *     [
 *       {
 *         "id": "external-123",
 *         "name": "Hotel Example",
 *         "address": "Kuala Kubu Bharu, Selangor, Malaysia",
 *         "locationName": "KKB Town Centre",
 *         "lat": 3.565,
 *         "lng": 101.654,
 *         "rating": 4.5,
 *         "priceFrom": 220,
 *         "currency": "MYR",
 *         "thumbnailUrl": "https://your-open-images/hotel.jpg"
 *       }
 *     ]
 */

const prisma = new PrismaClient();

interface ExternalStay {
  id?: string;
  name: string;
  address?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  rating?: number | null;
  priceFrom?: number | null;
  currency?: string | null;
  thumbnailUrl?: string | null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function fetchExternalStays(limit: number): Promise<ExternalStay[]> {
  const apiUrl = process.env.STAYS_INGEST_API_URL;

  if (!apiUrl) {
    throw new Error(
      "STAYS_INGEST_API_URL is not set. Configure it to point to an allowed public listing API or your own proxy."
    );
  }

  const url = new URL(apiUrl);
  // Hint to the upstream API that we only want up to `limit` results if supported
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("q", "Kuala Kubu Bharu, Selangor, Malaysia");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      // Add any public API key via env if needed, do NOT hardcode:
      ...(process.env.STAYS_INGEST_API_KEY
        ? { "X-API-Key": process.env.STAYS_INGEST_API_KEY }
        : {}),
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch external stays: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error("Expected external API to return an array of stays.");
  }

  // Basic runtime shaping; you control the upstream mapping:
  interface RawStayData {
    name?: string;
    title?: string;
    id?: string;
    address?: string;
    formattedAddress?: string;
    locationName?: string;
    lat?: number;
    latitude?: number;
    lng?: number;
    longitude?: number;
    rating?: number;
    score?: number;
    priceFrom?: number;
    price?: number;
    currency?: string;
    thumbnailUrl?: string;
  }
  const stays: ExternalStay[] = data
    .map((raw: RawStayData) => {
      const name = raw.name || raw.title;
      if (!name || typeof name !== "string") return null;

      const thumbnailUrl =
        typeof raw.thumbnailUrl === "string" && raw.thumbnailUrl.trim()
          ? raw.thumbnailUrl.trim()
          : undefined;

      return {
        id: raw.id,
        name,
        address:
          typeof raw.address === "string" ? raw.address : raw.formattedAddress,
        locationName:
          typeof raw.locationName === "string"
            ? raw.locationName
            : undefined,
        lat:
          typeof raw.lat === "number"
            ? raw.lat
            : typeof raw.latitude === "number"
            ? raw.latitude
            : undefined,
        lng:
          typeof raw.lng === "number"
            ? raw.lng
            : typeof raw.longitude === "number"
            ? raw.longitude
            : undefined,
        rating:
          typeof raw.rating === "number"
            ? raw.rating
            : typeof raw.score === "number"
            ? raw.score
            : null,
        priceFrom:
          typeof raw.priceFrom === "number"
            ? raw.priceFrom
            : typeof raw.price === "number"
            ? raw.price
            : null,
        currency:
          typeof raw.currency === "string" ? raw.currency : "MYR",
        thumbnailUrl,
      } as ExternalStay;
    })
    .filter((s): s is ExternalStay => !!s)
    .slice(0, limit);

  return stays;
}

async function main() {
  const MAX_RESULTS = 10;
  console.log("🔄 Starting stays ingestion for Kuala Kubu Bharu…");

  let externalStays: ExternalStay[] = [];
  try {
    externalStays = await fetchExternalStays(MAX_RESULTS);
  } catch (err) {
    console.error("❌ Failed to fetch external stays:", err);
    console.log(
      JSON.stringify(
        {
          fetched: 0,
          created: 0,
          updated: 0,
          failed: MAX_RESULTS,
          error:
            err instanceof Error ? err.message : "Unknown fetch error",
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  if (!externalStays.length) {
    console.error("❌ No stays returned from external source.");
    console.log(
      JSON.stringify(
        {
          fetched: 0,
          created: 0,
          updated: 0,
          failed: 0,
          error: "No stays fetched from external source.",
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const item of externalStays) {
    try {
      const slug = slugify(item.name);
      const thumbnail =
        item.thumbnailUrl && item.thumbnailUrl.startsWith("http")
          ? item.thumbnailUrl
          : "/images/stays/placeholder.jpg";

      const galleryImages =
        thumbnail && thumbnail !== "/images/stays/placeholder.jpg"
          ? [thumbnail]
          : [];

      const stay = await prisma.stay.upsert({
        where: { slug },
        update: {
          title: item.name,
          description: item.address || item.locationName || item.name,
          shortDescription:
            item.locationName || "Stay in Kuala Kubu Bharu",
          image: thumbnail,
          gallery: JSON.stringify(galleryImages),
          location: item.locationName || "Kuala Kubu Bharu, Selangor",
          lat: item.lat ?? null,
          lng: item.lng ?? null,
          coordinates:
            typeof item.lat === "number" && typeof item.lng === "number"
              ? JSON.stringify({ lat: item.lat, lng: item.lng })
              : null,
          pricePerNight: item.priceFrom ?? 0,
          type: "HOTEL",
          amenities: "",
          maxGuests: 2,
          rooms: 1,
          status: "PUBLISHED",
          sourceType: "SCRAPED",
          priceFrom: item.priceFrom ?? null,
          currency: item.currency || "MYR",
          rating: item.rating ?? 0,
        },
        create: {
          title: item.name,
          slug,
          description: item.address || item.locationName || item.name,
          shortDescription:
            item.locationName || "Stay in Kuala Kubu Bharu",
          longDescription: null,
          image: thumbnail,
          gallery: JSON.stringify(galleryImages),
          location: item.locationName || "Kuala Kubu Bharu, Selangor",
          lat: item.lat ?? null,
          lng: item.lng ?? null,
          coordinates:
            typeof item.lat === "number" && typeof item.lng === "number"
              ? JSON.stringify({ lat: item.lat, lng: item.lng })
              : null,
          pricePerNight: item.priceFrom ?? 0,
          type: "HOTEL",
          amenities: "",
          maxGuests: 2,
          rooms: 1,
          operatorId: null,
          status: "PUBLISHED",
          sourceType: "SCRAPED",
          externalPlaceId: item.id ?? null,
          rankingScore: 0,
          rating: item.rating ?? 0,
          reviewCount: 0,
          priceFrom: item.priceFrom ?? null,
          currency: item.currency || "MYR",
          isFeatured: false,
          affiliateMatchName: null,
          affiliateProvider: null,
          affiliateDeepLink: null,
          autoMatchEnabled: true,
          experienceTags: null,
        },
      });

      if (stay.createdAt.getTime() === stay.updatedAt.getTime()) {
        created += 1;
        console.log(`✅ Created stay: ${item.name} (${slug})`);
      } else {
        updated += 1;
        console.log(`🔁 Updated stay: ${item.name} (${slug})`);
      }
    } catch (err) {
      failed += 1;
      console.error(`❌ Failed to upsert stay: ${item.name}`, err);
    }
  }

  const report = {
    fetched: externalStays.length,
    created,
    updated,
    failed,
  };

  console.log("📊 Ingestion report:");
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((err) => {
    console.error("❌ Ingestion task failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Google Places Stays/Accommodations Ingestion Script
 * 
 * This script fetches accommodation places (hotels, homestays, lodging) in KKB
 * from Google Places API and stores them in ScrapedItem table for admin review.
 * 
 * Usage:
 *   npx tsx scripts/ingest-stays-from-places.ts
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

// KKB coordinates
const KKB_CENTER = {
    lat: 3.5728,
    lng: 101.6411,
};

const SEARCH_RADIUS = 10000; // 10km radius (wider for stays)

// Place types to search for accommodations
const STAY_TYPES = [
    'lodging',
    'hotel',
    'campground',
];

interface GooglePlace {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    opening_hours?: {
        open_now?: boolean;
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    business_status?: string;
}

/**
 * Fetch places from Google Places Nearby Search API
 */
async function fetchNearbyPlaces(type: string): Promise<GooglePlace[]> {
    if (!GOOGLE_PLACES_API_KEY) {
        throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY is not set in environment variables');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${KKB_CENTER.lat},${KKB_CENTER.lng}`);
    url.searchParams.append('radius', SEARCH_RADIUS.toString());
    url.searchParams.append('type', type);
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

    console.log(`Fetching places for type: ${type}...`);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data.results || [];
}

/**
 * Convert price_level (0-4) to estimated price per night
 */
function estimatePricePerNight(priceLevel?: number): number {
    if (!priceLevel || priceLevel === 0) return 80; // Budget
    if (priceLevel === 1) return 120;
    if (priceLevel === 2) return 200;
    if (priceLevel === 3) return 350;
    return 500; // Luxury
}

/**
 * Determine stay type from Google Place types and name
 */
function getStayType(types: string[], name: string): string {
    const nameLower = name.toLowerCase();

    if (types.includes('campground') || nameLower.includes('camp')) return 'CAMPING';
    if (nameLower.includes('homestay')) return 'HOMESTAY';
    if (nameLower.includes('chalet')) return 'CHALET';
    if (nameLower.includes('resort')) return 'RESORT';
    if (nameLower.includes('hostel')) return 'HOSTEL';
    if (types.includes('hotel')) return 'HOTEL';

    return 'HOTEL'; // Default
}

/**
 * Main ingestion function
 */
async function ingestStaysFromGooglePlaces() {
    console.log('=== Google Places Stays/Accommodation Ingestion ===\n');

    // 1. Find or create ScrapedSource
    let source = await prisma.scrapedSource.findFirst({
        where: {
            name: 'Google Places - Stays',
            type: 'STAY',
        },
    });

    if (!source) {
        console.log('Creating new ScrapedSource for Google Places Stays...');
        source = await prisma.scrapedSource.create({
            data: {
                name: 'Google Places - Stays',
                type: 'STAY',
                baseUrl: 'https://maps.googleapis.com/maps/api/place',
                active: true,
                notes: 'Accommodation places in KKB sourced from Google Places API',
            },
        });
        console.log(`✓ Created ScrapedSource: ${source.id}\n`);
    } else {
        console.log(`✓ Using existing ScrapedSource: ${source.id}\n`);
    }

    // 2. Fetch places from Google Places API
    const allPlaces: GooglePlace[] = [];

    for (const type of STAY_TYPES) {
        try {
            const places = await fetchNearbyPlaces(type);
            console.log(`  Found ${places.length} places for type "${type}"`);
            allPlaces.push(...places);

            // Rate limiting: wait 200ms between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`  Error fetching type "${type}":`, error);
        }
    }

    // Remove duplicates by place_id
    const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.place_id, place])).values()
    );

    console.log(`\n✓ Total unique places found: ${uniquePlaces.length}\n`);

    // 3. Store each place as ScrapedItem
    let createdCount = 0;
    let skippedCount = 0;

    for (const place of uniquePlaces) {
        try {
            // Check if already exists
            const existing = await prisma.scrapedItem.findFirst({
                where: {
                    sourceId: source.id,
                    externalId: place.place_id,
                },
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Prepare metadata
            const metaJson = {
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                priceLevel: place.price_level || 1,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                address: place.vicinity,
                types: place.types,
                businessStatus: place.business_status,
                photos: place.photos?.slice(0, 5) || [], // Limit to 5 photos

                // Suggested mapping values
                suggestedType: getStayType(place.types, place.name),
                suggestedPricePerNight: estimatePricePerNight(place.price_level),
                suggestedMaxGuests: 2, // Default, admin can update
            };

            // Create ScrapedItem
            await prisma.scrapedItem.create({
                data: {
                    sourceId: source.id,
                    category: 'STAY',
                    externalId: place.place_id,
                    externalUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                    title: place.name,
                    rawContent: JSON.stringify(place),
                    metaJson: JSON.stringify(metaJson),
                    targetModel: 'Stay',
                    status: 'NEW',
                },
            });

            createdCount++;
            console.log(`  ✓ Imported: ${place.name} (${place.rating || 'N/A'}★)`);
        } catch (error) {
            console.error(`  ✗ Error importing "${place.name}":`, error);
        }
    }

    console.log('\n=== Ingestion Summary ===');
    console.log(`Total places found: ${uniquePlaces.length}`);
    console.log(`New items created: ${createdCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log('\n✓ Stays ingestion complete!');
    console.log('→ Check admin dashboard to review and import these items.\n');
}

// Run the script
ingestStaysFromGooglePlaces()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
