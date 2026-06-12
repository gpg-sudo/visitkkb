import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import { sendBookingConfirmation } from "@/services/notifications";

// Participant details schema
const participantSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  age: z.string().or(z.number()).optional(),
  emergencyContact: z.string().optional(),
});

const createBookingSchema = z.object({
  bookingType: z.enum(["ACTIVITY", "STAY", "TRIP"]),
  itemId: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  participants: z.number().min(1),
  customerDetails: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  participantDetails: z.array(participantSchema).optional(),
  specialRequests: z.string().optional(),
  paymentMethod: z.string(),
  operatorId: z.string().optional(),
  insurance: z.boolean().optional(),
  totalAmount: z.number().optional(),
});

// Generate confirmation code
function generateConfirmationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VKB-${timestamp}-${random}`;
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Try to verify authentication, but allow guest checkout
    let userId: string | null = null;
    try {
      const user = await verifyToken(request);
      if (user) {
        userId = user.userId;
      }
    } catch {
      // Guest checkout - continue without user
    }

    const body = await request.json();
    const validated = createBookingSchema.parse(body);

    // Get item details and calculate total
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let item: any;
    let totalAmount = validated.totalAmount || 0;

    if (validated.bookingType === "ACTIVITY") {
      item = await prisma.activity.findUnique({
        where: { id: validated.itemId },
        include: { operator: true },
      });

      if (!item) {
        return NextResponse.json(
          { success: false, error: "Activity not found" },
          { status: 404 }
        );
      }

      // Calculate if not provided
      if (!totalAmount) {
        totalAmount = item.pricePerPerson * validated.participants;
      }
    } else if (validated.bookingType === "STAY") {
      item = await prisma.stay.findUnique({
        where: { id: validated.itemId },
        include: { operator: true },
      });

      if (!item) {
        return NextResponse.json(
          { success: false, error: "Stay not found" },
          { status: 404 }
        );
      }

      // Calculate number of nights if not provided
      if (!totalAmount) {
        const start = new Date(validated.startDate);
        const end = new Date(validated.endDate || start);
        const nights = Math.max(1, Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ));
        totalAmount = item.pricePerNight * nights;
      }
    }

    // Check availability
    const availability = await prisma.availability.findFirst({
      where: {
        date: new Date(validated.startDate),
        ...(validated.bookingType === "ACTIVITY"
          ? { activityId: validated.itemId }
          : { stayId: validated.itemId }),
      },
    });

    if (
      availability &&
      (availability.isBlocked || availability.slots < validated.participants)
    ) {
      return NextResponse.json(
        { success: false, error: "Not enough availability for this date" },
        { status: 400 }
      );
    }

    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // For guest users, create or find a guest user account
    let bookingUserId = userId;
    if (!bookingUserId) {
      // Check if a user with this email exists
      let guestUser = await prisma.user.findUnique({
        where: { email: validated.customerDetails.email },
      });

      if (!guestUser) {
        // Create a guest user
        guestUser = await prisma.user.create({
          data: {
            email: validated.customerDetails.email,
            name: validated.customerDetails.name,
            phone: validated.customerDetails.phone,
            password: "", // Empty password for guest accounts
            role: "USER",
          },
        });
      }
      bookingUserId = guestUser.id;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: bookingUserId,
        bookingType: validated.bookingType,
        ...(validated.bookingType === "ACTIVITY"
          ? { activityId: validated.itemId }
          : validated.bookingType === "STAY"
          ? { stayId: validated.itemId }
          : { tripId: validated.itemId }),
        startDate: new Date(validated.startDate),
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        participants: validated.participants,
        totalAmount,
        customerDetails: JSON.stringify(validated.customerDetails),
        specialRequests: validated.specialRequests,
        confirmationCode,
        status: "CONFIRMED", // Auto-confirm for now (no real payment)
        paymentStatus: "PENDING", // Will be updated when payment is processed
      },
      include: {
        activity: true,
        stay: true,
        user: { select: { email: true, name: true } },
      },
    });

    // Save participant details if provided
    if (validated.participantDetails && validated.participantDetails.length > 0) {
      await prisma.bookingParticipant.createMany({
        data: validated.participantDetails.map((p) => ({
          bookingId: booking.id,
          name: p.name,
          email: p.email || null,
          phone: p.phone || null,
          age: p.age ? parseInt(String(p.age)) : null,
          emergencyContact: p.emergencyContact || null,
        })),
      });
    }

    // Update availability (decrement available slots)
    if (availability) {
      await prisma.availability.update({
        where: { id: availability.id },
        data: { slots: { decrement: validated.participants } },
      });
    }

    // Create payment record (mock for now)
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
        currency: "MYR",
        provider: validated.paymentMethod === "card" ? "STRIPE" : "FPX",
        transactionId: `TXN-${confirmationCode}`,
        status: "PENDING",
      },
    });

    // Send confirmation email (if enabled)
    if (process.env.ENABLE_NOTIFICATIONS === "true") {
      try {
        await sendBookingConfirmation(booking);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the booking if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        startDate: booking.startDate,
        participants: booking.participants,
        activity: booking.activity,
        stay: booking.stay,
      },
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("Booking error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid booking data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Booking creation failed" },
      { status: 500 }
    );
  }
}

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.userId,
        ...(status ? { status } : {}),
      },
      include: {
        activity: { select: { title: true, image: true, location: true, slug: true } },
        stay: { select: { title: true, image: true, location: true, slug: true } },
        payment: true,
        participantDetails: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// PUT /api/bookings - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, error: "bookingId and status are required" },
        { status: 400 }
      );
    }

    // Verify user owns this booking or is admin
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== user.userId && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        activity: true,
        stay: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
