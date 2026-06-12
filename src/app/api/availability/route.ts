import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export interface AvailabilityData {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  isBlocked: boolean;
}

// GET /api/availability?activityId=xxx&month=2024-01
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId");
    const stayId = searchParams.get("stayId");
    const month = searchParams.get("month"); // Format: YYYY-MM
    const date = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!activityId && !stayId) {
      return NextResponse.json(
        { success: false, error: "activityId or stayId is required" },
        { status: 400 }
      );
    }

    // Build date range
    let startDate: Date;
    let endDate: Date;

    if (date) {
      // Single date query
      startDate = new Date(date);
      endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
    } else if (month) {
      // Month query
      const [year, monthNum] = month.split("-").map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0);
    } else {
      // Default: next 60 days
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
    }

    // Fetch availability records
    const availability = await prisma.availability.findMany({
      where: {
        ...(activityId ? { activityId } : { stayId }),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    // Get activity/stay to determine default capacity
    let defaultSlots = 20; // Default capacity
    if (activityId) {
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { maxParticipants: true },
      });
      if (activity) {
        defaultSlots = activity.maxParticipants;
      }
    } else if (stayId) {
      const stay = await prisma.stay.findUnique({
        where: { id: stayId },
        select: { rooms: true },
      });
      if (stay) {
        defaultSlots = stay.rooms;
      }
    }

    // Transform to response format
    const availabilityMap: Record<string, AvailabilityData> = {};

    // First, fill in defaults for all dates in range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
      
      availabilityMap[dateKey] = {
        date: dateKey,
        totalSlots: defaultSlots,
        bookedSlots: 0,
        availableSlots: isPast ? 0 : defaultSlots,
        isBlocked: isPast,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Override with actual availability records
    for (const record of availability) {
      const dateKey = record.date.toISOString().split("T")[0];
      const bookedSlots = record.slots <= 0 ? defaultSlots : defaultSlots - record.slots;
      availabilityMap[dateKey] = {
        date: dateKey,
        totalSlots: defaultSlots,
        bookedSlots: Math.max(0, bookedSlots),
        availableSlots: Math.max(0, record.slots),
        isBlocked: record.isBlocked,
      };
    }

    return NextResponse.json({
      success: true,
      data: Object.values(availabilityMap),
      meta: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        defaultSlots,
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST /api/availability - Create or update availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, stayId, date, slots, isBlocked, operatorId } = body;

    if (!operatorId) {
      return NextResponse.json(
        { success: false, error: "operatorId is required" },
        { status: 400 }
      );
    }

    if (!activityId && !stayId) {
      return NextResponse.json(
        { success: false, error: "activityId or stayId is required" },
        { status: 400 }
      );
    }

    // Upsert availability record
    const existingRecord = await prisma.availability.findFirst({
      where: {
        date: new Date(date),
        ...(activityId ? { activityId } : { stayId }),
      },
    });

    let availability;
    if (existingRecord) {
      availability = await prisma.availability.update({
        where: { id: existingRecord.id },
        data: {
          slots: slots ?? existingRecord.slots,
          isBlocked: isBlocked ?? existingRecord.isBlocked,
        },
      });
    } else {
      availability = await prisma.availability.create({
        data: {
          operatorId,
          activityId: activityId || undefined,
          stayId: stayId || undefined,
          date: new Date(date),
          slots: slots ?? 20,
          isBlocked: isBlocked ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Create availability error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create/update availability" },
      { status: 500 }
    );
  }
}

