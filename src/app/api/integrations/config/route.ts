import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Default integration configurations to seed
const DEFAULT_INTEGRATIONS = [
  // ============= AFFILIATE PROGRAMS =============
  // Accommodation Affiliates
  {
    category: "AFFILIATE",
    provider: "EXPEDIA",
    displayName: "Expedia Group Affiliate Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.expedia.com",
    deepLinkPattern: "https://www.expedia.com/Hotel-Search?destination={location}&startDate={checkIn}&endDate={checkOut}",
    description: "Major OTA with hotels, flights, and packages",
    logoUrl: "/images/integrations/expedia.png",
    websiteUrl: "https://www.expediagroup.com/partners/",
    usedBy: JSON.stringify(["stays"]),
  },
  {
    category: "AFFILIATE",
    provider: "BOOKING_COM",
    displayName: "Booking.com Partner Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.booking.com",
    deepLinkPattern: "https://www.booking.com/searchresults.html?ss={propertyName}&dest_type=city&checkin={checkIn}&checkout={checkOut}&aid={affiliateId}",
    description: "World's leading accommodation booking platform",
    logoUrl: "/images/integrations/booking.png",
    websiteUrl: "https://www.booking.com/affiliate-program/",
    usedBy: JSON.stringify(["stays"]),
  },
  {
    category: "AFFILIATE",
    provider: "AGODA",
    displayName: "Agoda Partner Program",
    type: "ACCOMMODATION",
    baseUrl: "https://www.agoda.com",
    deepLinkPattern: "https://www.agoda.com/search?city={location}&checkIn={checkIn}&checkOut={checkOut}&cid={affiliateId}",
    description: "Asia-focused hotel booking platform",
    logoUrl: "/images/integrations/agoda.png",
    websiteUrl: "https://partners.agoda.com/",
    usedBy: JSON.stringify(["stays"]),
  },
  // Tours Affiliates
  {
    category: "AFFILIATE",
    provider: "VIATOR",
    displayName: "Viator Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.viator.com",
    deepLinkPattern: "https://www.viator.com/searchResults/all?text={query}&pid={affiliateId}",
    description: "Tours and activities worldwide",
    logoUrl: "/images/integrations/viator.png",
    websiteUrl: "https://www.viator.com/affiliates",
    usedBy: JSON.stringify(["activities"]),
  },
  {
    category: "AFFILIATE",
    provider: "GETYOURGUIDE",
    displayName: "GetYourGuide Partner Program",
    type: "TOURS",
    baseUrl: "https://www.getyourguide.com",
    deepLinkPattern: "https://www.getyourguide.com/s/?q={activity}&partner_id={affiliateId}",
    description: "Tours, attractions, and activities",
    logoUrl: "/images/integrations/getyourguide.png",
    websiteUrl: "https://partner.getyourguide.com/",
    usedBy: JSON.stringify(["activities"]),
  },
  {
    category: "AFFILIATE",
    provider: "KLOOK",
    displayName: "Klook Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.klook.com",
    deepLinkPattern: "https://www.klook.com/search/?query={activity}&aid={affiliateId}",
    description: "Asia activities and experiences",
    logoUrl: "/images/integrations/klook.png",
    websiteUrl: "https://affiliate.klook.com/",
    usedBy: JSON.stringify(["activities"]),
  },
  {
    category: "AFFILIATE",
    provider: "G_ADVENTURES",
    displayName: "G Adventures Affiliate Program",
    type: "TOURS",
    baseUrl: "https://www.gadventures.com",
    deepLinkPattern: "https://www.gadventures.com/search/?q={destination}",
    description: "Adventure travel and small group tours",
    logoUrl: "/images/integrations/gadventures.png",
    websiteUrl: "https://www.gadventures.com/affiliate/",
    usedBy: JSON.stringify(["activities"]),
  },
  // Meta Search Affiliates
  {
    category: "AFFILIATE",
    provider: "TRIPADVISOR",
    displayName: "TripAdvisor Affiliate Program",
    type: "META_SEARCH",
    baseUrl: "https://www.tripadvisor.com",
    deepLinkPattern: "https://www.tripadvisor.com/Search?q={propertyName}&geo={location}",
    description: "Travel reviews and price comparison",
    logoUrl: "/images/integrations/tripadvisor.png",
    websiteUrl: "https://www.tripadvisor.com/affiliates",
    usedBy: JSON.stringify(["stays", "dining", "activities"]),
  },
  {
    category: "AFFILIATE",
    provider: "KAYAK",
    displayName: "Kayak Affiliate Network",
    type: "META_SEARCH",
    baseUrl: "https://www.kayak.com",
    deepLinkPattern: "https://www.kayak.com/hotels/{location}/{checkIn}/{checkOut}",
    description: "Flight and hotel meta-search",
    logoUrl: "/images/integrations/kayak.png",
    websiteUrl: "https://www.kayak.com/affiliates",
    usedBy: JSON.stringify(["stays"]),
  },
  {
    category: "AFFILIATE",
    provider: "SKYSCANNER",
    displayName: "Skyscanner Partners Program",
    type: "META_SEARCH",
    baseUrl: "https://www.skyscanner.com",
    deepLinkPattern: "https://www.skyscanner.com/hotels/{location}",
    description: "Global flight and hotel search",
    logoUrl: "/images/integrations/skyscanner.png",
    websiteUrl: "https://partners.skyscanner.net/",
    usedBy: JSON.stringify(["stays"]),
  },
  // Transport Affiliates
  {
    category: "AFFILIATE",
    provider: "OMIO",
    displayName: "Omio Affiliate Program",
    type: "TRANSPORT",
    baseUrl: "https://www.omio.com",
    deepLinkPattern: "https://www.omio.com/search?from={origin}&to={destination}",
    description: "Train, bus, and flight booking",
    logoUrl: "/images/integrations/omio.png",
    websiteUrl: "https://www.omio.com/affiliates",
    usedBy: JSON.stringify(["transport"]),
  },
  // Gear Affiliates
  {
    category: "AFFILIATE",
    provider: "NORDACE",
    displayName: "Nordace Affiliate Program",
    type: "GEAR",
    baseUrl: "https://www.nordace.com",
    deepLinkPattern: "https://www.nordace.com/?ref={affiliateId}",
    description: "Travel bags and accessories",
    logoUrl: "/images/integrations/nordace.png",
    websiteUrl: "https://www.nordace.com/affiliate",
    usedBy: JSON.stringify(["shop"]),
  },
  {
    category: "AFFILIATE",
    provider: "LONELY_PLANET",
    displayName: "Lonely Planet Affiliate Program",
    type: "GEAR",
    baseUrl: "https://shop.lonelyplanet.com",
    deepLinkPattern: "https://shop.lonelyplanet.com/?ref={affiliateId}",
    description: "Travel guides and gear",
    logoUrl: "/images/integrations/lonelyplanet.png",
    websiteUrl: "https://www.lonelyplanet.com/affiliates",
    usedBy: JSON.stringify(["shop"]),
  },
  // Food Delivery Affiliates
  {
    category: "AFFILIATE",
    provider: "FOODPANDA",
    displayName: "Foodpanda Affiliate Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://www.foodpanda.my",
    deepLinkPattern: "https://www.foodpanda.my/restaurant/{restaurantSlug}?aid={affiliateId}",
    description: "Food delivery across Malaysia and Asia",
    logoUrl: "/images/integrations/foodpanda.png",
    websiteUrl: "https://www.foodpanda.my/contents/affiliate.htm",
    usedBy: JSON.stringify(["dining"]),
  },
  {
    category: "AFFILIATE",
    provider: "GRABFOOD",
    displayName: "GrabFood Partner Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://food.grab.com",
    deepLinkPattern: "https://food.grab.com/my/en/restaurants?search={restaurantName}+Kuala+Kubu+Bharu",
    description: "Southeast Asia's leading food delivery platform",
    logoUrl: "/images/integrations/grabfood.png",
    websiteUrl: "https://www.grab.com/my/merchant/food/",
    usedBy: JSON.stringify(["dining"]),
  },
  {
    category: "AFFILIATE",
    provider: "SHOPEEFOOD",
    displayName: "ShopeeFood Affiliate Program",
    type: "FOOD_DELIVERY",
    baseUrl: "https://shopeefood.my",
    deepLinkPattern: "https://shopeefood.my/search?q={restaurantName}",
    description: "Shopee's food delivery service in Malaysia",
    logoUrl: "/images/integrations/shopeefood.png",
    websiteUrl: "https://shopeefood.my/merchant",
    usedBy: JSON.stringify(["dining"]),
  },

  // ============= ACCOMMODATION APIs =============
  {
    category: "ACCOMMODATION",
    provider: "GOOGLE_PLACES_STAYS",
    displayName: "Google Places API (Accommodation)",
    type: "DATA_SOURCE",
    baseUrl: "https://maps.googleapis.com/maps/api/place",
    apiKeySource: "ENV",
    description: "Fetch hotel and accommodation data from Google",
    logoUrl: "/images/integrations/google.png",
    websiteUrl: "https://developers.google.com/maps/documentation/places",
    documentationUrl: "https://developers.google.com/maps/documentation/places/web-service/overview",
    usedBy: JSON.stringify(["stays"]),
    configJson: JSON.stringify({
      defaultLocation: "Kuala Kubu Bharu, Malaysia",
      defaultRadius: 15000,
      placeTypes: ["lodging", "hotel", "resort"],
    }),
  },
  {
    category: "ACCOMMODATION",
    provider: "BOOKING_COM_API",
    displayName: "Booking.com Content API",
    type: "DATA_SOURCE",
    baseUrl: "https://distribution-xml.booking.com",
    apiKeySource: "ENV",
    description: "Fetch accommodation data from Booking.com",
    logoUrl: "/images/integrations/booking.png",
    websiteUrl: "https://developers.booking.com/",
    usedBy: JSON.stringify(["stays"]),
    configJson: JSON.stringify({
      defaultDestination: "Kuala Kubu Bharu",
      countryCode: "MY",
    }),
  },

  // ============= ACTIVITIES & ATTRACTIONS APIs =============
  {
    category: "ACTIVITIES",
    provider: "GOOGLE_PLACES_ACTIVITIES",
    displayName: "Google Places API (Activities)",
    type: "DATA_SOURCE",
    baseUrl: "https://maps.googleapis.com/maps/api/place",
    apiKeySource: "ENV",
    description: "Fetch POI and attraction data from Google",
    logoUrl: "/images/integrations/google.png",
    websiteUrl: "https://developers.google.com/maps/documentation/places",
    usedBy: JSON.stringify(["activities", "explore"]),
    configJson: JSON.stringify({
      defaultLocation: "Kuala Kubu Bharu, Malaysia",
      defaultRadius: 20000,
      placeTypes: ["tourist_attraction", "park", "natural_feature", "point_of_interest"],
    }),
  },
  {
    category: "ACTIVITIES",
    provider: "TRIPADVISOR_API",
    displayName: "TripAdvisor Content API",
    type: "DATA_SOURCE",
    baseUrl: "https://api.tripadvisor.com",
    apiKeySource: "ENV",
    description: "Fetch attraction reviews and data from TripAdvisor",
    logoUrl: "/images/integrations/tripadvisor.png",
    websiteUrl: "https://www.tripadvisor.com/developers",
    usedBy: JSON.stringify(["activities"]),
  },

  // ============= DINING APIs =============
  {
    category: "DINING",
    provider: "GOOGLE_PLACES_DINING",
    displayName: "Google Places API (Dining)",
    type: "DATA_SOURCE",
    baseUrl: "https://maps.googleapis.com/maps/api/place",
    apiKeySource: "ENV",
    description: "Fetch restaurant and cafe data from Google",
    logoUrl: "/images/integrations/google.png",
    websiteUrl: "https://developers.google.com/maps/documentation/places",
    usedBy: JSON.stringify(["dining"]),
    configJson: JSON.stringify({
      defaultLocation: "Kuala Kubu Bharu, Malaysia",
      defaultRadius: 10000,
      placeTypes: ["restaurant", "cafe", "food", "bakery", "meal_takeaway"],
    }),
  },

  // ============= MAPS & TRANSPORT =============
  {
    category: "MAPS_TRANSPORT",
    provider: "GOOGLE_MAPS",
    displayName: "Google Maps Platform",
    type: "MAPS",
    baseUrl: "https://maps.googleapis.com/maps/api",
    apiKeySource: "ENV",
    description: "Maps, directions, geocoding, and places",
    logoUrl: "/images/integrations/google-maps.png",
    websiteUrl: "https://cloud.google.com/maps-platform",
    documentationUrl: "https://developers.google.com/maps",
    usedBy: JSON.stringify(["explore", "stays", "dining", "activities"]),
    configJson: JSON.stringify({
      defaultCenter: { lat: 3.5728, lng: 101.6411 },
      defaultZoom: 13,
      enableDirections: true,
      enableGeocoding: true,
    }),
  },
  {
    category: "MAPS_TRANSPORT",
    provider: "OPENSTREETMAP",
    displayName: "OpenStreetMap",
    type: "MAPS",
    baseUrl: "https://tile.openstreetmap.org",
    description: "Free map tiles and data",
    logoUrl: "/images/integrations/osm.png",
    websiteUrl: "https://www.openstreetmap.org",
    usedBy: JSON.stringify(["explore"]),
  },

  // ============= SOCIAL MEDIA =============
  {
    category: "SOCIAL_MEDIA",
    provider: "INSTAGRAM",
    displayName: "Instagram Basic Display API",
    type: "SOCIAL_FEED",
    baseUrl: "https://graph.instagram.com",
    apiKeySource: "ENV",
    description: "Display Instagram feed on website",
    logoUrl: "/images/integrations/instagram.png",
    websiteUrl: "https://developers.facebook.com/docs/instagram-basic-display-api",
    usedBy: JSON.stringify(["home", "social"]),
    configJson: JSON.stringify({
      username: "visitkkb",
      postLimit: 6,
      showReels: true,
    }),
  },
  {
    category: "SOCIAL_MEDIA",
    provider: "FACEBOOK",
    displayName: "Facebook Page API",
    type: "SOCIAL_FEED",
    baseUrl: "https://graph.facebook.com",
    apiKeySource: "ENV",
    description: "Display Facebook page posts",
    logoUrl: "/images/integrations/facebook.png",
    websiteUrl: "https://developers.facebook.com/docs/pages",
    usedBy: JSON.stringify(["home", "social"]),
  },
  {
    category: "SOCIAL_MEDIA",
    provider: "WHATSAPP_BUSINESS",
    displayName: "WhatsApp Business API",
    type: "MESSAGING",
    baseUrl: "https://graph.facebook.com",
    apiKeySource: "ENV",
    description: "Send booking confirmations and notifications via WhatsApp",
    logoUrl: "/images/integrations/whatsapp.png",
    websiteUrl: "https://business.whatsapp.com/",
    usedBy: JSON.stringify(["bookings", "notifications"]),
    configJson: JSON.stringify({
      businessNumber: "",
      templateMessages: {
        bookingConfirmation: "booking_confirmation_template",
        bookingReminder: "booking_reminder_template",
      },
    }),
  },
];

