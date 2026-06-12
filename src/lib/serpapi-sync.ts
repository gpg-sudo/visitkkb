/**
 * SerpAPI Sync Module - Hardened Version
 * 
 * Features:
 * - API key validation from DB or ENV
 * - HTTP call with timeout and retry/backoff
 * - Defensive parsing of SerpAPI responses
 * - Per-item error isolation
 * - Comprehensive logging
 */

import { getApiKey } from '@/lib/api-keys';
import prisma from '@/lib/prisma';
import { mapSerpToRestaurant, mapSerpToStay, type SerpApiPlace } from '@/lib/serpapiMappers';
import { invalidateMapPinsCache } from '@/lib/mapPins';

// KKB coordinates
const KKB_LAT = 3.5410;
const KKB_LNG = 101.6900;

interface SyncResult {
    success: boolean;
    totalFetched: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    errors: Array<{ item: string; error: string }>;
    logId?: string;
    runId?: string;
}

/**
 * Get SerpAPI key from database or environment
 */
async function getSerpapiKey(): Promise<string | null> {
    console.log('🔑 Retrieving SerpAPI key...');

    try {
        // Try database first (encrypted)
        const dbKey = await getApiKey('SERPAPI_KEY');
        if (dbKey) {
            console.log('✅ SerpAPI key retrieved from database');
            return dbKey;
        }
    } catch (error) {
        console.warn('⚠️ Failed to retrieve key from database, falling back to ENV:', error);
    }

    // Fallback to environment variable
    const envKey = process.env.SERPAPI_KEY;
    if (envKey) {
        console.log('✅ SerpAPI key retrieved from environment');
        return envKey;
    }

    console.error('❌ SERPAPI_KEY not found in database or environment');
    return null;
}

/**
 * Fetch from SerpAPI with timeout and retry logic
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 3,
    timeoutMs = 30000
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🌐 HTTP attempt ${attempt}/${maxRetries}: ${url.substring(0, 100)}...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log(`📊 HTTP ${response.status} ${response.statusText}`);

            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;
                throw new Error(
                    `Rate limit exceeded. Retry after ${waitSeconds} seconds. ` +
                    `Please wait before syncing again.`
                );
            }

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'Unable to read error body');
                console.error(`❌ HTTP ${response.status} error body:`, errorBody.substring(0, 500));
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}. ` +
                    `Body: ${errorBody.substring(0, 200)}`
                );
            }

            return response;
        } catch (error: unknown) {
            const e = error as Error;
            lastError = e;
            console.error(`❌ Attempt ${attempt} failed:`, e.message);

            if (attempt < maxRetries && e.name !== 'AbortError') {
                const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                console.log(`⏳ Backing off for ${backoffMs}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            }
        }
    }

    throw lastError || new Error('All retry attempts failed');
}

/**
 * Search for places using SerpAPI Google Maps
 */
export async function searchPlaces(
    query: string,
    lat: number = KKB_LAT,
    lng: number = KKB_LNG,
    radius?: number
): Promise<SerpApiPlace[]> {
    const apiKey = await getSerpapiKey();

    if (!apiKey) {
        throw new Error(
            'SERPAPI_KEY_MISSING: Configure SerpAPI key in Dashboard → API & Integrations.'
        );
    }

    try {
        const params = new URLSearchParams({
            engine: 'google_maps',
            q: query,
            ll: `@${lat},${lng},${radius || 15}z`,
            type: 'search',
            api_key: apiKey,
        });

        const url = `https://serpapi.com/search?${params.toString()}`;
        console.log('🔍 SerpAPI request:', { query, lat, lng, radius });

        const response = await fetchWithRetry(url);
        const json = await response.json();

        console.log('📦 SerpAPI response keys:', Object.keys(json));
        console.log('📦 First 20KB of response:', JSON.stringify(json).substring(0, 20000));

        // Defensive parsing: try multiple possible result keys
        const places =
            json.local_results ||
            json.results ||
            json.places ||
            json.organic_results ||
            [];

        if (!Array.isArray(places)) {
            console.error('❌ SerpAPI response is not an array:', typeof places);

            // Log to IntegrationLog for debugging
            await prisma.integrationLog.create({
                data: {
                    provider: 'SERPAPI',
                    operation: 'SEARCH_PLACES_ERROR',
                    status: 'FAILED',
                    errorMessage: 'Response payload is not an array',
                    errorDetails: JSON.stringify({
                        responseKeys: Object.keys(json),
                        placesType: typeof places,
                        sample: JSON.stringify(json).substring(0, 1000),
                    }),
                },
            });

            throw new Error(
                `Invalid SerpAPI response format. Expected array, got ${typeof places}. ` +
                `Response keys: ${Object.keys(json).join(', ')}`
            );
        }

        console.log(`✅ Found ${places.length} places from SerpAPI`);
        return places as SerpApiPlace[];
    } catch (error: unknown) {
        console.error('❌ SerpAPI search error:', error);
        throw error;
    }
}

