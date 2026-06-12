/**
 * Map Pins Server Helper with Caching
 * 
 * Provides server-side caching for map pins with automatic invalidation
 */

import { LRUCache } from 'lru-cache';
import prisma from '@/lib/prisma';

// Cache configuration
const cache = new LRUCache<string, MapPinResponse[]>({
    max: 100,
    ttl: 1000 * 60, // 60 seconds
    allowStale: false,
});

const CACHE_KEY = 'map:pins:all';

export interface MapPinResponse {
    id: string;
    name: string;
    slug: string;
    category: 'ACTIVITY' | 'DINING' | 'STAY' | 'POI' | string;
    lat: number;
    lng: number;
    iconUrl?: string;
    shortDescription?: string;
    thumbnail?: string;
    linkType?: string;
    activitySlug?: string;
    staySlug?: string;
    restaurantSlug?: string;
    externalUrl?: string;
}

/**
 * Get all public map pins with caching
 */
export async function getMapPins(): Promise<MapPinResponse[]> {
    // Check cache first
    const cached = cache.get(CACHE_KEY);
    if (cached) {
        console.log('🎯 Map pins cache HIT');
        return cached;
    }

    console.log('📍 Fetching map pins from database...');

    const pins = await prisma.mapPin.findMany({
        where: {
            isVisible: true,
            public: true,
        },
        include: {
            activity: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    image: true,
                },
            },
            stay: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    image: true,
                },
            },
            restaurant: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                },
            },
        },
        orderBy: [{ priority: 'desc' }, { title: 'asc' }],
    });

    // Transform to API format
    const transformed: MapPinResponse[] = pins.map((pin) => {
        // Determine category mapping
        let category: 'ACTIVITY' | 'DINING' | 'STAY' | 'POI' = 'POI';
        if (pin.category === 'ACTIVITY' || pin.category === 'HIKING' || pin.category === 'RAFTING' || pin.category === 'PARAGLIDING') {
            category = 'ACTIVITY';
        } else if (pin.category === 'DINING') {
            category = 'DINING';
        } else if (pin.category === 'STAY') {
            category = 'STAY';
        }

        // Get thumbnail from linked entity or pin itself
        let thumbnail = pin.thumbnail;
        if (!thumbnail) {
            if (pin.activity?.image) thumbnail = pin.activity.image;
            else if (pin.stay?.image) thumbnail = pin.stay.image;
            else if (pin.restaurant?.image) thumbnail = pin.restaurant.image;
        }

        return {
            id: pin.id,
            name: pin.title,
            slug: pin.slug,
            category,
            lat: pin.lat,
            lng: pin.lng,
            iconUrl: getIconUrl(pin.iconType, category),
            shortDescription: pin.description || undefined,
            thumbnail: thumbnail || undefined,
            linkType: pin.linkType,
            activitySlug: pin.activity?.slug,
            staySlug: pin.stay?.slug,
            restaurantSlug: pin.restaurant?.slug,
            externalUrl: pin.externalUrl || undefined,
        };
    });

    // Cache the result
    cache.set(CACHE_KEY, transformed);
    console.log(`✅ Cached ${transformed.length} map pins`);

    return transformed;
}

/**
 * Invalidate map pins cache
 * Call this after any MapPin CRUD operation
 */
export function invalidateMapPinsCache(): void {
    cache.delete(CACHE_KEY);
    console.log('🗑️  Map pins cache invalidated');
}

/**
 * Get icon URL for a pin based on type and category
 */
function getIconUrl(iconType: string, category: string): string {
    // Map icon types to emoji or icon identifiers
    const iconMap: Record<string, string> = {
        waterfall: '💧',
        hot_spring: '♨️',
        hiking: '🥾',
        raft: '🚣',
        paraglide: '🪂',
        restaurant: '🍽️',
        hotel: '🏨',
        cafe: '☕',
        town: '🏘️',
        history: '🏛️',
        default: '📍',
    };

    return iconMap[iconType] || iconMap[category.toLowerCase()] || iconMap.default;
}

/**
 * Get map pins by bounding box (for large datasets)
 */
export async function getMapPinsByBbox(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number
): Promise<MapPinResponse[]> {
    const pins = await prisma.mapPin.findMany({
        where: {
            isVisible: true,
            public: true,
            lat: {
                gte: minLat,
                lte: maxLat,
            },
            lng: {
                gte: minLng,
                lte: maxLng,
            },
        },
        include: {
            activity: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    image: true,
                },
            },
            stay: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    image: true,
                },
            },
            restaurant: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    image: true,
                },
            },
        },
        orderBy: [{ priority: 'desc' }, { title: 'asc' }],
    });

    return pins.map((pin) => ({
        id: pin.id,
        name: pin.title,
        slug: pin.slug,
        category: pin.category,
        lat: pin.lat,
        lng: pin.lng,
        iconUrl: getIconUrl(pin.iconType, pin.category),
        shortDescription: pin.description || undefined,
        thumbnail: pin.thumbnail || pin.activity?.image || pin.stay?.image || pin.restaurant?.image || undefined,
        linkType: pin.linkType,
        activitySlug: pin.activity?.slug,
        staySlug: pin.stay?.slug,
        restaurantSlug: pin.restaurant?.slug,
        externalUrl: pin.externalUrl || undefined,
    }));
}
