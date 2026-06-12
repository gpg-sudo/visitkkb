import { NextRequest, NextResponse } from "next/server";
import { verifyToken, requireRole } from "@/lib/auth";
import { whatsappService } from "@/services/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { phone, type, data } = body;

    let success = false;

    if (type === "confirmation") {
      success = await whatsappService.sendDateConfirmation(
        phone,
        data.item,
        data.date,
      );
    } else if (type === "booking") {
      success = await whatsappService.sendBookingConfirmation(phone, data);
    } else {
      success = await whatsappService.sendMessage(phone, data.message);
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp sent successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send WhatsApp" },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
