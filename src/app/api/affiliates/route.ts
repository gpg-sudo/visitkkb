import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Default affiliate programs to seed
const DEFAULT_AFFILIATE_PROGRAMS = [
  {
    code: "EXPEDIA",
    name: "Expedia Group Affiliate Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.expedia.com",
    deepLinkPattern: "https://www.expedia.com/Hotel-Search?destination={location}&startDate={checkIn}&endDate={checkOut}",
    description: "Major OTA with hotels, flights, and packages",
    logoUrl: "/images/affiliates/expedia.png",
    websiteUrl: "https://www.expediagroup.com/partners/",
  },
  {
    code: "BOOKING_COM",
    name: "Booking.com Partner Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.booking.com",
    deepLinkPattern: "https://www.booking.com/searchresults.html?ss={propertyName}&dest_type=city&checkin={checkIn}&checkout={checkOut}&aid={affiliateId}",
    description: "World's leading accommodation booking platform",
    logoUrl: "/images/affiliates/booking.png",
    websiteUrl: "https://www.booking.com/affiliate-program/",
  },
  {
    code: "TRIPADVISOR",
    name: "TripAdvisor Affiliate Program",
    type: "META_SEARCH",
    baseUrl: "https://www.tripadvisor.com",
    deepLinkPattern: "https://www.tripadvisor.com/Search?q={propertyName}&geo={location}",
    description: "Travel reviews and price comparison",
    logoUrl: "/images/affiliates/tripadvisor.png",
    websiteUrl: "https://www.tripadvisor.com/affiliates",
  },
  {
    code: "OMIO",
    name: "Omio Affiliate Program",
    type: "TRANSPORT",
    baseUrl: "https://www.omio.com",
    deepLinkPattern: "https://www.omio.com/search?from={origin}&to={destination}",
    description: "Train, bus, and flight booking across Europe",
    logoUrl: "/images/affiliates/omio.png",
    websiteUrl: "https://www.omio.com/affiliates",
  },
  {
    code: "NORDACE",
    name: "Nordace Affiliate Program",
    type: "GEAR",
    baseUrl: "https://www.nordace.com",
    deepLinkPattern: "https://www.nordace.com/?ref={affiliateId}",
    description: "Travel bags and accessories",
    logoUrl: "/images/affiliates/nordace.png",
    websiteUrl: "https://www.nordace.com/affiliate",
  },
  {
    code: "AGODA",
    name: "Agoda Partner Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.agoda.com",
    deepLinkPattern: "https://www.agoda.com/search?city={location}&checkIn={checkIn}&checkOut={checkOut}&cid={affiliateId}",
    description: "Asia-focused hotel booking platform",
    logoUrl: "/images/affiliates/agoda.png",
    websiteUrl: "https://partners.agoda.com/",
  },
  {
    code: "VIATOR",
    name: "Viator Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.viator.com",
    deepLinkPattern: "https://www.viator.com/searchResults/all?text={query}&pid={affiliateId}",
    description: "Tours and activities worldwide",
    logoUrl: "/images/affiliates/viator.png",
    websiteUrl: "https://www.viator.com/affiliates",
  },
  {
    code: "G_ADVENTURES",
    name: "G Adventures Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.gadventures.com",
    deepLinkPattern: "https://www.gadventures.com/search/?q={destination}",
    description: "Adventure travel and small group tours",
    logoUrl: "/images/affiliates/gadventures.png",
    websiteUrl: "https://www.gadventures.com/affiliate/",
  },
  {
    code: "KLOOK",
    name: "Klook Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.klook.com",
    deepLinkPattern: "https://www.klook.com/search/?query={activity}&aid={affiliateId}",
    description: "Asia activities and experiences",
    logoUrl: "/images/affiliates/klook.png",
    websiteUrl: "https://affiliate.klook.com/",
  },
  {
    code: "KAYAK",
    name: "Kayak Affiliate Network",
    type: "META_SEARCH",
    baseUrl: "https://www.kayak.com",
    deepLinkPattern: "https://www.kayak.com/hotels/{location}/{checkIn}/{checkOut}",
    description: "Flight and hotel meta-search",
    logoUrl: "/images/affiliates/kayak.png",
    websiteUrl: "https://www.kayak.com/affiliates",
  },
  {
    code: "SKYSCANNER",
    name: "Skyscanner Partners Program",
    type: "META_SEARCH",
    baseUrl: "https://www.skyscanner.com",
    deepLinkPattern: "https://www.skyscanner.com/hotels/{location}",
    description: "Global flight and hotel search",
    logoUrl: "/images/affiliates/skyscanner.png",
    websiteUrl: "https://partners.skyscanner.net/",
  },
  {
    code: "LONELY_PLANET",
    name: "Lonely Planet Affiliate Program",
    type: "GEAR",
    baseUrl: "https://shop.lonelyplanet.com",
    deepLinkPattern: "https://shop.lonelyplanet.com/?ref={affiliateId}",
    description: "Travel guides and gear",
    logoUrl: "/images/affiliates/lonelyplanet.png",
    websiteUrl: "https://www.lonelyplanet.com/affiliates",
  },
  {
    code: "GETYOURGUIDE",
    name: "GetYourGuide Partner Program",
    type: "TOURS",
    baseUrl: "https://www.getyourguide.com",
    deepLinkPattern: "https://www.getyourguide.com/s/?q={activity}&partner_id={affiliateId}",
    description: "Tours, attractions, and activities",
    logoUrl: "/images/affiliates/getyourguide.png",
    websiteUrl: "https://partner.getyourguide.com/",
  },
  // Food Delivery Affiliates
  {
    code: "FOODPANDA",
    name: "Foodpanda Affiliate Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://www.foodpanda.my",
    deepLinkPattern: "https://www.foodpanda.my/restaurant/{restaurantSlug}?aid={affiliateId}",
    description: "Food delivery across Malaysia and Asia",
    logoUrl: "/images/affiliates/foodpanda.png",
    websiteUrl: "https://www.foodpanda.my/contents/affiliate.htm",
  },
  {
    code: "GRABFOOD",
    name: "GrabFood Partner Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://food.grab.com",
    deepLinkPattern: "https://food.grab.com/my/en/restaurants?search={restaurantName}+Kuala+Kubu+Bharu",
    description: "Southeast Asia's leading food delivery platform",
    logoUrl: "/images/affiliates/grabfood.png",
    websiteUrl: "https://www.grab.com/my/merchant/food/",
  },
  {
    code: "SHOPEEFOOD",
    name: "ShopeeFood Affiliate Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://shopeefood.my",
    deepLinkPattern: "https://shopeefood.my/search?q={restaurantName}",
    description: "Shopee's food delivery service in Malaysia",
    logoUrl: "/images/affiliates/shopeefood.png",
    websiteUrl: "https://shopeefood.my/merchant",
  },
];

