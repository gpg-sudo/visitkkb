import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

// Initialize Prisma
const prisma = new PrismaClient();

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
const KKB_CENTER = { lat: 3.5728, lng: 101.6411 };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SEARCH_RADIUS = 15000; // 15km

interface GooglePlace {
    place_id: string;
    name: string;
    vicinity?: string;
    formatted_address?: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    types: string[];
    photos?: {
        photo_reference: string;
        width: number;
        height: number;
    }[];
    price_level?: number;
    business_status?: string;
}

interface SyncResult {
    success: boolean;
    totalFetched: number;
    created: number;
    updated: number;
    skipped: number;
    finalCount: number;
    errors: unknown[];
    error?: string;
}

async function fetchPlacesForQuery(query: string): Promise<GooglePlace[]> {
    if (!GOOGLE_API_KEY) {
        console.error('❌ GOOGLE_PLACES_API_KEY is missing');
        return [];
    }

    const places: GooglePlace[] = [];
    let nextPageToken: string | undefined = undefined;

    // Try up to 2 pages per query
    for (let i = 0; i < 2; i++) {
        try {
            // Use Text Search for better keyword matching
            const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
            url.searchParams.append('query', `${query} near Kuala Kubu Bharu`);
            url.searchParams.append('key', GOOGLE_API_KEY);

            if (nextPageToken) {
                url.searchParams.append('pagetoken', nextPageToken);
                // Google requires a short delay before using the next_page_token
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            const response = await fetch(url.toString());
            const data = await response.json();

            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                console.warn(`⚠️ Google API warning for query "${query}":`, data.status, data.error_message);
                break;
            }

            if (data.results && Array.isArray(data.results)) {
                places.push(...data.results);
            }

            nextPageToken = data.next_page_token;
            if (!nextPageToken) break;

        } catch (error) {
            console.error(`❌ Error fetching query "${query}":`, error);
            break;
        }
    }

    return places;
}

async function fetchAllPlaces(): Promise<GooglePlace[]> {
    const queries = [
        "hotel",
        "homestay",
        "guest house",
        "resort",
        "camping",
        "chalet"
    ];

    const allPlacesMap = new Map<string, GooglePlace>();

    for (const query of queries) {
        console.log(`🔍 Fetching "${query}"...`);
        const results = await fetchPlacesForQuery(query);
        console.log(`   Found ${results.length} results for "${query}"`);

        for (const place of results) {
            if (place.business_status === 'CLOSED_PERMANENTLY') continue;
            allPlacesMap.set(place.place_id, place);
        }
    }

    return Array.from(allPlacesMap.values());
}

function determineStayType(types: string[], name: string): string {
    const n = name.toLowerCase();
    if (n.includes('villa')) return 'VILLA';
    if (n.includes('chalet')) return 'CHALET';
    if (n.includes('homestay')) return 'HOMESTAY';
    if (n.includes('resort')) return 'RESORT';
    if (n.includes('camp') || n.includes('glamp')) return 'CAMPING';

    if (types.includes('campground')) return 'CAMPING';
    if (types.includes('resort')) return 'RESORT';
    return 'HOTEL'; // Default
}

function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    if (!GOOGLE_API_KEY) return '';
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

