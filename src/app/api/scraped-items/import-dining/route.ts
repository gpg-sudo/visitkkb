import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/scraped-items/import-dining
 * Import a scraped item into the Restaurant table
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
            name: z.string().optional(),
            description: z.string().optional(),
            type: z.string().optional(),
            cuisine: z.string().optional(),
            priceRange: z.string().optional(),
            specialties: z.string().optional(),
            isHalal: z.boolean().optional(),
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

        if (scrapedItem.category !== 'DINING') {
            return NextResponse.json(
                { success: false, error: 'This item is not a DINING category' },
                { status: 400 }
            );
        }

        // 2. Extract metadata
        interface MetaData {
            address?: string;
            lat?: number;
            lng?: number;
            suggestedType?: string;
            suggestedCuisine?: string;
            suggestedPriceRange?: string;
            priceLevel?: number;
            rating?: number;
            userRatingsTotal?: number;
        }
        let meta: MetaData = {};
        try {
            if (scrapedItem.metaJson) meta = JSON.parse(scrapedItem.metaJson) as MetaData;
        } catch { /* use empty meta */ }

        // Generate slug from title
        const name = data.name || scrapedItem.title || 'Untitled Restaurant';
        const slug = generateSlug(name);

        // 3. Check for existing restaurant with same slug or externalId
        const existing = await prisma.restaurant.findFirst({
            where: {
                OR: [
                    { slug },
                    { googlePlaceId: scrapedItem.externalId || '' },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'A restaurant with this name or external ID already exists',
                    existingRestaurantId: existing.id,
                },
                { status: 400 }
            );
        }

        // 4. Create Restaurant
        const restaurant = await prisma.restaurant.create({
            data: {
                name,
                slug,
                description: data.description || meta.address || 'No description available',
                image: '/images/dining/default.jpg', // Default image
                gallery: JSON.stringify([]),
                location: meta.address || 'Kuala Kubu Bharu',
                lat: meta.lat || null,
                lng: meta.lng || null,
                coordinates: meta.lat && meta.lng
                    ? JSON.stringify({ lat: meta.lat, lng: meta.lng })
                    : null,
                type: data.type || meta.suggestedType || 'RESTAURANT',
                cuisine: data.cuisine || meta.suggestedCuisine || 'Malaysian',
                cuisineTags: meta.suggestedCuisine
                    ? JSON.stringify([meta.suggestedCuisine])
                    : null,
                priceRange: data.priceRange || meta.suggestedPriceRange || '$$',
                priceLevel: meta.priceLevel || 2,
                specialties: data.specialties || '',
                hours: 'Hours not set',
                isHalal: data.isHalal || false,
                operatorId: data.operatorId || null,
                status: data.status || 'DRAFT',
                sourceType: 'GOOGLE_PLACES',
                googlePlaceId: scrapedItem.externalId || null,
                rating: meta.rating || 0,
                reviewCount: meta.userRatingsTotal || 0,
            },
        });

        // 5. Update ScrapedItem status
        await prisma.scrapedItem.update({
            where: { id: data.scrapedItemId },
            data: {
                status: 'IMPORTED',
                targetRecordId: restaurant.id,
            },
        });

        return NextResponse.json({
            success: true,
            data: restaurant,
            message: 'Restaurant imported successfully from scraped item',
        });
    } catch (error) {
        console.error('Error importing restaurant:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to import restaurant' },
            { status: 500 }
        );
    }
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
