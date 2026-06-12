import { NextRequest, NextResponse } from "next/server";
import { getActivityPopularity } from "@/lib/overview";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range");
    const rangeDays = rangeParam ? parseInt(rangeParam, 10) || 30 : 30;
    const data = await getActivityPopularity(rangeDays);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error in activity popularity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load activity popularity", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


