import { NextRequest, NextResponse } from "next/server";
import { getOverviewSummary } from "@/lib/overview";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const data = await getOverviewSummary();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error in overview summary:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load overview summary", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


