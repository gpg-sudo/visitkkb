import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/dining/[slug]/affiliate-redirect
 *
 * Handles the affiliate redirect flow when a user clicks "Order via Delivery"
 * on a restaurant/dining place.
 *
 * Flow:
 * 1. Get the restaurant by slug
 * 2. If affiliateDeepLink is set, use it directly
 * 3. Otherwise, based on primaryAffiliateProvider:
 *    - Use provider-specific slug if present
 *    - Else build search URL using affiliateMatchName or name
 * 4. Log the click in AffiliateMatchLog
 * 5. Redirect user to affiliate URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Get optional parameters
    const provider = searchParams.get("provider"); // Override primary provider
    const userId = searchParams.get("userId"); // Optional, for logged-in users

    // Fetch the restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Determine the redirect URL
    let redirectUrl: string | null = null;
    let affiliateProgramId: string | null = null;
    let matchSuccess = false;
    let errorMessage: string | null = null;
    const selectedProvider = provider || restaurant.primaryAffiliateProvider;

    try {
      // Option 1: Direct affiliate deep link override
      if (restaurant.affiliateDeepLink) {
        redirectUrl = restaurant.affiliateDeepLink;
        matchSuccess = true;
      }
      // Option 2: Build URL using provider-specific settings
      else if (selectedProvider) {
        const program = await prisma.affiliateProgram.findUnique({
          where: { code: selectedProvider },
        });

        if (program && program.active) {
          affiliateProgramId = program.id;
          redirectUrl = buildFoodDeliveryUrl(
            selectedProvider,
            restaurant,
            program
          );
          matchSuccess = !!redirectUrl;
        } else {
          errorMessage = program
            ? "Food delivery affiliate is inactive"
            : "Food delivery affiliate program not found";
        }
      }
      // Option 3: Auto-match with default food delivery affiliate
      else if (restaurant.autoMatchEnabled) {
        const defaultProgram = await prisma.affiliateProgram.findFirst({
          where: {
            type: "FOOD_DELIVERY",
            active: true,
          },
          orderBy: { priority: "desc" },
        });

        if (defaultProgram) {
          affiliateProgramId = defaultProgram.id;
          redirectUrl = buildFoodDeliveryUrl(
            defaultProgram.code,
            restaurant,
            defaultProgram
          );
          matchSuccess = !!redirectUrl;
        } else {
          errorMessage = "No active food delivery affiliate program configured";
        }
      } else {
        errorMessage = "Auto-match disabled and no affiliate configured";
      }
    } catch (matchError) {
      errorMessage =
        matchError instanceof Error ? matchError.message : "Match error";
    }

    // Log the click attempt
    await prisma.affiliateMatchLog.create({
      data: {
        userId: userId || null,
        restaurantId: restaurant.id,
        affiliateProgramId,
        clickType: "FOOD_DELIVERY",
        clickedName: restaurant.name,
        matchedName: restaurant.affiliateMatchName || restaurant.name,
        generatedUrl: redirectUrl,
        success: matchSuccess,
        errorMessage,
      },
    });

    // If we have a redirect URL, redirect the user
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    // Fallback: Return JSON with fallback options
    return NextResponse.json({
      success: false,
      error: errorMessage || "Unable to generate affiliate link",
      fallback: {
        message:
          "Unable to redirect to food delivery app. Please try searching manually:",
        links: getFallbackLinks(restaurant),
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      },
    });
  } catch (error) {
    console.error("Error handling food delivery redirect:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process redirect" },
      { status: 500 }
    );
  }
}

/**
 * Build food delivery URL based on provider
 */
function buildFoodDeliveryUrl(
  providerCode: string,
  restaurant: {
    name: string;
    affiliateMatchName: string | null;
    foodpandaSlug: string | null;
    grabfoodSlug: string | null;
    shopeefoodSlug: string | null;
    location: string;
  },
  program: {
    deepLinkPattern: string | null;
    affiliateId: string | null;
    baseUrl: string | null;
  }
): string | null {
  const searchName = encodeURIComponent(
    restaurant.affiliateMatchName || restaurant.name
  );
  const location = encodeURIComponent("Kuala Kubu Bharu");

  switch (providerCode) {
    case "FOODPANDA":
      // If we have a direct slug, use it
      if (restaurant.foodpandaSlug) {
        return `https://www.foodpanda.my/restaurant/${restaurant.foodpandaSlug}${
          program.affiliateId ? `?aid=${program.affiliateId}` : ""
        }`;
      }
      // Otherwise use search
      return `https://www.foodpanda.my/search?q=${searchName}+${location}${
        program.affiliateId ? `&aid=${program.affiliateId}` : ""
      }`;

    case "GRABFOOD":
      // If we have a direct slug, use it
      if (restaurant.grabfoodSlug) {
        return `https://food.grab.com/my/en/restaurant/${restaurant.grabfoodSlug}`;
      }
      // Otherwise use search
      return `https://food.grab.com/my/en/restaurants?search=${searchName}+${location}`;

    case "SHOPEEFOOD":
      // If we have a direct slug, use it
      if (restaurant.shopeefoodSlug) {
        return `https://shopeefood.my/restaurant/${restaurant.shopeefoodSlug}`;
      }
      // Otherwise use search
      return `https://shopeefood.my/search?q=${searchName}`;

    default:
      // Use the pattern from the program if available
      if (program.deepLinkPattern) {
        return program.deepLinkPattern
          .replace("{restaurantName}", searchName)
          .replace("{restaurantSlug}", restaurant.foodpandaSlug || searchName)
          .replace("{affiliateId}", program.affiliateId || "")
          .replace("{location}", location);
      }
      return null;
  }
}

/**
 * Generate fallback search links for manual ordering
 */
function getFallbackLinks(restaurant: {
  name: string;
  location: string;
}): Array<{ name: string; url: string; icon?: string }> {
  const searchQuery = encodeURIComponent(
    `${restaurant.name} Kuala Kubu Bharu`
  );

  return [
    {
      name: "Search on Foodpanda",
      url: `https://www.foodpanda.my/search?q=${searchQuery}`,
      icon: "foodpanda",
    },
    {
      name: "Search on GrabFood",
      url: `https://food.grab.com/my/en/restaurants?search=${searchQuery}`,
      icon: "grab",
    },
    {
      name: "Search on ShopeeFood",
      url: `https://shopeefood.my/search?q=${searchQuery}`,
      icon: "shopee",
    },
    {
      name: "Search on Google Maps",
      url: `https://www.google.com/maps/search/${searchQuery}`,
      icon: "google",
    },
  ];
}

