/**
 * Cron Endpoint: Cleanup Tasks
 * 
 * Called by Vercel Cron or external scheduler
 * Schedule: Daily at 3:00 AM
 * 
 * Tasks:
 * - Clean expired cart items
 * - Clean old sync logs
 */

import { NextRequest, NextResponse } from "next/server";
import { cleanExpiredCartItems } from "@/lib/sync";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const cronSecret = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret !== expectedSecret) {
    const vercelSignature = request.headers.get("x-vercel-cron-signature");
    if (!vercelSignature) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const results = {
      expiredCarts: 0,
      oldSyncLogs: 0,
      oldUserLogs: 0,
    };

    // Clean expired cart items
    const cartResult = await cleanExpiredCartItems();
    results.expiredCarts = cartResult.deleted;

    // Clean sync logs older than 30 days
    const syncLogCutoff = new Date();
    syncLogCutoff.setDate(syncLogCutoff.getDate() - 30);
    
    const syncLogResult = await prisma.syncLog.deleteMany({
      where: {
        startedAt: { lt: syncLogCutoff },
      },
    });
    results.oldSyncLogs = syncLogResult.count;

    // Clean user logs older than 90 days
    const userLogCutoff = new Date();
    userLogCutoff.setDate(userLogCutoff.getDate() - 90);
    
    const userLogResult = await prisma.userLog.deleteMany({
      where: {
        createdAt: { lt: userLogCutoff },
      },
    });
    results.oldUserLogs = userLogResult.count;

    return NextResponse.json({
      success: true,
      summary: `Cleaned: ${results.expiredCarts} carts, ${results.oldSyncLogs} sync logs, ${results.oldUserLogs} user logs`,
      stats: results,
    });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    );
  }
}

