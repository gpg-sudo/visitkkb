import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  age: z.string(),
  emergencyContact: z.string(),
});

const guestCartItemSchema = z.object({
  activityId: z.string(),
  activityTitle: z.string(),
  activitySlug: z.string(),
  date: z.string(),
  participants: z.array(participantSchema),
  operatorId: z.string(),
  operatorName: z.string(),
  pricePerPerson: z.number(),
  insurance: z.boolean(),
  insuranceCost: z.number(),
  totalPrice: z.number(),
});

const guestCartSchema = z.object({
  guestCartItems: z.array(guestCartItemSchema),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Authorization header is missing" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "").trim();
    let parsedToken;

    try {
      parsedToken = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session || session.userId !== parsedToken.userId) {
      return NextResponse.json(
        { success: false, error: "Session not found or expired" },
        { status: 401 },
      );
    }

    const payload = guestCartSchema.parse(await request.json());

    if (payload.guestCartItems.length === 0) {
      return NextResponse.json({ success: true, createdCount: 0 });
    }

    const createdItems = await prisma.$transaction(
      payload.guestCartItems.map((item) =>
        prisma.cartItem.create({
          data: {
            userId: session.userId,
            itemType: "ACTIVITY",
            activityId: item.activityId,
            date: new Date(item.date),
            participants: item.participants.length,
            pricePerUnit: item.pricePerPerson,
            totalPrice: item.totalPrice,
            addOns: JSON.stringify({
              participants: item.participants,
              insurance: item.insurance,
              insuranceCost: item.insuranceCost,
              operatorName: item.operatorName,
              activityTitle: item.activityTitle,
              activitySlug: item.activitySlug,
            }),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      createdCount: createdItems.length,
    });
  } catch (error) {
    console.error("Cart sync failed:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid payload", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to sync cart" },
      { status: 500 },
    );
  }
}

