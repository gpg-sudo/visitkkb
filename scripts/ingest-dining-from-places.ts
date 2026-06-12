/**
 * Google Places Dining Scraper/Ingestion Script
 * 
 * This script fetches dining places (restaurants, cafes, etc.) in Kuala Kubu Bharu
 * from Google Places API and stores them in ScrapedItem table for admin review.
 * 
 * Usage:
 *   npx tsx scripts/ingest-dining-from-places.ts
 */

import prisma from '../src/lib/prisma';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

// KKB coordinates
const KKB_CENTER = {
    lat: 3.5728,
    lng: 101.6411,
};

const SEARCH_RADIUS = 5000; // 5km radius

// Place types to search for dining
const DINING_TYPES = [
    'restaurant',
    'cafe',
    'bakery',
    'meal_takeaway',
    'food',
];

interface GooglePlace {
    place_id: string;
    name: string;
    vicinity: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    opening_hours?: {
        open_now?: boolean;
    };
    photos?: Array<{
        photo_reference: string;
        height: number;
        width: number;
    }>;
    business_status?: string;
}

/**
 * Fetch places from Google Places Nearby Search API
 */
async function fetchNearbyPlaces(type: string): Promise<GooglePlace[]> {
    if (!GOOGLE_PLACES_API_KEY) {
        throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY is not set in environment variables');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.append('location', `${KKB_CENTER.lat},${KKB_CENTER.lng}`);
    url.searchParams.append('radius', SEARCH_RADIUS.toString());
    url.searchParams.append('type', type);
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

    console.log(`Fetching places for type: ${type}...`);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data.results || [];
}

/**
 * Convert price_level (0-4) to price range string
 */
function getPriceRange(priceLevel?: number): string {
    if (!priceLevel || priceLevel === 0) return '$';
    if (priceLevel === 1) return '$';
    if (priceLevel === 2) return '$$';
    if (priceLevel === 3) return '$$$';
    return '$$$$';
}

/**
 * Determine cuisine type from Google Place types
 */
function getCuisineFromTypes(types: string[]): string {
    // Simple mapping - can be enhanced
    if (types.includes('chinese_restaurant')) return 'Chinese';
    if (types.includes('indian_restaurant')) return 'Indian';
    if (types.includes('japanese_restaurant')) return 'Japanese';
    if (types.includes('italian_restaurant')) return 'Italian';
    if (types.includes('cafe')) return 'Cafe';
    if (types.includes('bakery')) return 'Bakery';
    return 'Malaysian'; // Default
}

/**
 * Determine restaurant type from Google Place types
 */
function getRestaurantType(types: string[]): string {
    if (types.includes('cafe')) return 'CAFE';
    if (types.includes('bakery')) return 'BAKERY';
    if (types.includes('meal_takeaway')) return 'STREET_FOOD';
    return 'RESTAURANT';
}

/**
 * Main ingestion function
 */
async function ingestDiningFromGooglePlaces() {
    console.log('=== Google Places Dining Ingestion ===\n');

    // 1. Find or create ScrapedSource
    let source = await prisma.scrapedSource.findFirst({
        where: {
            name: 'Google Places - Dining',
            type: 'DINING',
        },
    });

    if (!source) {
        console.log('Creating new ScrapedSource for Google Places Dining...');
        source = await prisma.scrapedSource.create({
            data: {
                name: 'Google Places - Dining',
                type: 'DINING',
                baseUrl: 'https://maps.googleapis.com/maps/api/place',
                active: true,
                notes: 'Dining places in KKB sourced from Google Places API',
            },
        });
        console.log(`✓ Created ScrapedSource: ${source.id}\n`);
    } else {
        console.log(`✓ Using existing ScrapedSource: ${source.id}\n`);
    }

    // 2. Fetch places from Google Places API
    const allPlaces: GooglePlace[] = [];

    for (const type of DINING_TYPES) {
        try {
            const places = await fetchNearbyPlaces(type);
            console.log(`  Found ${places.length} places for type "${type}"`);
            allPlaces.push(...places);

            // Rate limiting: wait 200ms between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            console.error(`  Error fetching type "${type}":`, error);
        }
    }

    // Remove duplicates by place_id
    const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.place_id, place])).values()
    );

    console.log(`\n✓ Total unique places found: ${uniquePlaces.length}\n`);

    // 3. Store each place as ScrapedItem
    let createdCount = 0;
    let skippedCount = 0;

    for (const place of uniquePlaces) {
        try {
            // Check if already exists
            const existing = await prisma.scrapedItem.findFirst({
                where: {
                    sourceId: source.id,
                    externalId: place.place_id,
                },
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Prepare metadata
            const metaJson = {
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                priceLevel: place.price_level || 1,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                address: place.vicinity,
                types: place.types,
                businessStatus: place.business_status,
                photos: place.photos?.slice(0, 5) || [], // Limit to 5 photos

                // Suggested mapping values
                suggestedType: getRestaurantType(place.types),
                suggestedCuisine: getCuisineFromTypes(place.types),
                suggestedPriceRange: getPriceRange(place.price_level),
            };

            // Create ScrapedItem
            await prisma.scrapedItem.create({
                data: {
                    sourceId: source.id,
                    category: 'DINING',
                    externalId: place.place_id,
                    externalUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                    title: place.name,
                    rawContent: JSON.stringify(place),
                    metaJson: JSON.stringify(metaJson),
                    targetModel: 'Restaurant',
                    status: 'NEW',
                },
            });

            createdCount++;
            console.log(`  ✓ Imported: ${place.name} (${place.rating || 'N/A'}★)`);
        } catch (error) {
            console.error(`  ✗ Error importing "${place.name}":`, error);
        }
    }

    console.log('\n=== Ingestion Summary ===');
    console.log(`Total places found: ${uniquePlaces.length}`);
    console.log(`New items created: ${createdCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log('\n✓ Dining ingestion complete!');
    console.log('→ Check admin dashboard to review and import these items.\n');
}

// Run the script
ingestDiningFromGooglePlaces()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
