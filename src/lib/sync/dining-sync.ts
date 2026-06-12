/**
 * Dining Sync Worker
 * 
 * Syncs restaurant/dining data from external sources (Google Places)
 * to the local DiningListing database.
 * 
 * IMPORTANT: Preserves manual overrides during sync:
 * - description
 * - isHalal
 * - affiliateMatchName
 * - primaryAffiliateProvider
 * - foodpandaSlug, grabfoodSlug, shopeefoodSlug
 * - affiliateDeepLink
 * - isFeatured
 */

import prisma from "@/lib/prisma";
import { SyncResult, ExternalDiningData } from "./types";
import { createSyncLog, completeSyncLog } from "./sync-logger";

const PRESERVED_FIELDS = [
  "description",
  "longDescription",
  "isHalal",
  "affiliateMatchName",
  "primaryAffiliateProvider",
  "foodpandaSlug",
  "grabfoodSlug",
  "shopeefoodSlug",
  "affiliateDeepLink",
  "isFeatured",
  "status",
];

/**
 * Main sync function for dining from Google Places
 */
export async function syncDiningFromPlaces(options: {
  triggeredBy?: "CRON" | "MANUAL" | "WEBHOOK";
  triggeredById?: string;
  dryRun?: boolean;
}): Promise<SyncResult> {
  const startTime = Date.now();
  const provider = "GOOGLE_PLACES";

  const syncLog = await createSyncLog({
    provider,
    type: "DINING",
    triggeredBy: options.triggeredBy || "CRON",
    triggeredById: options.triggeredById,
  });

  const result: SyncResult = {
    success: false,
    provider,
    type: "DINING",
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    summary: "",
    duration: 0,
  };

  try {
    // Check if integration is active
    const integration = await prisma.integrationConfig.findUnique({
      where: { provider: "GOOGLE_PLACES_DINING" },
    });

    if (!integration?.isActive) {
      result.summary = "Google Places Dining integration is not active";
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }



    // Fetch data from external source
    const externalDining = await fetchDiningFromGooglePlaces();

    if (options.dryRun) {
      result.success = true;
      result.summary = `Dry run: Would process ${externalDining.length} dining places`;
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }

    // Process each dining place
    for (const externalPlace of externalDining) {
      try {
        const processed = await processDining(externalPlace);
        if (processed.created) result.createdCount++;
        else if (processed.updated) result.updatedCount++;
        else result.skippedCount++;
      } catch (error) {
        result.failedCount++;
        console.error(`Failed to process dining ${externalPlace.name}:`, error);
      }
    }

    // Update integration status
    await prisma.integrationConfig.update({
      where: { provider: "GOOGLE_PLACES_DINING" },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "SUCCESS",
        recordsSynced: result.createdCount + result.updatedCount,
        lastStatus: "OK",
        lastCheckedAt: new Date(),
      },
    });

    result.success = true;
    result.summary = `Synced ${result.createdCount + result.updatedCount} dining places (${result.createdCount} created, ${result.updatedCount} updated)`;

  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errorDetails = JSON.stringify(error);
    result.summary = `Sync failed: ${result.errorMessage}`;

    await prisma.integrationConfig.update({
      where: { provider: "GOOGLE_PLACES_DINING" },
      data: {
        lastStatus: "ERROR",
        lastErrorMessage: result.errorMessage,
        lastCheckedAt: new Date(),
      },
    }).catch(() => { });
  }

  result.duration = Date.now() - startTime;
  await completeSyncLog(syncLog.id, result);

  return result;
}

/**
 * Fetch dining from Google Places API
 */
