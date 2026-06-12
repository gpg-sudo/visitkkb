/**
 * Admin API: Sync Activities
 * 
 * POST /api/admin/sync/activities
 * Triggers a sync of activity data from external sources
 */

import { NextRequest, NextResponse } from "next/server";
import { syncActivitiesFromProviders } from "@/lib/sync";
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
    const enrichOnly = body.enrichOnly !== false; // Default to true
    const provider = body.provider; // Optional specific provider
    
    let triggeredById: string | undefined;
    try {
      const session = await prisma.session.findFirst({
        where: { token },
      });
      triggeredById = session?.userId;
    } catch {
      // Continue
    }

    const result = await syncActivitiesFromProviders({
      provider,
      triggeredBy: "MANUAL",
      triggeredById,
      dryRun,
      enrichOnly,
    });

    await prisma.userLog.create({
      data: {
        userId: triggeredById,
        action: "SYNC",
        resource: "Activity",
        status: result.success ? "SUCCESS" : "FAILED",
        errorMessage: result.errorMessage,
        newValue: JSON.stringify({
          provider: result.provider,
          created: result.createdCount,
          updated: result.updatedCount,
          dryRun,
          enrichOnly,
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
        enrichOnly,
      },
      error: result.errorMessage,
    });
  } catch (error) {
    console.error("Activities sync error:", error);
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
      where: { type: "ACTIVITY" },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    const integration = await prisma.integrationConfig.findUnique({
      where: { provider: "GOOGLE_PLACES_ACTIVITIES" },
    });

    const activityStats = await prisma.activity.groupBy({
      by: ["status"],
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
          byStatus: activityStats.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          total: activityStats.reduce((sum, item) => sum + item._count, 0),
        },
      },
    });
  } catch (error) {
    console.error("Get activities sync status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}