// GET /api/affiliates - List all affiliate programs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Check if we have any programs, if not seed defaults
    const count = await prisma.affiliateProgram.count();
    if (count === 0) {
      await prisma.affiliateProgram.createMany({
        data: DEFAULT_AFFILIATE_PROGRAMS,
      });
    }

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (activeOnly) where.active = true;

    const programs = await prisma.affiliateProgram.findMany({
      where,
      orderBy: [{ type: "asc" }, { priority: "desc" }, { name: "asc" }],
    });

    // Calculate stats
    const stats = {
      total: programs.length,
      active: programs.filter((p) => p.active).length,
      withErrors: programs.filter((p) => p.lastStatus === "ERROR").length,
      byType: {
        ACCOMMODATION: programs.filter((p) => p.type === "ACCOMMODATION").length,
        TOURS: programs.filter((p) => p.type === "TOURS").length,
        TRANSPORT: programs.filter((p) => p.type === "TRANSPORT").length,
        GEAR: programs.filter((p) => p.type === "GEAR").length,
        META_SEARCH: programs.filter((p) => p.type === "META_SEARCH").length,
        FOOD_DELIVERY: programs.filter((p) => p.type === "FOOD_DELIVERY").length,
      },
    };

    return NextResponse.json({
      success: true,
      data: programs,
      stats,
    });
  } catch (error) {
    console.error("Error fetching affiliate programs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch affiliate programs" },
      { status: 500 }
    );
  }
}

// POST /api/affiliates - Create or update affiliate program
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
    const { code, ...data } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Program code is required" },
        { status: 400 }
      );
    }

    const program = await prisma.affiliateProgram.upsert({
      where: { code },
      update: data,
      create: { code, ...data },
    });

    return NextResponse.json({
      success: true,
      data: program,
      message: "Affiliate program saved successfully",
    });
  } catch (error) {
    console.error("Error saving affiliate program:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save affiliate program" },
      { status: 500 }
    );
  }
}

