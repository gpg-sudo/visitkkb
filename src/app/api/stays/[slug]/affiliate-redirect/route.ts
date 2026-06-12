import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/stays/[slug]/affiliate-redirect
 * 
 * Handles the affiliate redirect flow when a user clicks on a stay.
 * 
 * Flow:
 * 1. Get the stay by slug
 * 2. If affiliateDeepLink is set, use it directly
 * 3. Otherwise, build deeplink using affiliate program pattern
 * 4. Log the match attempt
 * 5. Redirect user to affiliate URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Get optional booking parameters
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");
    const userId = searchParams.get("userId"); // Optional, for logged-in users

    // Fetch the stay
    const stay = await prisma.stay.findUnique({
      where: { slug },
    });

    if (!stay) {
      return NextResponse.json(
        { success: false, error: "Stay not found" },
        { status: 404 }
      );
    }

    // Determine the redirect URL
    let redirectUrl: string | null = null;
    let affiliateProgramId: string | null = null;
    let matchSuccess = false;
    let errorMessage: string | null = null;

    try {
      // Option 1: Direct affiliate deep link override
      if (stay.affiliateDeepLink) {
        redirectUrl = stay.affiliateDeepLink;
        matchSuccess = true;
      }
      // Option 2: Build URL using affiliate program
      else if (stay.affiliateProvider) {
        const program = await prisma.affiliateProgram.findUnique({
          where: { code: stay.affiliateProvider },
        });

        if (program && program.active && program.deepLinkPattern) {
          affiliateProgramId = program.id;
          redirectUrl = buildAffiliateUrl(
            { 
              deepLinkPattern: program.deepLinkPattern, 
              affiliateId: program.affiliateId, 
              baseUrl: program.baseUrl 
            }, 
            stay, 
            {
              checkIn,
              checkOut,
              guests,
            }
          );
          matchSuccess = true;
        } else {
          errorMessage = program
            ? "Affiliate program is inactive or missing deep link pattern"
            : "Affiliate program not found";
        }
      }
      // Option 3: Auto-match with default accommodation affiliate
      else if (stay.autoMatchEnabled) {
        const defaultProgram = await prisma.affiliateProgram.findFirst({
          where: {
            type: "ACCOMMODATION",
            active: true,
          },
          orderBy: { priority: "desc" },
        });

        if (defaultProgram && defaultProgram.deepLinkPattern) {
          affiliateProgramId = defaultProgram.id;
          redirectUrl = buildAffiliateUrl(
            { 
              deepLinkPattern: defaultProgram.deepLinkPattern, 
              affiliateId: defaultProgram.affiliateId, 
              baseUrl: defaultProgram.baseUrl 
            }, 
            stay, 
            {
              checkIn,
              checkOut,
              guests,
            }
          );
          matchSuccess = true;
        } else {
          errorMessage = "No active accommodation affiliate program configured";
        }
      } else {
        errorMessage = "Auto-match disabled and no affiliate configured";
      }
    } catch (matchError) {
      errorMessage = matchError instanceof Error ? matchError.message : "Match error";
    }

    // Log the match attempt
    await prisma.affiliateMatchLog.create({
      data: {
        userId: userId || null,
        stayId: stay.id,
        affiliateProgramId,
        clickedName: stay.title,
        matchedName: stay.affiliateMatchName || stay.title,
        generatedUrl: redirectUrl,
        success: matchSuccess,
        errorMessage,
        checkInDate: checkIn ? new Date(checkIn) : null,
        checkOutDate: checkOut ? new Date(checkOut) : null,
        guests: guests ? parseInt(guests) : null,
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
        message: "Unable to redirect to booking partner. Please try searching manually:",
        links: await getFallbackLinks(stay),
        stay: {
          id: stay.id,
          title: stay.title,
          slug: stay.slug,
        },
      },
    });
  } catch (error) {
    console.error("Error handling affiliate redirect:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process redirect" },
      { status: 500 }
    );
  }
}

/**
 * Build affiliate URL from pattern and stay data
 */
function buildAffiliateUrl(
  program: {
    deepLinkPattern: string;
    affiliateId: string | null;
    baseUrl: string | null;
  },
  stay: {
    title: string;
    affiliateMatchName: string | null;
    location: string;
    lat: number | null;
    lng: number | null;
  },
  options: {
    checkIn: string | null;
    checkOut: string | null;
    guests: string | null;
  }
): string {
  const propertyName = encodeURIComponent(stay.affiliateMatchName || stay.title);
  const location = encodeURIComponent("Kuala Kubu Bharu, Malaysia");

  let url = program.deepLinkPattern
    .replace("{propertyName}", propertyName)
    .replace("{location}", location)
    .replace("{affiliateId}", program.affiliateId || "")
    .replace("{checkIn}", options.checkIn || "")
    .replace("{checkOut}", options.checkOut || "")
    .replace("{guests}", options.guests || "2");

  // Clean up empty parameters
  url = url.replace(/(&|\?)[^=]+=(?=&|$)/g, "");
  url = url.replace(/\?&/, "?");
  url = url.replace(/\?$/, "");

  return url;
}

/**
 * Generate fallback search links for manual booking
 */
async function getFallbackLinks(stay: { title: string; location: string }): Promise<
  Array<{ name: string; url: string }>
> {
  const searchQuery = encodeURIComponent(`${stay.title} Kuala Kubu Bharu`);
  const location = encodeURIComponent("Kuala Kubu Bharu, Malaysia");

  return [
    {
      name: "Search on Booking.com",
      url: `https://www.booking.com/searchresults.html?ss=${searchQuery}`,
    },
    {
      name: "Search on Agoda",
      url: `https://www.agoda.com/search?city=${location}`,
    },
    {
      name: "Search on Expedia",
      url: `https://www.expedia.com/Hotel-Search?destination=${location}`,
    },
    {
      name: "Search on Google",
      url: `https://www.google.com/travel/hotels?q=${searchQuery}`,
    },
  ];
}

