import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/lib/overview-cache";
import { syncStaysFromGoogle } from "@/../scripts/sync-stays-from-google";
import { syncDiningFromPlaces } from "@/lib/sync/dining-sync";
import { syncActivitiesFromProviders } from "@/lib/sync/activities-sync";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const action = body?.action;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing action" },
        { status: 400 }
      );
    }

    if (action === "triggerSync") {
      const type = body?.type as "stays" | "dining" | "activities";
      if (!type) {
        return NextResponse.json(
          { success: false, error: "Missing sync type" },
          { status: 400 }
        );
      }
      let result: unknown = null;
      if (type === "stays") {
        result = await syncStaysFromGoogle();
      } else if (type === "dining") {
        result = await syncDiningFromPlaces({ dryRun: false, triggeredBy: "MANUAL" });
      } else if (type === "activities") {
        result = await syncActivitiesFromProviders({ dryRun: false, triggeredBy: "MANUAL" });
      }
      invalidateCache("overview:");
      return NextResponse.json({
        success: true,
        message: `Sync ${type} completed`,
        data: result,
      });
    }

    if (action === "refreshCache") {
      invalidateCache("overview:");
      return NextResponse.json({
        success: true,
        message: "Overview cache cleared",
      });
    }

    if (action === "runReindex") {
      // Placeholder: in future, trigger search index rebuild
      return NextResponse.json({
        success: true,
        message: "Reindex triggered (placeholder)",
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error in quick-action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to perform quick action", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


