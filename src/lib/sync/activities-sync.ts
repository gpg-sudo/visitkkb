/**
 * Activities Sync Worker
 * 
 * Syncs activity/attraction data from external sources
 * (Google Places, TripAdvisor, Viator, etc.) to the local Activity database.
 * 
 * NOTE: Activities are typically more curated, so this sync is mainly
 * for enrichment (ratings, reviews) rather than creating new activities.
 */

import prisma from "@/lib/prisma";
import { SyncResult, ExternalActivityData } from "./types";
import { createSyncLog, completeSyncLog } from "./sync-logger";



/**
 * Main sync function for activities from external providers
 */
export async function syncActivitiesFromProviders(options: {
  provider?: string; // Optional: sync from specific provider
  triggeredBy?: "CRON" | "MANUAL" | "WEBHOOK";
  triggeredById?: string;
  dryRun?: boolean;
  enrichOnly?: boolean; // Only update ratings/reviews, don't create new
}): Promise<SyncResult> {
  const startTime = Date.now();
  const provider = options.provider || "GOOGLE_PLACES";

  const syncLog = await createSyncLog({
    provider,
    type: "ACTIVITY",
    triggeredBy: options.triggeredBy || "CRON",
    triggeredById: options.triggeredById,
  });

  const result: SyncResult = {
    success: false,
    provider,
    type: "ACTIVITY",
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
      where: { provider: "GOOGLE_PLACES_ACTIVITIES" },
    });

    if (!integration?.isActive) {
      result.summary = "Google Places Activities integration is not active";
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }



    // Fetch data from external source
    const externalActivities = await fetchActivitiesFromProvider();

    if (options.dryRun) {
      result.success = true;
      result.summary = `Dry run: Would process ${externalActivities.length} activities`;
      result.duration = Date.now() - startTime;
      await completeSyncLog(syncLog.id, result);
      return result;
    }

    // Process each activity
    for (const externalActivity of externalActivities) {
      try {
        const processed = await processActivity(externalActivity, options.enrichOnly ?? true);
        if (processed.created) result.createdCount++;
        else if (processed.updated) result.updatedCount++;
        else result.skippedCount++;
      } catch (error) {
        result.failedCount++;
        console.error(`Failed to process activity ${externalActivity.title}:`, error);
      }
    }

    // Update integration status
    await prisma.integrationConfig.update({
      where: { provider: "GOOGLE_PLACES_ACTIVITIES" },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: "SUCCESS",
        recordsSynced: result.createdCount + result.updatedCount,
        lastStatus: "OK",
        lastCheckedAt: new Date(),
      },
    });

    result.success = true;
    result.summary = `Synced ${result.createdCount + result.updatedCount} activities (${result.createdCount} created, ${result.updatedCount} updated)`;

  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.errorDetails = JSON.stringify(error);
    result.summary = `Sync failed: ${result.errorMessage}`;

    await prisma.integrationConfig.update({
      where: { provider: "GOOGLE_PLACES_ACTIVITIES" },
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
 * Fetch activities from external provider
 */
async function fetchActivitiesFromProvider(): Promise<ExternalActivityData[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulated data for development
  // In production, switch based on provider (Google Places, TripAdvisor, Viator, etc.)
  return [
    {
      externalId: "ChIJ_sim_act_001",
      title: "Chiling Waterfall Trek",
      description: "Beautiful waterfall hike through jungle",
      rating: 4.7,
      reviewCount: 456,
      price: 50,
      lat: 3.5650,
      lng: 101.6300,
      location: "Chiling, Near Kuala Kubu Bharu",
      category: "hiking",
      images: ["/images/activities/chiling.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
    {
      externalId: "ChIJ_sim_act_002",
      title: "White Water Rafting",
      description: "Thrilling rapids on Sungai Selangor",
      rating: 4.8,
      reviewCount: 789,
      price: 150,
      lat: 3.5700,
      lng: 101.6380,
      location: "Sungai Selangor, Kuala Kubu Bharu",
      category: "water-sports",
      images: ["/images/activities/rafting.jpg"],
      sourceType: "GOOGLE_PLACES",
    },
  ];
}

/**
 * Process a single activity record
 */
async function processActivity(
  externalData: ExternalActivityData,
  enrichOnly: boolean
): Promise<{ created: boolean; updated: boolean }> {
  // Try to match with existing activity
  const existing = await prisma.activity.findFirst({
    where: {
      OR: [
        { title: { contains: externalData.title.split(" ")[0] } }, // Fuzzy match
        { location: { contains: externalData.location?.split(",")[0] || "" } },
      ],
    },
  });

  if (existing) {
    // Update existing with external data (mainly ratings)
    await prisma.activity.update({
      where: { id: existing.id },
      data: {
        // Only update non-preserved fields
        // rating: externalData.rating, // Would need to add rating field
        // Note: Most activity data is curated, so we're conservative about updates
      },
    });

    return { created: false, updated: true };
  } else if (!enrichOnly) {
    // Create new activity (usually not done via sync)
    const slug = generateSlug(externalData.title);

    // Find or create default operator for external activities
    let operator = await prisma.operator.findFirst({
      where: { name: "External Activities" },
    });

    if (!operator) {
      operator = await prisma.operator.create({
        data: {
          name: "External Activities",
          email: "external@visitkkb.com",
          phone: "-",
          description: "Auto-imported activities from external sources",
        },
      });
    }

    await prisma.activity.create({
      data: {
        title: externalData.title,
        slug,
        description: externalData.description || `${externalData.title} in Kuala Kubu Bharu`,
        image: externalData.images?.[0] || "/images/activities/default.jpg",
        gallery: JSON.stringify(externalData.images || []),
        location: externalData.location || "Kuala Kubu Bharu",
        coordinates: externalData.lat && externalData.lng
          ? JSON.stringify({ lat: externalData.lat, lng: externalData.lng })
          : null,
        pricePerPerson: externalData.price || 100,
        difficulty: "moderate",
        duration: "Half day",
        maxParticipants: 20,
        tags: externalData.category || "outdoor",
        operatorId: operator.id,
        status: "ACTIVE",
      },
    });

    return { created: true, updated: false };
  }

  return { created: false, updated: false };
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

