/**
 * Cron Endpoint: Integrations Health Check
 * 
 * Called by Vercel Cron or external scheduler
 * Schedule: Every 6 hours
 */

import { NextRequest, NextResponse } from "next/server";
import { checkIntegrationsHealth } from "@/lib/sync";

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
    const result = await checkIntegrationsHealth({
      triggeredBy: "CRON",
    });

    return NextResponse.json({
      success: result.success,
      summary: result.summary,
      stats: {
        checked: result.updatedCount,
        failed: result.failedCount,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error("Cron health-check error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed" },
      { status: 500 }
    );
  }
}

