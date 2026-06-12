import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/affiliates/[code] - Get single affiliate program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const program = await prisma.affiliateProgram.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: "Affiliate program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: program,
    });
  } catch (error) {
    console.error("Error fetching affiliate program:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliate program" },
      { status: 500 }
    );
  }
}

// PUT /api/affiliates/[code] - Update affiliate program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await params;
    const body = await request.json();

    const existingProgram = await prisma.affiliateProgram.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { success: false, error: "Affiliate program not found" },
        { status: 404 }
      );
    }

    const program = await prisma.affiliateProgram.update({
      where: { code: code.toUpperCase() },
      data: {
        name: body.name ?? existingProgram.name,
        type: body.type ?? existingProgram.type,
        affiliateId: body.affiliateId !== undefined ? body.affiliateId : existingProgram.affiliateId,
        baseUrl: body.baseUrl !== undefined ? body.baseUrl : existingProgram.baseUrl,
        deepLinkPattern: body.deepLinkPattern !== undefined ? body.deepLinkPattern : existingProgram.deepLinkPattern,
        active: body.active ?? existingProgram.active,
        priority: body.priority ?? existingProgram.priority,
        apiKeyConfigured: body.apiKeyConfigured ?? existingProgram.apiKeyConfigured,
        description: body.description !== undefined ? body.description : existingProgram.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: program,
      message: "Affiliate program updated successfully",
    });
  } catch (error) {
    console.error("Error updating affiliate program:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update affiliate program" },
      { status: 500 }
    );
  }
}

// POST /api/affiliates/[code]/test - Test affiliate connection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await params;
    const url = new URL(request.url);
    const isTest = url.pathname.endsWith("/test");

    if (!isTest) {
      return NextResponse.json(
        { success: false, error: "Invalid endpoint" },
        { status: 400 }
      );
    }

    const program = await prisma.affiliateProgram.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: "Affiliate program not found" },
        { status: 404 }
      );
    }

    // Simulate connection test
    // In production, this would make actual API calls to verify credentials
    const testResult = simulateConnectionTest(program);

    // Update the program with test results
    await prisma.affiliateProgram.update({
      where: { code: code.toUpperCase() },
      data: {
        lastStatus: testResult.status,
        lastErrorMessage: testResult.error || null,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: testResult.status === "OK",
      data: {
        status: testResult.status,
        message: testResult.message,
        error: testResult.error,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error testing affiliate connection:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test connection" },
      { status: 500 }
    );
  }
}

// Simulated connection test - replace with real API calls in production
function simulateConnectionTest(program: {
  code: string;
  affiliateId: string | null;
  baseUrl: string | null;
  active: boolean;
}) {
  // Simulate various test scenarios
  if (!program.active) {
    return {
      status: "DEGRADED",
      message: "Program is disabled",
      error: null,
    };
  }

  if (!program.affiliateId) {
    return {
      status: "ERROR",
      message: "Missing affiliate ID",
      error: "Affiliate ID not configured",
    };
  }

  if (!program.baseUrl) {
    return {
      status: "ERROR",
      message: "Missing base URL",
      error: "Base URL not configured",
    };
  }

  // Simulate 90% success rate for active programs
  if (Math.random() > 0.1) {
    return {
      status: "OK",
      message: `Connection to ${program.code} successful`,
      error: null,
    };
  } else {
    return {
      status: "ERROR",
      message: "Connection timeout",
      error: "API endpoint did not respond within 5 seconds",
    };
  }
}