export async function syncStaysFromGoogle(): Promise<SyncResult> {
    console.log('🚀 Starting Google Stays Sync...');

    let createdCount = 0;
    let updatedCount = 0;
    const skippedCount = 0;
    const errors: unknown[] = [];
    let totalFetched = 0;

    try {
        // 1. Fetch Real Data
        const allPlaces = await fetchAllPlaces();
        totalFetched = allPlaces.length;
        console.log(`📦 Total unique places found: ${totalFetched}`);

        // 2. Upsert Real Data
        for (const place of allPlaces) {
            try {
                const name = place.name;
                // Basic slugify
                const slug = slugify(name, { lower: true, strict: true });

                const stayType = determineStayType(place.types, name);
                const address = place.formatted_address || place.vicinity || 'Kuala Kubu Bharu';
                const rating = place.rating || 0;
                const reviewCount = place.user_ratings_total || 0;

                // Photos
                let thumbnailImage = '';
                let gallery: string[] = [];
                if (place.photos && place.photos.length > 0) {
                    thumbnailImage = getPhotoUrl(place.photos[0].photo_reference, 800);
                    gallery = place.photos.slice(0, 5).map(p => getPhotoUrl(p.photo_reference, 1200));
                }

                const stayData = {
                    title: name,
                    slug: slug,
                    description: `${name} in ${address}. Rated ${rating}★ by ${reviewCount} travelers.`,
                    shortDescription: `${stayType.toLowerCase()} in KKB`,
                    image: thumbnailImage,
                    gallery: JSON.stringify(gallery),
                    location: address,
                    coordinates: JSON.stringify(place.geometry.location),
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    pricePerNight: place.price_level ? place.price_level * 100 : 150, // Estimate
                    type: stayType,
                    amenities: place.types.filter(t => !['lodging', 'point_of_interest', 'establishment'].includes(t)).join(', '),
                    status: 'PUBLISHED',
                    sourceType: 'GOOGLE_PLACES',
                    externalPlaceId: place.place_id,
                    rating: rating,
                    reviewCount: reviewCount,
                    currency: 'MYR',
                    autoMatchEnabled: true,
                    affiliateDeepLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                    maxGuests: 2,
                    rooms: 1,
                    minNights: 1,
                    maxNights: 30,
                };

                // Check existing by externalPlaceId OR slug
                const existing = await prisma.stay.findFirst({
                    where: {
                        OR: [
                            { externalPlaceId: place.place_id },
                            { slug: slug }
                        ]
                    }
                });

                if (existing) {
                    await prisma.stay.update({
                        where: { id: existing.id },
                        data: {
                            ...stayData,
                            updatedAt: new Date(),
                        }
                    });
                    updatedCount++;
                } else {
                    await prisma.stay.create({ data: stayData });
                    createdCount++;
                }

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error(`Failed to sync place ${place.name}:`, errorMessage);
                errors.push({ name: place.name, error: errorMessage });
            }
        }

        // 3. Safety Net: Ensure at least 10 records
        const totalStays = await prisma.stay.count();
        console.log(`📊 Current DB Count: ${totalStays}`);

        if (totalStays < 10) {
            console.warn(`⚠️ Only ${totalStays} stays found. Seeding test stays to reach 10.`);
            const needed = 10 - totalStays;

            for (let i = 1; i <= needed; i++) {
                const name = `Test Stay ${i} - KKB`;
                const slug = slugify(name, { lower: true, strict: true });

                const testData = {
                    title: name,
                    slug: slug,
                    description: "Test stay entry for VisitKKB database wiring.",
                    shortDescription: "Test Entry",
                    location: "Kuala Kubu Bharu",
                    type: "HOMESTAY",
                    pricePerNight: 100 + (i * 10),
                    rating: 4.0,
                    reviewCount: 0,
                    sourceType: "TEST_SEED",
                    status: "PUBLISHED",
                    currency: 'MYR',
                    amenities: "Wifi, Parking",
                    image: "", // Placeholder will be used by frontend
                    gallery: "[]",
                    coordinates: JSON.stringify(KKB_CENTER),
                    lat: KKB_CENTER.lat,
                    lng: KKB_CENTER.lng,
                    maxGuests: 4,
                    rooms: 2,
                    minNights: 1,
                    maxNights: 14,
                };

                // Upsert test data
                const existingTest = await prisma.stay.findFirst({ where: { slug } });
                if (!existingTest) {
                    await prisma.stay.create({ data: testData });
                    createdCount++;
                    console.log(`   + Created test stay: ${name}`);
                }
            }
        }

        const finalCount = await prisma.stay.count();

        return {
            success: true,
            totalFetched: totalFetched,
            created: createdCount,
            updated: updatedCount,
            skipped: skippedCount,
            finalCount: finalCount,
            errors: errors
        };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Sync failed:', errorMessage);
        return {
            success: false,
            error: errorMessage,
            totalFetched: totalFetched,
            created: createdCount,
            updated: updatedCount,
            skipped: skippedCount,
            finalCount: await prisma.stay.count(),
            errors: [errorMessage]
        };
    } finally {
        await prisma.$disconnect();
    }
}

// Allow running directly
if (require.main === module) {
    syncStaysFromGoogle()
        .then(res => console.log('Done:', res))
        .catch(err => console.error('Fatal:', err));
}
