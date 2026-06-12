/**
 * Admin API: View Sync Logs
 * 
 * GET /api/admin/sync/logs
 * View history of all sync jobs
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type"); // STAY, DINING, ACTIVITY, INTEGRATION_HEALTH
    const provider = searchParams.get("provider");
    const status = searchParams.get("status"); // IN_PROGRESS, SUCCESS, PARTIAL, FAILED

    // Build filter
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (provider) where.provider = provider;
    if (status) where.status = status;

    // Get total count
    const total = await prisma.syncLog.count({ where });

    // Get logs
    const logs = await prisma.syncLog.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
    });

    // Get summary stats
    const stats = await prisma.syncLog.groupBy({
      by: ["status"],
      _count: true,
      where: {
        startedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + logs.length < total,
        },
        stats: {
          last7Days: stats.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
        },
      },
    });
  } catch (error) {
    console.error("Get sync logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sync logs" },
      { status: 500 }
    );
  }
}

// Delete old sync logs (cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const daysToKeep = body.daysToKeep || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.syncLog.deleteMany({
      where: {
        startedAt: {
          lt: cutoffDate,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.count,
        daysKept: daysToKeep,
      },
      message: `Deleted ${result.count} sync logs older than ${daysToKeep} days`,
    });
  } catch (error) {
    console.error("Delete sync logs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete sync logs" },
      { status: 500 }
    );
  }
}

