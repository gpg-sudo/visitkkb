import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";

// GET /api/settings - Get all settings (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany();

    // Convert array to object for easier frontend consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settingsMap: any = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ success: true, data: settingsMap });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// POST /api/settings - Update settings (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    const updates = [];

    for (const [key, value] of Object.entries(settings)) {
      let category = "GENERAL";
      if (key.includes("API")) category = "API";
      if (key.includes("PAYMENT") || key.includes("STRIPE"))
        category = "PAYMENT";
      if (key.includes("WHATSAPP") || key.includes("MAIL"))
        category = "NOTIFICATION";

      updates.push(
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            category,
            description: `Setting for ${key}`,
          },
        }),
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: "Settings updated" });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
