import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/scraped-items/import-stay
 * Import a scraped item into the Stay table
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const importSchema = z.object({
            scrapedItemId: z.string(),
            // Override/mapping fields (all optional - defaults from metaJson)
            title: z.string().optional(),
            description: z.string().optional(),
            type: z.string().optional(),
            pricePerNight: z.number().optional(),
            maxGuests: z.number().optional(),
            rooms: z.number().optional(),
            status: z.enum(['PUBLISHED', 'DRAFT', 'HIDDEN']).optional(),
            operatorId: z.string().optional().nullable(),
        });

        const data = importSchema.parse(body);

        // 1. Get the scraped item
        const scrapedItem = await prisma.scrapedItem.findUnique({
            where: { id: data.scrapedItemId },
        });

        if (!scrapedItem) {
            return NextResponse.json(
                { success: false, error: 'Scraped item not found' },
                { status: 404 }
            );
        }

        if (scrapedItem.category !== 'STAY') {
            return NextResponse.json(
                { success: false, error: 'This item is not a STAY category' },
                { status: 400 }
            );
        }

        // 2. Extract metadata
        interface StayMetaData {
            address?: string;
            lat?: number;
            lng?: number;
            suggestedType?: string;
            suggestedPricePerNight?: number;
            suggestedMaxGuests?: number;
            rating?: number;
            userRatingsTotal?: number;
        }
        let meta: StayMetaData = {};
        try {
            if (scrapedItem.metaJson) meta = JSON.parse(scrapedItem.metaJson) as StayMetaData;
        } catch { /* use empty meta */ }

        // Generate slug from title
        const title = data.title || scrapedItem.title || 'Untitled Stay';
        const slug = generateSlug(title);

        // 3. Check for existing stay with same slug or externalId
        const existing = await prisma.stay.findFirst({
            where: {
                OR: [
                    { slug },
                    { externalPlaceId: scrapedItem.externalId || '' },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'A stay with this name or external ID already exists',
                    existingStayId: existing.id,
                },
                { status: 400 }
            );
        }

        // 4. Create Stay
        const stay = await prisma.stay.create({
            data: {
                title,
                slug,
                description: data.description || meta.address || 'No description available',
                image: '/images/stays/placeholder.jpg', // Default image
                gallery: JSON.stringify([]),
                location: meta.address || 'Kuala Kubu Bharu',
                lat: meta.lat || null,
                lng: meta.lng || null,
                coordinates: meta.lat && meta.lng
                    ? JSON.stringify({ lat: meta.lat, lng: meta.lng })
                    : null,
                pricePerNight: data.pricePerNight || meta.suggestedPricePerNight || 150,
                type: data.type || meta.suggestedType || 'HOTEL',
                amenities: '', // Can be filled later
                maxGuests: data.maxGuests || meta.suggestedMaxGuests || 2,
                rooms: data.rooms || 1,
                operatorId: data.operatorId || null,
                status: data.status || 'DRAFT',
                sourceType: 'GOOGLE_PLACES',
                externalPlaceId: scrapedItem.externalId || null,
                rating: meta.rating || 0,
                reviewCount: meta.userRatingsTotal || 0,
                priceFrom: data.pricePerNight || meta.suggestedPricePerNight || 150,
            },
        });

        // 5. Update ScrapedItem status
        await prisma.scrapedItem.update({
            where: { id: data.scrapedItemId },
            data: {
                status: 'IMPORTED',
                targetRecordId: stay.id,
            },
        });

        return NextResponse.json({
            success: true,
            data: stay,
            message: 'Stay imported successfully from scraped item',
        });
    } catch (error) {
        console.error('Error importing stay:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to import stay' },
            { status: 500 }
        );
    }
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
