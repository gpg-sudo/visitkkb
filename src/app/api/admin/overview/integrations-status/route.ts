import { NextRequest, NextResponse } from "next/server";
import { getIntegrationsHealth } from "@/lib/integrationStatus";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  try {
    const data = await getIntegrationsHealth();
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error in integrations status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load integrations status", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