// GET /api/integrations/config - List all integration configs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Seed defaults if empty
    const count = await prisma.integrationConfig.count();
    if (count === 0) {
      for (const integration of DEFAULT_INTEGRATIONS) {
        await prisma.integrationConfig.upsert({
          where: { provider: integration.provider },
          update: {},
          create: integration,
        });
      }
    }

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (activeOnly) where.isActive = true;

    const integrations = await prisma.integrationConfig.findMany({
      where,
      orderBy: [{ category: "asc" }, { priority: "desc" }, { displayName: "asc" }],
    });

    // Calculate stats
    const allIntegrations = await prisma.integrationConfig.findMany();
    const stats = {
      total: allIntegrations.length,
      active: allIntegrations.filter((i) => i.isActive).length,
      withErrors: allIntegrations.filter((i) => i.lastStatus === "ERROR").length,
      byCategory: {
        AFFILIATE: allIntegrations.filter((i) => i.category === "AFFILIATE").length,
        ACCOMMODATION: allIntegrations.filter((i) => i.category === "ACCOMMODATION").length,
        ACTIVITIES: allIntegrations.filter((i) => i.category === "ACTIVITIES").length,
        DINING: allIntegrations.filter((i) => i.category === "DINING").length,
        MAPS_TRANSPORT: allIntegrations.filter((i) => i.category === "MAPS_TRANSPORT").length,
        SOCIAL_MEDIA: allIntegrations.filter((i) => i.category === "SOCIAL_MEDIA").length,
      },
      activeByCategory: {
        AFFILIATE: allIntegrations.filter((i) => i.category === "AFFILIATE" && i.isActive).length,
        ACCOMMODATION: allIntegrations.filter((i) => i.category === "ACCOMMODATION" && i.isActive).length,
        ACTIVITIES: allIntegrations.filter((i) => i.category === "ACTIVITIES" && i.isActive).length,
        DINING: allIntegrations.filter((i) => i.category === "DINING" && i.isActive).length,
        MAPS_TRANSPORT: allIntegrations.filter((i) => i.category === "MAPS_TRANSPORT" && i.isActive).length,
        SOCIAL_MEDIA: allIntegrations.filter((i) => i.category === "SOCIAL_MEDIA" && i.isActive).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: integrations,
      stats,
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}

// POST /api/integrations/config - Create new integration
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

    const integration = await prisma.integrationConfig.create({
      data: {
        category: body.category,
        provider: body.provider,
        displayName: body.displayName,
        type: body.type,
        isActive: body.isActive || false,
        apiKey: body.apiKey,
        apiKeySource: body.apiKeySource || "ENV",
        clientId: body.clientId,
        clientSecret: body.clientSecret,
        affiliateId: body.affiliateId,
        baseUrl: body.baseUrl,
        deepLinkPattern: body.deepLinkPattern,
        configJson: body.configJson ? JSON.stringify(body.configJson) : null,
        description: body.description,
        logoUrl: body.logoUrl,
        websiteUrl: body.websiteUrl,
        documentationUrl: body.documentationUrl,
        usedBy: body.usedBy ? JSON.stringify(body.usedBy) : null,
        priority: body.priority || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: integration,
      message: "Integration created successfully",
    });
  } catch (error) {
    console.error("Error creating integration:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create integration" },
      { status: 500 }
    );
  }
}

