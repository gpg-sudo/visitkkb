import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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

// Simulated connection test
function simulateConnectionTest(program: {
  code: string;
  affiliateId: string | null;
  baseUrl: string | null;
  active: boolean;
}) {
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

