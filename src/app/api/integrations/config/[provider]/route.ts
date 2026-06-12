import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{ provider: string }>;
}

// GET /api/integrations/config/[provider] - Get single integration
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { provider } = await params;

    const integration = await prisma.integrationConfig.findUnique({
      where: { provider },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: integration,
    });
  } catch (error) {
    console.error("Error fetching integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integration" },
      { status: 500 }
    );
  }
}

// PUT /api/integrations/config/[provider] - Update integration
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { provider } = await params;
    const body = await request.json();

    const integration = await prisma.integrationConfig.findUnique({
      where: { provider },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: "Integration not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.integrationConfig.update({
      where: { provider },
      data: {
        displayName: body.displayName ?? integration.displayName,
        isActive: body.isActive ?? integration.isActive,
        apiKey: body.apiKey ?? integration.apiKey,
        apiKeySource: body.apiKeySource ?? integration.apiKeySource,
        clientId: body.clientId ?? integration.clientId,
        clientSecret: body.clientSecret ?? integration.clientSecret,
        affiliateId: body.affiliateId ?? integration.affiliateId,
        accessToken: body.accessToken ?? integration.accessToken,
        refreshToken: body.refreshToken ?? integration.refreshToken,
        tokenExpiresAt: body.tokenExpiresAt ?? integration.tokenExpiresAt,
        baseUrl: body.baseUrl ?? integration.baseUrl,
        deepLinkPattern: body.deepLinkPattern ?? integration.deepLinkPattern,
        webhookUrl: body.webhookUrl ?? integration.webhookUrl,
        configJson:
          body.configJson !== undefined
            ? typeof body.configJson === "string"
              ? body.configJson
              : JSON.stringify(body.configJson)
            : integration.configJson,
        description: body.description ?? integration.description,
        logoUrl: body.logoUrl ?? integration.logoUrl,
        websiteUrl: body.websiteUrl ?? integration.websiteUrl,
        documentationUrl: body.documentationUrl ?? integration.documentationUrl,
        usedBy:
          body.usedBy !== undefined
            ? typeof body.usedBy === "string"
              ? body.usedBy
              : JSON.stringify(body.usedBy)
            : integration.usedBy,
        priority: body.priority ?? integration.priority,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Integration updated successfully",
    });
  } catch (error) {
    console.error("Error updating integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update integration" },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/config/[provider] - Delete integration
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { provider } = await params;

    await prisma.integrationConfig.delete({
      where: { provider },
    });

    return NextResponse.json({
      success: true,
      message: "Integration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete integration" },
      { status: 500 }
    );
  }
}

