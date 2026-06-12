import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// GET /api/stays/[slug] - Get single stay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const stay = await prisma.stay.findUnique({
      where: { slug },
      include: {
        operator: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!stay) {
      return NextResponse.json(
        { success: false, error: "Stay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stay,
    });
  } catch (error) {
    console.error("Error fetching stay:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stay" },
      { status: 500 }
    );
  }
}

// PUT /api/stays/[slug] - Update stay
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const existingStay = await prisma.stay.findUnique({ where: { slug } });
    if (!existingStay) {
      return NextResponse.json(
        { success: false, error: "Stay not found" },
        { status: 404 }
      );
    }

    // Validate update data
    const updateSchema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      shortDescription: z.string().optional(),
      longDescription: z.string().optional(),
      image: z.string().url().optional(),
      gallery: z.array(z.string()).optional(),
      location: z.string().min(1).optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      pricePerNight: z.number().min(0).optional(),
      type: z.string().min(1).optional(),
      amenities: z.array(z.string()).optional(),
      maxGuests: z.number().min(1).optional(),
      rooms: z.number().min(1).optional(),
      status: z.enum(["PUBLISHED", "DRAFT", "HIDDEN"]).optional(),
      isFeatured: z.boolean().optional(),
      rankingScore: z.number().optional(),
      // Affiliate fields
      affiliateMatchName: z.string().optional().nullable(),
      affiliateProvider: z.string().optional().nullable(),
      affiliateDeepLink: z.string().url().optional().nullable(),
      autoMatchEnabled: z.boolean().optional(),
      // Experience tags
      experienceTags: z.array(z.string()).optional(),
    });

    const validatedData = updateSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.shortDescription !== undefined) updateData.shortDescription = validatedData.shortDescription;
    if (validatedData.longDescription !== undefined) updateData.longDescription = validatedData.longDescription;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.gallery !== undefined) updateData.gallery = JSON.stringify(validatedData.gallery);
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.lat !== undefined) updateData.lat = validatedData.lat;
    if (validatedData.lng !== undefined) updateData.lng = validatedData.lng;
    if (validatedData.lat !== undefined && validatedData.lng !== undefined) {
      updateData.coordinates = JSON.stringify({ lat: validatedData.lat, lng: validatedData.lng });
    }
    if (validatedData.pricePerNight !== undefined) updateData.pricePerNight = validatedData.pricePerNight;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.amenities !== undefined) updateData.amenities = validatedData.amenities.join(",");
    if (validatedData.maxGuests !== undefined) updateData.maxGuests = validatedData.maxGuests;
    if (validatedData.rooms !== undefined) updateData.rooms = validatedData.rooms;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.isFeatured !== undefined) updateData.isFeatured = validatedData.isFeatured;
    if (validatedData.rankingScore !== undefined) updateData.rankingScore = validatedData.rankingScore;
    
    // Affiliate fields
    if (validatedData.affiliateMatchName !== undefined) updateData.affiliateMatchName = validatedData.affiliateMatchName;
    if (validatedData.affiliateProvider !== undefined) updateData.affiliateProvider = validatedData.affiliateProvider;
    if (validatedData.affiliateDeepLink !== undefined) updateData.affiliateDeepLink = validatedData.affiliateDeepLink;
    if (validatedData.autoMatchEnabled !== undefined) updateData.autoMatchEnabled = validatedData.autoMatchEnabled;
    
    // Experience tags
    if (validatedData.experienceTags !== undefined) {
      updateData.experienceTags = JSON.stringify(validatedData.experienceTags);
    }

    const stay = await prisma.stay.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: stay,
      message: "Stay updated successfully",
    });
  } catch (error) {
    console.error("Error updating stay:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update stay" },
      { status: 500 }
    );
  }
}

// DELETE /api/stays/[slug] - Delete stay
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const existingStay = await prisma.stay.findUnique({ where: { slug } });
    if (!existingStay) {
      return NextResponse.json(
        { success: false, error: "Stay not found" },
        { status: 404 }
      );
    }

    await prisma.stay.delete({ where: { slug } });

    return NextResponse.json({
      success: true,
      message: "Stay deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stay:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete stay" },
      { status: 500 }
    );
  }
}