/**
 * Get place details by place_id
 */
export async function getPlaceDetails(placeId: string): Promise<Record<string, unknown>> {
    const apiKey = await getSerpapiKey();

    if (!apiKey) {
        throw new Error('SERPAPI_KEY not configured');
    }

    try {
        const params = new URLSearchParams({
            engine: 'google_maps',
            type: 'place',
            place_id: placeId,
            api_key: apiKey,
        });

        const url = `https://serpapi.com/search?${params.toString()}`;
        const response = await fetchWithRetry(url);
        return await response.json();
    } catch (error: unknown) {
        console.error('❌ SerpAPI place details error:', error);
        throw new Error(`Failed to get place details: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Sync restaurants from SerpAPI
 */
export async function syncRestaurantsFromSerpApi(
    query: string = 'restaurants in Kuala Kubu Bharu',
    triggeredBy?: string
): Promise<SyncResult> {
    const runId = `run-${Date.now()}`;
    const logId = await createIntegrationLog('SERPAPI', 'SYNC_RESTAURANTS', triggeredBy);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: Array<{ item: string; error: string }> = [];

    try {
        console.log('🍽️ Starting restaurant sync:', { query, runId });

        // Validate API key first
        const apiKey = await getSerpapiKey();
        if (!apiKey) {
            await updateIntegrationLog(logId, {
                status: 'FAILED',
                errorMessage: 'SERPAPI_KEY_MISSING',
            });

            return {
                success: false,
                totalFetched: 0,
                created: 0,
                updated: 0,
                skipped: 0,
                failed: 0,
                errors: [{
                    item: 'API_KEY',
                    error: 'Configure SerpAPI key in Dashboard → API & Integrations.'
                }],
                logId,
                runId,
            };
        }

        const places = await searchPlaces(query);

        console.log(`📋 Processing ${places.length} restaurants...`);

        for (const place of places) {
            const itemName = place.title || place.name || 'Unknown';

            try {
                console.log(`\n🔄 Processing: ${itemName}`);
                console.log('   Input data:', JSON.stringify(place).substring(0, 200));

                // Map to Prisma-safe format
                const mapped = mapSerpToRestaurant(place);

                if (!mapped) {
                    console.log('   ⏭️  Skipped: mapper returned null');
                    skipped++;
                    continue;
                }

                console.log('   ✅ Mapped successfully');
                console.log('   Data:', {
                    name: mapped.name,
                    slug: mapped.slug,
                    serpPlaceId: mapped.serpPlaceId,
                    hasImage: !!mapped.image,
                    hasGallery: !!mapped.gallery,
                });

                // Upsert using serpPlaceId as unique constraint
                const result = await prisma.restaurant.upsert({
                    where: { serpPlaceId: mapped.serpPlaceId },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    create: mapped as any,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    update: mapped as any,
                });

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    created++;
                    console.log('   ✨ Created new restaurant');
                } else {
                    updated++;
                    console.log('   🔄 Updated existing restaurant');
                }

                // Create or update MapPin for this restaurant
                if (result.lat && result.lng) {
                    try {
                        await createOrUpdateMapPinForRestaurant(result);
                        console.log('   📍 Created/updated map pin');
                    } catch (pinError: unknown) {
                        console.warn(`   ⚠️ Failed to create map pin: ${pinError instanceof Error ? pinError.message : String(pinError)}`);
                        // Don't fail the whole sync if pin creation fails
                    }
                }
            } catch (error: unknown) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                errors.push({ item: itemName, error: errorMsg });
                console.error(`   ❌ Failed to process ${itemName}:`, errorMsg);
                console.error('   Stack:', error instanceof Error ? error.stack : undefined);
            }
        }

        await updateIntegrationLog(logId, {
            status: failed === places.length ? 'FAILED' : 'SUCCESS',
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
        });

        // Invalidate map pins cache
        invalidateMapPinsCache();

        // Invalidate cache (Next.js revalidation)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/dining`, {
                method: 'POST',
            }).catch(() => console.log('⚠️ Cache revalidation skipped (endpoint may not exist)'));
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/explore-map`, {
                method: 'POST',
            }).catch(() => console.log('⚠️ Map cache revalidation skipped'));
        } catch (e) {
            console.log('⚠️ Cache revalidation failed:', e);
        }

        console.log('\n📊 Sync Summary:', {
            runId,
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
            errorCount: errors.length,
        });

        return {
            success: failed < places.length,
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
            errors,
            logId,
            runId,
        };
    } catch (error: unknown) {
        console.error('❌ Restaurant sync failed:', error);
        const errMsg = error instanceof Error ? error.message : String(error);

        await updateIntegrationLog(logId, {
            status: 'FAILED',
            errorMessage: errMsg,
            errorDetails: JSON.stringify({
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined,
            }),
        });

        return {
            success: false,
            totalFetched: 0,
            created,
            updated,
            skipped,
            failed,
            errors: [{ item: 'SYNC_ERROR', error: errMsg }],
            logId,
            runId,
        };
    }
}

/**
 * Sync stays/hotels from SerpAPI
 */
export async function syncStaysFromSerpApi(
    query: string = 'hotels in Kuala Kubu Bharu',
    triggeredBy?: string
): Promise<SyncResult> {
    const runId = `run-${Date.now()}`;
    const logId = await createIntegrationLog('SERPAPI', 'SYNC_STAYS', triggeredBy);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: Array<{ item: string; error: string }> = [];

    try {
        console.log('🏨 Starting stays sync:', { query, runId });

        // Validate API key first
        const apiKey = await getSerpapiKey();
        if (!apiKey) {
            await updateIntegrationLog(logId, {
                status: 'FAILED',
                errorMessage: 'SERPAPI_KEY_MISSING',
            });

            return {
                success: false,
                totalFetched: 0,
                created: 0,
                updated: 0,
                skipped: 0,
                failed: 0,
                errors: [{
                    item: 'API_KEY',
                    error: 'Configure SerpAPI key in Dashboard → API & Integrations.'
                }],
                logId,
                runId,
            };
        }

        const places = await searchPlaces(query);

        console.log(`📋 Processing ${places.length} stays...`);

        for (const place of places) {
            const itemName = place.title || place.name || 'Unknown';

            try {
                console.log(`\n🔄 Processing: ${itemName}`);

                // Map to Prisma-safe format
                const mapped = mapSerpToStay(place);

                if (!mapped) {
                    console.log('   ⏭️  Skipped: mapper returned null');
                    skipped++;
                    continue;
                }

                console.log('   ✅ Mapped successfully');

                // Upsert using serpPlaceId as unique constraint
                const result = await prisma.stay.upsert({
                    where: { serpPlaceId: mapped.serpPlaceId },
                    create: mapped,
                    update: mapped,
                });

                if (result.createdAt.getTime() === result.updatedAt.getTime()) {
                    created++;
                    console.log('   ✨ Created new stay');
                } else {
                    updated++;
                    console.log('   🔄 Updated existing stay');
                }

                // Create or update MapPin for this stay
                if (result.lat && result.lng) {
                    try {
                        await createOrUpdateMapPinForStay(result);
                        console.log('   📍 Created/updated map pin');
                    } catch (pinError: unknown) {
                        console.warn(`   ⚠️ Failed to create map pin: ${pinError instanceof Error ? pinError.message : String(pinError)}`);
                        // Don't fail the whole sync if pin creation fails
                    }
                }
            } catch (error: unknown) {
                failed++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                errors.push({ item: itemName, error: errorMsg });
                console.error(`   ❌ Failed to process ${itemName}:`, errorMsg);
            }
        }

        await updateIntegrationLog(logId, {
            status: failed === places.length ? 'FAILED' : 'SUCCESS',
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
        });

        // Invalidate map pins cache
        invalidateMapPinsCache();

        // Invalidate cache
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/stays`, {
                method: 'POST',
            }).catch(() => console.log('⚠️ Cache revalidation skipped'));
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/revalidate?path=/explore-map`, {
                method: 'POST',
            }).catch(() => console.log('⚠️ Map cache revalidation skipped'));
        } catch (e) {
            console.log('⚠️ Cache revalidation failed:', e);
        }

        console.log('\n📊 Sync Summary:', {
            runId,
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
            errorCount: errors.length,
        });

        return {
            success: failed < places.length,
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
            errors,
            logId,
            runId,
        };
    } catch (error: unknown) {
        console.error('❌ Stays sync failed:', error);
        const errMsg = error instanceof Error ? error.message : String(error);

        await updateIntegrationLog(logId, {
            status: 'FAILED',
            errorMessage: errMsg,
        });

        return {
            success: false,
            totalFetched: 0,
            created,
            updated,
            skipped,
            failed,
            errors: [{ item: 'SYNC_ERROR', error: errMsg }],
            logId,
            runId,
        };
    }
}

/**
 * Sync map pins from SerpAPI
 */
export async function syncMapPinsFromSerpApi(
    query: string = 'tourist attractions in Kuala Kubu Bharu',
    triggeredBy?: string
): Promise<SyncResult> {
    const runId = `run-${Date.now()}`;
    const logId = await createIntegrationLog('SERPAPI', 'SYNC_MAP_PINS', triggeredBy);

    let created = 0;
    const updated = 0;
    let skipped = 0;
    let failed = 0;
    const errors: Array<{ item: string; error: string }> = [];

    try {
        const places = await searchPlaces(query);

        for (const place of places) {
            const itemName = place.title || place.name || 'Unknown';

            try {
                if (!place.place_id || !itemName || !place.latitude || !place.longitude) {
                    skipped++;
                    continue;
                }

                const slug = `${itemName.toLowerCase().replace(/\s+/g, '-')}-${place.place_id.substring(0, 8)}`;

                const pinData = {
                    title: itemName,
                    slug,
                    description: place.address || null,
                    category: determinePinCategory(place.type),
                    lat: place.latitude,
                    lng: place.longitude,
                    address: place.address || null,
                    linkType: 'none',
                    iconType: 'default',
                    isVisible: true,
                    public: true,
                    priority: 0,
                    serpPlaceId: place.place_id,
                    thumbnail: place.thumbnail || null,
                    rawMeta: JSON.stringify(place),
                    sourceType: 'SERPAPI',
                };

                await prisma.mapPin.upsert({
                    where: { serpPlaceId: place.place_id },
                    create: pinData,
                    update: pinData,
                });

                created++;
            } catch (error: unknown) {
                failed++;
                errors.push({ item: itemName, error: error instanceof Error ? error.message : String(error) });
            }
        }

        await updateIntegrationLog(logId, {
            status: 'SUCCESS',
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
        });

        // Invalidate map pins cache
        invalidateMapPinsCache();

        return {
            success: true,
            totalFetched: places.length,
            created,
            updated,
            skipped,
            failed,
            errors,
            logId,
            runId,
        };
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        await updateIntegrationLog(logId, {
            status: 'FAILED',
            errorMessage: errMsg,
        });

        return {
            success: false,
            totalFetched: 0,
            created,
            updated,
            skipped,
            failed,
            errors: [{ item: 'SYNC_ERROR', error: errMsg }],
            logId,
            runId,
        };
    }
}

// Helper functions

function determinePinCategory(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('waterfall')) return 'WATERFALL';
    if (t.includes('hot spring') || t.includes('spring')) return 'HOT_SPRING';
    if (t.includes('hiking') || t.includes('trail')) return 'HIKING';
    if (t.includes('town') || t.includes('city')) return 'TOWN';
    if (t.includes('museum') || t.includes('heritage')) return 'HISTORY';
    if (t.includes('restaurant') || t.includes('food')) return 'DINING';
    if (t.includes('hotel') || t.includes('stay')) return 'STAY';
    return 'ACTIVITY';
}

async function createIntegrationLog(
    provider: string,
    operation: string,
    triggeredBy?: string
): Promise<string> {
    const log = await prisma.integrationLog.create({
        data: {
            provider,
            operation,
            status: 'IN_PROGRESS',
            triggeredBy,
        },
    });
    return log.id;
}

async function updateIntegrationLog(
    logId: string,
    data: {
        status?: string;
        totalFetched?: number;
        created?: number;
        updated?: number;
        skipped?: number;
        failed?: number;
        errorMessage?: string;
        errorDetails?: string;
    }
): Promise<void> {
    const completedAt = data.status === 'SUCCESS' || data.status === 'FAILED' ? new Date() : undefined;

    await prisma.integrationLog.update({
        where: { id: logId },
        data: {
            ...data,
            completedAt,
        },
    });
}

/**
 * Create or update MapPin for a restaurant
 */
async function createOrUpdateMapPinForRestaurant(restaurant: { id: string; name: string; slug: string; lat: number | null; lng: number | null; serpPlaceId: string | null; image: string | null; description: string | null }): Promise<void> {
    if (!restaurant.lat || !restaurant.lng) {
        return; // Skip if no coordinates
    }

    const pinSlug = `restaurant-${restaurant.slug}`;
    const existingPin = await prisma.mapPin.findFirst({
        where: {
            OR: [
                { restaurantId: restaurant.id },
                { slug: pinSlug },
                ...(restaurant.serpPlaceId ? [{ serpPlaceId: restaurant.serpPlaceId }] : []),
            ],
        },
    });

    const pinData = {
        title: restaurant.name,
        slug: pinSlug,
        description: restaurant.description || undefined,
        category: 'DINING',
        lat: restaurant.lat,
        lng: restaurant.lng,
        linkType: 'restaurant' as const,
        restaurantId: restaurant.id,
        iconType: 'restaurant',
        isVisible: true,
        public: true,
        priority: 0,
        serpPlaceId: restaurant.serpPlaceId || undefined,
        thumbnail: restaurant.image || undefined,
        sourceType: 'SERPAPI' as const,
    };

    if (existingPin) {
        await prisma.mapPin.update({
            where: { id: existingPin.id },
            data: pinData,
        });
    } else {
        await prisma.mapPin.create({
            data: pinData,
        });
    }

    invalidateMapPinsCache();
}

/**
 * Create or update MapPin for a stay
 */
async function createOrUpdateMapPinForStay(stay: { id: string; title: string; slug: string; lat: number | null; lng: number | null; serpPlaceId: string | null; image: string; description: string }): Promise<void> {
    if (!stay.lat || !stay.lng) {
        return; // Skip if no coordinates
    }

    const pinSlug = `stay-${stay.slug}`;
    const existingPin = await prisma.mapPin.findFirst({
        where: {
            OR: [
                { stayId: stay.id },
                { slug: pinSlug },
                ...(stay.serpPlaceId ? [{ serpPlaceId: stay.serpPlaceId }] : []),
            ],
        },
    });

    const pinData = {
        title: stay.title,
        slug: pinSlug,
        description: stay.description || undefined,
        category: 'STAY',
        lat: stay.lat,
        lng: stay.lng,
        linkType: 'stay' as const,
        stayId: stay.id,
        iconType: 'hotel',
        isVisible: true,
        public: true,
        priority: 0,
        serpPlaceId: stay.serpPlaceId || undefined,
        thumbnail: stay.image || undefined,
        sourceType: 'SERPAPI' as const,
    };

    if (existingPin) {
        await prisma.mapPin.update({
            where: { id: existingPin.id },
            data: pinData,
        });
    } else {
        await prisma.mapPin.create({
            data: pinData,
        });
    }

    invalidateMapPinsCache();
}
