import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/ingestion/trigger
 * Trigger a data ingestion job
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const triggerSchema = z.object({
            type: z.enum(['GOOGLE_PLACES_DINING', 'GOOGLE_PLACES_STAYS', 'GOOGLE_PLACES_ALL']),
            triggeredBy: z.string().optional(),
        });

        const data = triggerSchema.parse(body);

        // Create ingestion job record
        const job = await prisma.ingestionJob.create({
            data: {
                type: data.type,
                status: 'PENDING',
                triggeredBy: data.triggeredBy || 'MANUAL',
                parameters: JSON.stringify({}),
            },
        });

        // Start the ingestion process asynchronously
        // We don't await it so we can return immediately
        runIngestion(job.id, data.type).catch(error => {
            console.error('Ingestion error:', error);
            prisma.ingestionJob.update({
                where: { id: job.id },
                data: {
                    status: 'FAILED',
                    errorCount: 1,
                    errors: JSON.stringify({ message: error.message }),
                    completedAt: new Date(),
                },
            }).catch(console.error);
        });

        return NextResponse.json({
            success: true,
            data: job,
            message: 'Ingestion job started',
        });
    } catch (error) {
        console.error('Error triggering ingestion:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to trigger ingestion' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ingestion/trigger
 * Get list of recent ingestion jobs
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const jobs = await prisma.ingestionJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        const total = await prisma.ingestionJob.count();

        return NextResponse.json({
            success: true,
            data: jobs,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + jobs.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching ingestion jobs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ingestion jobs' },
            { status: 500 }
        );
    }
}

/**
 * Run the actual ingestion logic
 */
async function runIngestion(jobId: string, type: string) {
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_PLACES_API_KEY) {
        throw new Error('GOOGLE_PLACES_API_KEY is not configured');
    }

    await prisma.ingestionJob.update({
        where: { id: jobId },
        data: {
            status: 'RUNNING',
            startedAt: new Date(),
        },
    });

    const KKB_CENTER = { lat: 3.5728, lng: 101.6411 };
    let totalFetched = 0;
    let totalImported = 0;
    const errors: Array<{ type?: string; place?: string; error: string }> = [];

    try {
        // Determine what to scrape
        const typesToScrape = type === 'GOOGLE_PLACES_ALL'
            ? ['DINING', 'STAYS']
            : [type.replace('GOOGLE_PLACES_', '')];

        for (const scrapeType of typesToScrape) {
            const config = scrapeType === 'DINING'
                ? { types: ['restaurant', 'cafe', 'bakery'], radius: 5000, sourceType: 'DINING' }
                : { types: ['lodging', 'hotel', 'campground'], radius: 10000, sourceType: 'STAY' };

            // Find or create source
            let source = await prisma.scrapedSource.findFirst({
                where: { name: `Google Places - ${scrapeType}`, type: config.sourceType },
            });

            if (!source) {
                source = await prisma.scrapedSource.create({
                    data: {
                        name: `Google Places - ${scrapeType}`,
                        type: config.sourceType,
                        baseUrl: 'https://maps.googleapis.com/maps/api/place',
                        active: true,
                    },
                });
            }

            // Fetch from Google Places
            for (const placeType of config.types) {
                try {
                    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
                    url.searchParams.append('location', `${KKB_CENTER.lat},${KKB_CENTER.lng}`);
                    url.searchParams.append('radius', config.radius.toString());
                    url.searchParams.append('type', placeType);
                    url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

                    const response = await fetch(url.toString());
                    const data = await response.json();

                    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                        errors.push({ type: placeType, error: data.error_message });
                        continue;
                    }

                    const places = data.results || [];
                    totalFetched += places.length;

                    // Import each place
                    for (const place of places) {
                        try {
                            // Check if already exists
                            const existing = await prisma.scrapedItem.findFirst({
                                where: { sourceId: source.id, externalId: place.place_id },
                            });

                            if (existing) continue;

                            // Create scraped item
                            await prisma.scrapedItem.create({
                                data: {
                                    sourceId: source.id,
                                    category: config.sourceType,
                                    externalId: place.place_id,
                                    externalUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                                    title: place.name,
                                    rawContent: JSON.stringify(place),
                                    metaJson: JSON.stringify({
                                        rating: place.rating || 0,
                                        userRatingsTotal: place.user_ratings_total || 0,
                                        priceLevel: place.price_level || 1,
                                        lat: place.geometry.location.lat,
                                        lng: place.geometry.location.lng,
                                        address: place.vicinity,
                                        types: place.types,
                                        businessStatus: place.business_status,
                                        photos: place.photos?.slice(0, 5) || [],
                                    }),
                                    targetModel: config.sourceType === 'DINING' ? 'Restaurant' : 'Stay',
                                    status: 'NEW',
                                },
                            });

                            totalImported++;
                        } catch (err: unknown) {
                            errors.push({ place: place.name, error: err instanceof Error ? err.message : String(err) });
                        }
                    }

                    // Rate limiting
                    await new Promise(resolve => setTimeout(resolve, 200));
                } catch (err: unknown) {
                    errors.push({ type: placeType, error: err instanceof Error ? err.message : String(err) });
                }
            }
        }

        // Update job as completed
        await prisma.ingestionJob.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                totalItems: totalFetched,
                processedItems: totalFetched,
                successCount: totalImported,
                errorCount: errors.length,
                errors: errors.length > 0 ? JSON.stringify(errors) : undefined,
                resultSummary: `Fetched ${totalFetched} items, imported ${totalImported} new items`,
                completedAt: new Date(),
            },
        });
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        // Update job as failed
        await prisma.ingestionJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                errorCount: errors.length + 1,
                errors: JSON.stringify([...errors, { message: errMsg }]),
                resultSummary: `Failed: ${errMsg}`,
                completedAt: new Date(),
            },
        });
        throw error;
    }
}
