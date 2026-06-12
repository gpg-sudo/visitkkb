import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { invalidateMapPinsCache } from '@/lib/mapPins';

/**
 * POST /api/admin/map/reconcile
 * 
 * Generate MapPin records from existing Activities/Stays/Restaurants that have coordinates.
 * This ensures all entities with coordinates are visible on the map.
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        console.log('🔄 Starting map pin reconciliation...');

        let created = 0;
        let updated = 0;
        let skipped = 0;
        const errors: Array<{ item: string; error: string }> = [];

        // Reconcile Activities
        console.log('📍 Reconciling Activities...');
        const activities = await prisma.activity.findMany({
            where: {
                coordinates: { not: null },
                status: 'ACTIVE',
            },
            select: {
                id: true,
                title: true,
                slug: true,
                coordinates: true,
                image: true,
                description: true,
            },
        });

        for (const activity of activities) {
            try {
                const coords = activity.coordinates ? JSON.parse(activity.coordinates) : null;
                if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
                    skipped++;
                    continue;
                }

                const pinSlug = `activity-${activity.slug}`;
                const existingPin = await prisma.mapPin.findFirst({
                    where: {
                        OR: [
                            { activityId: activity.id },
                            { slug: pinSlug },
                        ],
                    },
                });

                const pinData = {
                    title: activity.title,
                    slug: pinSlug,
                    description: activity.description || undefined,
                    category: 'ACTIVITY',
                    lat: coords.lat,
                    lng: coords.lng,
                    linkType: 'activity' as const,
                    activityId: activity.id,
                    iconType: 'default',
                    isVisible: true,
                    public: true,
                    priority: 0,
                    sourceType: 'MANUAL' as const,
                };

                if (existingPin) {
                    await prisma.mapPin.update({
                        where: { id: existingPin.id },
                        data: pinData,
                    });
                    updated++;
                } else {
                    await prisma.mapPin.create({
                        data: pinData,
                    });
                    created++;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({ item: `Activity: ${activity.title}`, error: errorMessage });
            }
        }

        // Reconcile Stays
        console.log('📍 Reconciling Stays...');
        const stays = await prisma.stay.findMany({
            where: {
                OR: [
                    { lat: { not: null }, lng: { not: null } },
                    { coordinates: { not: null } },
                ],
                status: 'PUBLISHED',
            },
            select: {
                id: true,
                title: true,
                slug: true,
                lat: true,
                lng: true,
                coordinates: true,
                image: true,
                description: true,
                serpPlaceId: true,
            },
        });

        for (const stay of stays) {
            try {
                let lat: number | null = null;
                let lng: number | null = null;

                if (stay.lat && stay.lng) {
                    lat = stay.lat;
                    lng = stay.lng;
                } else if (stay.coordinates) {
                    const coords = JSON.parse(stay.coordinates);
                    lat = coords.lat;
                    lng = coords.lng;
                }

                if (!lat || !lng) {
                    skipped++;
                    continue;
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
                    lat,
                    lng,
                    linkType: 'stay' as const,
                    stayId: stay.id,
                    iconType: 'hotel',
                    isVisible: true,
                    public: true,
                    priority: 0,
                    serpPlaceId: stay.serpPlaceId || undefined,
                    thumbnail: stay.image || undefined,
                    sourceType: stay.serpPlaceId ? 'SERPAPI' as const : 'MANUAL' as const,
                };

                if (existingPin) {
                    await prisma.mapPin.update({
                        where: { id: existingPin.id },
                        data: pinData,
                    });
                    updated++;
                } else {
                    await prisma.mapPin.create({
                        data: pinData,
                    });
                    created++;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({ item: `Stay: ${stay.title}`, error: errorMessage });
            }
        }

        // Reconcile Restaurants
        console.log('📍 Reconciling Restaurants...');
        const restaurants = await prisma.restaurant.findMany({
            where: {
                OR: [
                    { lat: { not: null }, lng: { not: null } },
                    { coordinates: { not: null } },
                ],
                status: 'PUBLISHED',
            },
            select: {
                id: true,
                name: true,
                slug: true,
                lat: true,
                lng: true,
                coordinates: true,
                image: true,
                description: true,
                serpPlaceId: true,
            },
        });

        for (const restaurant of restaurants) {
            try {
                let lat: number | null = null;
                let lng: number | null = null;

                if (restaurant.lat && restaurant.lng) {
                    lat = restaurant.lat;
                    lng = restaurant.lng;
                } else if (restaurant.coordinates) {
                    const coords = JSON.parse(restaurant.coordinates);
                    lat = coords.lat;
                    lng = coords.lng;
                }

                if (!lat || !lng) {
                    skipped++;
                    continue;
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
                    lat,
                    lng,
                    linkType: 'restaurant' as const,
                    restaurantId: restaurant.id,
                    iconType: 'restaurant',
                    isVisible: true,
                    public: true,
                    priority: 0,
                    serpPlaceId: restaurant.serpPlaceId || undefined,
                    thumbnail: restaurant.image || undefined,
                    sourceType: restaurant.serpPlaceId ? 'SERPAPI' as const : 'MANUAL' as const,
                };

                if (existingPin) {
                    await prisma.mapPin.update({
                        where: { id: existingPin.id },
                        data: pinData,
                    });
                    updated++;
                } else {
                    await prisma.mapPin.create({
                        data: pinData,
                    });
                    created++;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({ item: `Restaurant: ${restaurant.name}`, error: errorMessage });
            }
        }

        // Invalidate cache
        invalidateMapPinsCache();

        console.log('✅ Reconciliation complete:', { created, updated, skipped, errors: errors.length });

        return NextResponse.json({
            success: true,
            message: `Reconciliation completed. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}`,
            data: {
                created,
                updated,
                skipped,
                errors: errors.slice(0, 10), // First 10 errors
                totalProcessed: activities.length + stays.length + restaurants.length,
            },
        });
    } catch (error: unknown) {
        console.error('❌ Reconciliation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'RECONCILE_FAILED',
                message: error instanceof Error ? error.message : 'An unexpected error occurred during reconciliation',
            },
            { status: 500 }
        );
    }
}

