/**
 * Cron Endpoint: Sync Stays
 * 
 * Called by Vercel Cron or external scheduler
 * Schedule: Daily at 2:00 AM
 */

import { NextRequest, NextResponse } from "next/server";
import { syncStaysFromPlaces } from "@/lib/sync";

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const cronSecret = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret !== expectedSecret) {
    // Also allow Vercel's cron signature
    const vercelSignature = request.headers.get("x-vercel-cron-signature");
    if (!vercelSignature) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    const result = await syncStaysFromPlaces({
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
    console.error("Cron sync-stays error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}

