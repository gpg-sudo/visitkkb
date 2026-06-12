/**
 * Admin API: Sync Dining
 * 
 * POST /api/admin/sync/dining
 * Triggers a sync of dining/restaurant data from external sources
 */

import { NextRequest, NextResponse } from "next/server";
import { syncDiningFromPlaces } from "@/lib/sync";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const body = await request.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    
    let triggeredById: string | undefined;
    try {
      const session = await prisma.session.findFirst({
        where: { token },
      });
      triggeredById = session?.userId;
    } catch {
      // Continue
    }

    const result = await syncDiningFromPlaces({
      triggeredBy: "MANUAL",
      triggeredById,
      dryRun,
    });

    await prisma.userLog.create({
      data: {
        userId: triggeredById,
        action: "SYNC",
        resource: "Dining",
        status: result.success ? "SUCCESS" : "FAILED",
        errorMessage: result.errorMessage,
        newValue: JSON.stringify({
          provider: result.provider,
          created: result.createdCount,
          updated: result.updatedCount,
          dryRun,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: result.success,
      data: {
        provider: result.provider,
        type: result.type,
        createdCount: result.createdCount,
        updatedCount: result.updatedCount,
        skippedCount: result.skippedCount,
        failedCount: result.failedCount,
        duration: result.duration,
        summary: result.summary,
        dryRun,
      },
      error: result.errorMessage,
    });
  } catch (error) {
    console.error("Dining sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const syncLogs = await prisma.syncLog.findMany({
      where: { type: "DINING" },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    const integration = await prisma.integrationConfig.findUnique({
      where: { provider: "GOOGLE_PLACES_DINING" },
    });

    const diningStats = await prisma.restaurant.groupBy({
      by: ["sourceType"],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        integration: integration ? {
          isActive: integration.isActive,
          lastSyncAt: integration.lastSyncAt,
          lastSyncStatus: integration.lastSyncStatus,
          lastStatus: integration.lastStatus,
          recordsSynced: integration.recordsSynced,
        } : null,
        recentSyncs: syncLogs,
        stats: {
          bySource: diningStats.reduce((acc, item) => {
            acc[item.sourceType] = item._count;
            return acc;
          }, {} as Record<string, number>),
          total: diningStats.reduce((sum, item) => sum + item._count, 0),
        },
      },
    });
  } catch (error) {
    console.error("Get dining sync status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}

