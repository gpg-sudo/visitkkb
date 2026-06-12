/**
 * Cron Endpoint: Sync Dining
 * 
 * Called by Vercel Cron or external scheduler
 * Schedule: Every 2 days at 2:30 AM
 */

import { NextRequest, NextResponse } from "next/server";
import { syncDiningFromPlaces } from "@/lib/sync";

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
    const result = await syncDiningFromPlaces({
      triggeredBy: "CRON",
    });

    return NextResponse.json({
      success: result.success,
      summary: result.summary,
      stats: {
        created: result.createdCount,
        updated: result.updatedCount,
        failed: result.failedCount,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("Cron sync-dining error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}

