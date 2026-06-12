import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/integrations/config/sync - Trigger sync for a specific provider
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
    const { provider, dryRun = false } = body;

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider is required" },
        { status: 400 }
      );
    }

    const integration = await prisma.integrationConfig.findUnique({
      where: { provider },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    if (!integration.isActive) {
      return NextResponse.json(
        { success: false, error: "Integration is not active" },
        { status: 400 }
      );
    }

    // Simulate sync operation based on category
    let syncResult: {
      success: boolean;
      message: string;
      recordsCreated?: number;
      recordsUpdated?: number;
    };

    switch (integration.category) {
      case "ACCOMMODATION":
        syncResult = await simulateAccommodationSync(integration, dryRun);
        break;
      case "ACTIVITIES":
        syncResult = await simulateActivitiesSync(integration, dryRun);
        break;
      case "DINING":
        syncResult = await simulateDiningSync(integration, dryRun);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "This integration type does not support sync" },
          { status: 400 }
        );
    }

    // Update sync status in database
    if (!dryRun && syncResult.success) {
      await prisma.integrationConfig.update({
        where: { provider },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: syncResult.success ? "SUCCESS" : "FAILED",
          recordsSynced: (syncResult.recordsCreated || 0) + (syncResult.recordsUpdated || 0),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        provider,
        dryRun,
        ...syncResult,
        syncedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error syncing integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync integration" },
      { status: 500 }
    );
  }
}

// Simulate accommodation sync (Google Places, Booking.com, etc.)
async function simulateAccommodationSync(
  integration: { provider: string; configJson: string | null },
  dryRun: boolean
): Promise<{
  success: boolean;
  message: string;
  recordsCreated?: number;
  recordsUpdated?: number;
}> {
  // Parse config
  let config: Record<string, unknown> = {};
  if (integration.configJson) {
    try {
      config = JSON.parse(integration.configJson);
    } catch {
      return { success: false, message: "Invalid configuration JSON" };
    }
  }

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In production, this would:
  // 1. Call the external API (Google Places, Booking.com, etc.)
  // 2. Parse the response
  // 3. Upsert records into StayListing

  const simulatedRecords = Math.floor(Math.random() * 20) + 5;
  const createdCount = Math.floor(simulatedRecords * 0.3);
  const updatedCount = simulatedRecords - createdCount;

  if (dryRun) {
    return {
      success: true,
      message: `Dry run completed for ${integration.provider}. Would sync ${simulatedRecords} stays from ${config.defaultLocation || "Kuala Kubu Bharu"}.`,
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
    };
  }

  return {
    success: true,
    message: `Synced ${simulatedRecords} accommodation listings from ${integration.provider}`,
    recordsCreated: createdCount,
    recordsUpdated: updatedCount,
  };
}

// Simulate activities sync
async function simulateActivitiesSync(
  integration: { provider: string; configJson: string | null },
  dryRun: boolean
): Promise<{
  success: boolean;
  message: string;
  recordsCreated?: number;
  recordsUpdated?: number;
}> {
  let config: Record<string, unknown> = {};
  if (integration.configJson) {
    try {
      config = JSON.parse(integration.configJson);
    } catch {
      return { success: false, message: "Invalid configuration JSON" };
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const simulatedRecords = Math.floor(Math.random() * 15) + 3;
  const createdCount = Math.floor(simulatedRecords * 0.4);
  const updatedCount = simulatedRecords - createdCount;

  if (dryRun) {
    return {
      success: true,
      message: `Dry run completed for ${integration.provider}. Would sync ${simulatedRecords} activities from ${config.defaultLocation || "Kuala Kubu Bharu"}.`,
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
    };
  }

  return {
    success: true,
    message: `Synced ${simulatedRecords} activities from ${integration.provider}`,
    recordsCreated: createdCount,
    recordsUpdated: updatedCount,
  };
}

// Simulate dining sync
async function simulateDiningSync(
  integration: { provider: string; configJson: string | null },
  dryRun: boolean
): Promise<{
  success: boolean;
  message: string;
  recordsCreated?: number;
  recordsUpdated?: number;
}> {
  let config: Record<string, unknown> = {};
  if (integration.configJson) {
    try {
      config = JSON.parse(integration.configJson);
    } catch {
      return { success: false, message: "Invalid configuration JSON" };
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const simulatedRecords = Math.floor(Math.random() * 25) + 10;
  const createdCount = Math.floor(simulatedRecords * 0.35);
  const updatedCount = simulatedRecords - createdCount;

  if (dryRun) {
    return {
      success: true,
      message: `Dry run completed for ${integration.provider}. Would sync ${simulatedRecords} dining places from ${config.defaultLocation || "Kuala Kubu Bharu"}.`,
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
    };
  }

  return {
    success: true,
    message: `Synced ${simulatedRecords} dining listings from ${integration.provider}`,
    recordsCreated: createdCount,
    recordsUpdated: updatedCount,
  };
}

