/**
 * Admin API: Check Integrations Health
 * 
 * POST /api/admin/sync/integrations-health
 * Triggers a health check of all active integrations
 */

import { NextRequest, NextResponse } from "next/server";
import { checkIntegrationsHealth, cleanExpiredCartItems } from "@/lib/sync";
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
    const category = body.category; // Optional: check specific category
    
    let triggeredById: string | undefined;
    try {
      const session = await prisma.session.findFirst({
        where: { token },
      });
      triggeredById = session?.userId;
    } catch {
      // Continue
    }

    const result = await checkIntegrationsHealth({
      triggeredBy: "MANUAL",
      triggeredById,
      category,
    });

    await prisma.userLog.create({
      data: {
        userId: triggeredById,
        action: "HEALTH_CHECK",
        resource: "IntegrationConfig",
        status: result.success ? "SUCCESS" : "FAILED",
        errorMessage: result.errorMessage,
        newValue: JSON.stringify({
          checked: result.updatedCount,
          failed: result.failedCount,
          category,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: result.success,
      data: {
        checkedCount: result.updatedCount,
        failedCount: result.failedCount,
        duration: result.duration,
        summary: result.summary,
      },
      error: result.errorMessage,
    });
  } catch (error) {
    console.error("Integrations health check error:", error);
    return NextResponse.json(
      { success: false, error: "Health check failed" },
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

    // Get recent health check logs
    const healthLogs = await prisma.syncLog.findMany({
      where: { type: "INTEGRATION_HEALTH" },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    // Get all integrations with status
    const integrations = await prisma.integrationConfig.findMany({
      where: { isActive: true },
      select: {
        provider: true,
        displayName: true,
        category: true,
        type: true,
        lastStatus: true,
        lastErrorMessage: true,
        lastCheckedAt: true,
      },
      orderBy: [
        { lastStatus: "asc" }, // Errors first
        { lastCheckedAt: "desc" },
      ],
    });

    // Count by status
    const statusCounts = await prisma.integrationConfig.groupBy({
      by: ["lastStatus"],
      where: { isActive: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        recentChecks: healthLogs,
        integrations,
        statusSummary: statusCounts.reduce((acc, item) => {
          acc[item.lastStatus] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Get health status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get health status" },
      { status: 500 }
    );
  }
}

// DELETE: Clean up expired cart items (utility endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await cleanExpiredCartItems();

    return NextResponse.json({
      success: true,
      data: {
        deletedCartItems: result.deleted,
      },
      message: `Cleaned up ${result.deleted} expired cart items`,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    );
  }
}

