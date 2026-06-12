import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sourceType = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Prisma.StayWhereInput = {
      status: 'PUBLISHED',
    };

    if (type) {
      where.type = type;
    }

    if (sourceType) {
      where.sourceType = sourceType;
    }

    const [stays, total] = await Promise.all([
      prisma.stay.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { isFeatured: 'desc' },
          { rankingScore: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.stay.count({ where }),
    ]);

    // Format the response
    const formattedStays = stays.map(stay => {
      let gallery: string[] = [];
      try {
        gallery = stay.gallery ? JSON.parse(stay.gallery) : [];
      } catch {
        gallery = [];
      }

      let amenities: string[] = [];
      if (stay.amenities) {
        amenities = stay.amenities.split(',').map(a => a.trim());
      }

      return {
        id: stay.id,
        title: stay.title,
        slug: stay.slug,
        description: stay.description,
        shortDescription: stay.shortDescription,
        image: stay.image,
        images: gallery,
        location: stay.location,
        lat: stay.lat,
        lng: stay.lng,
        pricePerNight: stay.pricePerNight,
        priceFrom: stay.priceFrom,
        currency: stay.currency,
        type: stay.type,
        amenities: amenities,
        rating: stay.rating,
        reviewCount: stay.reviewCount,
        maxGuests: stay.maxGuests,
        rooms: stay.rooms,
        isFeatured: stay.isFeatured,
        sourceType: stay.sourceType,
        affiliateProvider: stay.affiliateProvider,
        affiliateDeepLink: stay.affiliateDeepLink,
        createdAt: stay.createdAt.toISOString(),
        updatedAt: stay.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedStays,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching stays:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