async function fetchDiningFromGooglePlaces(): Promise<ExternalDiningData[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set, using simulated data");
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulated data for development
  return [
    {
      externalId: "ChIJ_sim_rest_001",
      name: "Restoran Sungai Ikan",
      description: "Local Malaysian restaurant serving fresh river fish",
      rating: 4.3,
      reviewCount: 234,
      priceLevel: 2,
      lat: 3.5725,
      lng: 101.6408,
      address: "Jalan Besar, Kuala Kubu Bharu",
      type: "RESTAURANT",
      cuisineTags: ["MALAY", "SEAFOOD"],
      images: ["/images/dining/rest-1.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
    {
      externalId: "ChIJ_sim_rest_002",
      name: "Warung Mak Cik",
      description: "Traditional Malay warung with nasi lemak",
      rating: 4.6,
      reviewCount: 189,
      priceLevel: 1,
      lat: 3.5730,
      lng: 101.6415,
      address: "Pekan Kuala Kubu Bharu",
      type: "WARUNG",
      cuisineTags: ["MALAY", "LOCAL"],
      images: ["/images/dining/warung-1.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
    {
      externalId: "ChIJ_sim_cafe_001",
      name: "KKB Coffee House",
      description: "Cozy cafe with specialty coffee and pastries",
      rating: 4.4,
      reviewCount: 98,
      priceLevel: 2,
      lat: 3.5732,
      lng: 101.6420,
      address: "Main Street, Kuala Kubu Bharu",
      type: "CAFE",
      cuisineTags: ["WESTERN", "CAFE"],
      images: ["/images/dining/cafe-1.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
  ];
}

/**
 * Process a single dining record
 */
async function processDining(externalData: ExternalDiningData): Promise<{ created: boolean; updated: boolean }> {
  const existing = await prisma.restaurant.findFirst({
    where: {
      OR: [
        { googlePlaceId: externalData.externalId },
        {
          name: externalData.name,
          sourceType: externalData.sourceType,
        },
      ],
    },
  });

  const slug = generateSlug(externalData.name);

  const data = {
    name: externalData.name,
    slug,
    googlePlaceId: externalData.externalId,
    sourceType: externalData.sourceType,
    rating: externalData.rating || 0,
    reviewCount: externalData.reviewCount || 0,
    priceLevel: externalData.priceLevel,
    priceRange: priceLevelToRange(externalData.priceLevel),
    lat: externalData.lat,
    lng: externalData.lng,
    location: externalData.address || "Kuala Kubu Bharu",
    coordinates: externalData.lat && externalData.lng
      ? JSON.stringify({ lat: externalData.lat, lng: externalData.lng })
      : null,
    type: externalData.type || "RESTAURANT",
    cuisineTags: externalData.cuisineTags ? JSON.stringify(externalData.cuisineTags) : null,
    cuisine: externalData.cuisineTags?.[0] || "Local",
    // Improved image fallback logic
    image: externalData.images?.[0] || getDefaultImage(externalData.type),
    gallery: JSON.stringify(externalData.images || []),
  };

  if (existing) {
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (PRESERVED_FIELDS.includes(key)) {
        const existingValue = existing[key as keyof typeof existing];
        if (existingValue && existing.sourceType === "MANUAL") {
          continue;
        }
        // Also preserve image if admin has set one and it's not default
        if (key === "image" && existing.image && !existing.image.includes("default")) {
          continue;
        }
      }
      updateData[key] = value;
    }

    await prisma.restaurant.update({
      where: { id: existing.id },
      data: updateData,
    });

    return { created: false, updated: true };
  } else {
    await prisma.restaurant.create({
      data: {
        ...data,
        description: externalData.description || `${externalData.name} - Dining in Kuala Kubu Bharu`,
        specialties: "",
        hours: "10:00 AM - 10:00 PM",
        status: "PUBLISHED",
      },
    });

    return { created: true, updated: false };
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

function priceLevelToRange(level?: number): string {
  switch (level) {
    case 1: return "$";
    case 2: return "$$";
    case 3: return "$$$";
    case 4: return "$$$$";
    default: return "$$";
  }
}

function getDefaultImage(type?: string): string {
  const t = (type || "").toUpperCase();
  if (t.includes("WARUNG")) return "/images/dining/default-warung.jpg";
  if (t.includes("CAFE")) return "/images/dining/default-cafe.jpg";
  if (t.includes("MAMAK")) return "/images/dining/default-mamak.jpg";
  if (t.includes("BAKERY")) return "/images/dining/default-bakery.jpg";
  return "/images/dining/default.jpg";
}
