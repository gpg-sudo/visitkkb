import { NextRequest, NextResponse } from "next/server";
import { getBookingsTrend } from "@/lib/overview";

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
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const now = new Date();
    const to = toParam ? new Date(toParam) : now;
    const from = fromParam
      ? new Date(fromParam)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const data = await getBookingsTrend(from, to);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error in bookings trend:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load bookings trend", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


