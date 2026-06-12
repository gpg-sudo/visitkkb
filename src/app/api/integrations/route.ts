import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, requireRole } from "@/lib/auth";
import { bookingService } from "@/services/booking-com";
import { agodaService } from "@/services/agoda";
import { googleMapsService } from "@/services/google-maps";

// POST /api/integrations/sync - Sync data from external APIs (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { source } = body; // 'booking', 'agoda', 'google_maps', or 'all'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = {
      success: true,
      synced: {},
      errors: [],
    };

    // Sync from Booking.com
    if (source === "booking" || source === "all") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await bookingService.syncHotelsToDatabase(prisma as any);
        results.synced.booking = count;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          source: "booking",
          error: errorMessage,
        });
      }
    }

    // Sync from Agoda
    if (source === "agoda" || source === "all") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await agodaService.syncPropertiesToDatabase(prisma as any);
        results.synced.agoda = count;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          source: "agoda",
          error: errorMessage,
        });
      }
    }

    // Sync from Google Maps
    if (source === "google_maps" || source === "all") {
      try {
        const count = await syncGoogleMapsData();
        results.synced.google_maps = count;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.errors.push({
          source: "google_maps",
          error: errorMessage,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Integration sync error:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 },
    );
  }
}

// GET /api/integrations/status - Check integration status
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);

    if (!requireRole(user, ["ADMIN"])) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      );
    }

    const status = {
      booking_com: {
        enabled: !!process.env.BOOKING_API_KEY,
        configured: !!process.env.BOOKING_API_KEY,
      },
      agoda: {
        enabled: !!process.env.AGODA_API_KEY,
        configured: !!process.env.AGODA_API_KEY,
      },
      google_maps: {
        enabled: !!process.env.GOOGLE_MAPS_API_KEY,
        configured: !!process.env.GOOGLE_MAPS_API_KEY,
      },
    };

    // Get sync statistics
    const stats = {
      total_stays: await prisma.stay.count(),
      total_activities: await prisma.activity.count(),
      total_restaurants: await prisma.restaurant.count(),
      booking_com_properties: await prisma.stay.count({
        where: { operator: { name: "Booking.com Integration" } },
      }),
      agoda_properties: await prisma.stay.count({
        where: { operator: { name: "Agoda Integration" } },
      }),
      google_maps_places: await prisma.restaurant.count({
        where: { operator: { name: "Google Maps Integration" } },
      }),
    };

    return NextResponse.json({
      success: true,
      status,
      stats,
    });
  } catch (error) {
    console.error("Get integration status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get status" },
      { status: 500 },
    );
  }
}

// Helper function to sync Google Maps data
async function syncGoogleMapsData(): Promise<number> {
  let synced = 0;

  try {
    // Get or create Google Maps operator
    let operator = await prisma.operator.findFirst({
      where: { name: "Google Maps Integration" },
    });

    if (!operator) {
      operator = await prisma.operator.create({
        data: {
          name: "Google Maps Integration",
          email: "integration@visitkkb.com",
          phone: "+60000000000",
          description: "Places synced from Google Maps",
          verified: true,
        },
      });
    }

    // Search for restaurants
    const restaurants =
      await googleMapsService.searchRestaurants("Kuala Kubu Bharu");

    for (const place of restaurants) {
      try {
        const details = await googleMapsService.getPlaceDetails(place.place_id);

        if (!details) continue;

        const existing = await prisma.restaurant.findFirst({
          where: { name: details.name },
        });

        if (existing) continue;

        await prisma.restaurant.create({
          data: {
            name: details.name,
            slug: slugify(details.name),
            description: `${details.name} - ${details.address}`,
            image: details.photos?.[0] || "",
            gallery: JSON.stringify(details.photos || []),
            location: details.address,
            coordinates: JSON.stringify(details.location),
            cuisine: "Local",
            priceRange: "$$",
            specialties: "",
            hours: details.openingHours?.join(", ") || "Check website",
            operatorId: operator.id,
            status: "ACTIVE",
          },
        });

        synced++;
      } catch (error) {
        console.error("Error syncing place:", error);
      }
    }

    // Search for tourist attractions (activities)
    const attractions =
      await googleMapsService.searchAttractions("Kuala Kubu Bharu");

    for (const place of attractions.slice(0, 5)) {
      try {
        const details = await googleMapsService.getPlaceDetails(place.place_id);

        if (!details) continue;

        const existing = await prisma.activity.findFirst({
          where: { title: details.name },
        });

        if (existing) continue;

        await prisma.activity.create({
          data: {
            title: details.name,
            slug: slugify(details.name),
            description: `Visit ${details.name} in Kuala Kubu Bharu`,
            image: details.photos?.[0] || "",
            gallery: JSON.stringify(details.photos || []),
            location: details.address,
            coordinates: JSON.stringify(details.location),
            pricePerPerson: 0, // Free or contact for price
            difficulty: "Easy",
            duration: "1-2 hours",
            maxParticipants: 20,
            tags: "Sightseeing,Nature,Culture",
            operatorId: operator.id,
            status: "ACTIVE",
          },
        });

        synced++;
      } catch (error) {
        console.error("Error syncing attraction:", error);
      }
    }

    return synced;
  } catch (error) {
    console.error("Google Maps sync error:", error);
    return synced;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}
