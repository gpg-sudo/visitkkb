/**
 * Stays sync worker
 * 
 * Pulls accommodation data from Google Places and syncs to our DB.
 * Runs on a schedule (see cron config) or can be triggered manually from dashboard.
 * 
 * NOTE: We preserve manual edits during sync - don't want to overwrite 
 * descriptions/affiliate links that admins have customized.
 */

import prisma from '@/lib/prisma';
import { SyncResult, ExternalStayData } from "./types";
import { createSyncLog, completeSyncLog } from './sync-logger';
import { PRESERVED_FIELDS } from '@/config/sync';

// Fields we don't touch during sync (manually curated data)
const PROTECTED_FIELDS: string[] = [
  ...PRESERVED_FIELDS.common,
  ...PRESERVED_FIELDS.stays,
];

// Main sync function - called by cron or manually from dashboard
export async function syncStaysFromPlaces(options: {
  triggeredBy?: 'CRON' | 'MANUAL' | 'WEBHOOK';
  triggeredById?: string;
  dryRun?: boolean;
}): Promise<SyncResult> {
  const startTime = Date.now();
  const provider = 'GOOGLE_PLACES';

  // log this sync attempt
  const syncLog = await createSyncLog({
    provider,
    type: 'STAY',
    triggeredBy: options.triggeredBy || 'CRON',
    triggeredById: options.triggeredById,
  });

  const result: SyncResult = {
    success: false,
    provider,
    type: 'STAY',
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    summary: '',
    duration: 0,
  };

  try {
    // check if this integration is even enabled
    const integration = await prisma.integrationConfig.findUnique({
      where: { provider: 'GOOGLE_PLACES_STAYS' },
    });

    if (!integration?.isActive) {
      result.summary = 'Google Places Stays integration is not active';
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }

    // fetch from Google Places
    const externalStays = await fetchStaysFromGooglePlaces();

    // dry run mode - just report what we'd do
    if (options.dryRun) {
      result.success = true;
      result.summary = `Dry run: Would process ${externalStays.length} stays`;
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }

    // process each stay
    for (const stay of externalStays) {
      try {
        const { created, updated } = await processStay(stay);
        if (created) result.createdCount++;
        else if (updated) result.updatedCount++;
        else result.skippedCount++;
      } catch (error) {
        result.failedCount++;
        console.error(`Failed to process stay ${stay.name}:`, error);
      }
    }

    // update integration status
    await prisma.integrationConfig.update({
      where: { provider: 'GOOGLE_PLACES_STAYS' },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: 'SUCCESS',
        recordsSynced: result.createdCount + result.updatedCount,
        lastStatus: 'OK',
        lastCheckedAt: new Date(),
      },
    });

    result.success = true;
    result.summary = `Synced ${result.createdCount + result.updatedCount} stays (${result.createdCount} created, ${result.updatedCount} updated, ${result.skippedCount} skipped, ${result.failedCount} failed)`;

  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errorDetails = JSON.stringify(error);
    result.summary = `Sync failed: ${result.errorMessage}`;

    // mark integration as errored
    await prisma.integrationConfig.update({
      where: { provider: 'GOOGLE_PLACES_STAYS' },
      data: {
        lastStatus: 'ERROR',
        lastErrorMessage: result.errorMessage,
        lastCheckedAt: new Date(),
      },
    }).catch(() => { }); // swallow errors here - we're already in error state
  }

  result.duration = Date.now() - startTime;
  await completeSyncLog(syncLog.id, result);

  return result;
}

/**
 * Fetch stays from Google Places API
 * In production, this would make actual API calls
 */
async function fetchStaysFromGooglePlaces(): Promise<ExternalStayData[]> {
  // STUB: In production, this would call Google Places API
  // For now, return simulated data

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("GOOGLE_MAPS_API_KEY not set, using simulated data");
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return simulated data for development
  // In production, replace with actual API call:
  // const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${config.location.lat},${config.location.lng}&radius=${config.location.radius}&type=lodging&key=${apiKey}`;

  return [
    {
      externalId: "ChIJ_sim_hotel_001",
      name: "KKB Riverside Resort",
      description: "Beautiful resort by the river",
      rating: 4.2,
      reviewCount: 156,
      priceFrom: 250,
      lat: 3.5728,
      lng: 101.6411,
      address: "Jalan Sungai, Kuala Kubu Bharu",
      type: "RESORT",
      amenities: ["Pool", "Restaurant", "Wifi", "Parking"],
      images: ["/images/stays/resort-1.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
    {
      externalId: "ChIJ_sim_hotel_002",
      name: "Mountain View Chalet",
      description: "Cozy chalet with mountain views",
      rating: 4.5,
      reviewCount: 89,
      priceFrom: 180,
      lat: 3.5750,
      lng: 101.6430,
      address: "Bukit Kutu Road, Kuala Kubu Bharu",
      type: "CHALET",
      amenities: ["BBQ", "Garden", "Wifi"],
      images: ["/images/stays/chalet-1.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
  ];
}

/**
 * Process a single stay record
 */
async function processStay(externalStay: ExternalStayData): Promise<{ created: boolean; updated: boolean }> {
  // Check if already exists
  const existing = await prisma.stay.findFirst({
    where: {
      OR: [
        { externalPlaceId: externalStay.externalId },
        {
          title: externalStay.name,
          sourceType: externalStay.sourceType,
        },
      ],
    },
  });

  const slug = generateSlug(externalStay.name);

  // Build data object, preserving manual fields
  const data = {
    title: externalStay.name,
    slug,
    externalPlaceId: externalStay.externalId,
    sourceType: externalStay.sourceType,
    // Only update these fields from external source
    rating: externalStay.rating || 0,
    reviewCount: externalStay.reviewCount || 0,
    priceFrom: externalStay.priceFrom,
    lat: externalStay.lat,
    lng: externalStay.lng,
    location: externalStay.address || "Kuala Kubu Bharu",
    coordinates: externalStay.lat && externalStay.lng
      ? JSON.stringify({ lat: externalStay.lat, lng: externalStay.lng })
      : null,
    type: externalStay.type || "HOTEL",
    amenities: externalStay.amenities?.join(",") || "",
    image: externalStay.images?.[0] || "/images/stays/default.jpg",
    gallery: JSON.stringify(externalStay.images || []),
  };

  if (existing) {
    // update existing, but don't clobber manual edits
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      // skip fields that admins have manually customized
      if (PROTECTED_FIELDS.includes(key)) {
        const existingValue = existing[key as keyof typeof existing];
        if (existingValue && existing.sourceType === 'MANUAL') {
          continue; // preserve manual data
        }
      }
      updateData[key] = value;
    }

    await prisma.stay.update({
      where: { id: existing.id },
      data: updateData,
    });

    return { created: false, updated: true };
  } else {
    // Create new record
    await prisma.stay.create({
      data: {
        ...data,
        description: externalStay.description || `${externalStay.name} - Accommodation in Kuala Kubu Bharu`,
        pricePerNight: externalStay.priceFrom || 150,
        maxGuests: 4,
        rooms: 1,
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

