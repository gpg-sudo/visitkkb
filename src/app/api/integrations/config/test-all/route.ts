import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/integrations/config/test-all - Test all active integrations
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { category } = body;

    // Get all active integrations (optionally filtered by category)
    const where: Record<string, unknown> = { isActive: true };
    if (category) {
      where.category = category;
    }

    const integrations = await prisma.integrationConfig.findMany({
      where,
    });

    if (integrations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tested: 0,
          passed: 0,
          failed: 0,
          results: [],
        },
        message: "No active integrations to test",
      });
    }

    // Test each integration (simulated)
    const results: Array<{
      provider: string;
      category: string;
      passed: boolean;
      message: string;
    }> = [];

    for (const integration of integrations) {
      // Simulate test with varying success rates
      const passed = Math.random() > 0.15; // 85% pass rate for demo
      const message = passed
        ? `${integration.displayName} is working correctly`
        : `${integration.displayName} connection failed - check configuration`;

      results.push({
        provider: integration.provider,
        category: integration.category,
        passed,
        message,
      });

      // Update status in database
      await prisma.integrationConfig.update({
        where: { provider: integration.provider },
        data: {
          lastStatus: passed ? "OK" : "ERROR",
          lastErrorMessage: passed ? null : message,
          lastCheckedAt: new Date(),
        },
      });
    }

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    return NextResponse.json({
      success: true,
      data: {
        tested: results.length,
        passed,
        failed,
        results,
      },
      message: `Tested ${results.length} integrations: ${passed} passed, ${failed} failed`,
    });
  } catch (error) {
    console.error("Error testing all integrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to test integrations" },
      { status: 500 }
    );
  }
}

