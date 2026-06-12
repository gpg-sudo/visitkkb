/**
 * SerpAPI Response Mappers
 * 
 * Defensive mappers that handle incomplete/malformed SerpAPI responses
 * and return only Prisma-safe fields with proper defaults.
 */

import slugify from 'slugify';
import { nanoid } from 'nanoid';

/**
 * SerpAPI place interface (flexible to handle various response shapes)
 */
export interface SerpApiPlace {
    place_id?: string;
    title?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    gps_coordinates?: {
        latitude?: number;
        longitude?: number;
    };
    rating?: number;
    reviews?: number;
    review_count?: number;
    price?: string;
    price_level?: string;
    thumbnail?: string;
    image?: string;
    images?: string[];
    photos?: string[];
    type?: string;
    types?: string[];
    phone?: string;
    website?: string;
    hours?: string;
    opening_hours?: string;
    cuisine?: string;
    cuisines?: string[];
    specialties?: string[];
    description?: string;
}

/**
 * Restaurant data safe for Prisma upsert
 */
export interface RestaurantData {
    name: string;
    serpPlaceId: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    image?: string;
    gallery?: string;
    location: string;
    lat?: number;
    lng?: number;
    cuisine?: string;
    specialties?: string;
    priceRange?: string;
    hours?: string;
    rating: number;
    reviewCount: number;
    rawMeta: string;
    sourceType: string;
    type: string;
    status: string;
}

/**
 * Stay data safe for Prisma upsert
 */
export interface StayData {
    title: string;
    serpPlaceId: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    image: string;
    gallery: string;
    location: string;
    lat: number | null;
    lng: number | null;
    pricePerNight: number;
    type: string;
    amenities: string;
    maxGuests: number;
    rooms: number;
    rating: number;
    reviewCount: number;
    rawMeta: string;
    sourceType: string;
    status: string;
    lastSyncedAt: Date;
}

/**
 * Map SerpAPI place to Restaurant model
 * Returns only Prisma-safe fields with proper defaults
 */
export function mapSerpToRestaurant(item: SerpApiPlace): RestaurantData | null {
    // Validate required fields
    const placeId = item.place_id;
    const name = item.title || item.name;

    if (!placeId || !name) {
        console.warn('⚠️ Skipping item: missing place_id or name', item);
        return null;
    }

    // Extract coordinates
    const lat = item.latitude ?? item.gps_coordinates?.latitude ?? null;
    const lng = item.longitude ?? item.gps_coordinates?.longitude ?? null;

    // Extract gallery images
    const galleryImages: string[] = [];
    if (item.thumbnail) galleryImages.push(item.thumbnail);
    if (item.image) galleryImages.push(item.image);
    if (Array.isArray(item.images)) galleryImages.push(...item.images);
    if (Array.isArray(item.photos)) galleryImages.push(...item.photos);

    // Deduplicate and filter
    const uniqueGallery = Array.from(new Set(galleryImages.filter(Boolean)));

    // Determine cuisine
    let cuisine: string | null = null;
    if (item.cuisine) {
        cuisine = item.cuisine;
    } else if (Array.isArray(item.cuisines) && item.cuisines.length > 0) {
        cuisine = item.cuisines.join(', ');
    } else if (item.type) {
        cuisine = item.type;
    }

    // Determine specialties
    let specialties: string | null = null;
    if (Array.isArray(item.specialties) && item.specialties.length > 0) {
        specialties = item.specialties.join(', ');
    } else if (cuisine) {
        specialties = cuisine; // Fallback to cuisine
    }

    // Determine price range
    let priceRange: string | null = null;
    if (item.price) {
        priceRange = item.price;
    } else if (item.price_level) {
        priceRange = item.price_level;
    }

    // Determine hours
    const hours = item.hours || item.opening_hours || null;

    // Determine restaurant type
    const type = determineRestaurantType(item.type || (Array.isArray(item.types) ? item.types[0] : undefined));

    // Generate unique slug
    const baseSlug = slugify(`${name}-${placeId.substring(0, 8)}`, {
        lower: true,
        strict: true,
    });
    const slug = `${baseSlug}-${nanoid(6)}`;

    // Build description
    const address = item.address || 'Kuala Kubu Bharu';
    const description = item.description || `${name} in ${address}`;
    const shortDescription = item.type || cuisine || 'Restaurant';

    return {
        name,
        serpPlaceId: placeId,
        slug,
        description: description || undefined,
        shortDescription: shortDescription || undefined,
        image: uniqueGallery[0] || undefined,
        gallery: uniqueGallery.length > 0 ? JSON.stringify(uniqueGallery) : undefined,
        location: address,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
        cuisine: cuisine || undefined,
        specialties: specialties || undefined,
        priceRange: priceRange || undefined,
        hours: hours || undefined,
        rating: item.rating ?? 0,
        reviewCount: item.reviews ?? item.review_count ?? 0,
        rawMeta: JSON.stringify(item),
        sourceType: 'SERPAPI',
        type,
        status: 'PUBLISHED',
    };
}

/**
 * Map SerpAPI place to Stay model
 * Returns only Prisma-safe fields with proper defaults
 */
export function mapSerpToStay(item: SerpApiPlace): StayData | null {
    // Validate required fields
    const placeId = item.place_id;
    const title = item.title || item.name;

    if (!placeId || !title) {
        console.warn('⚠️ Skipping item: missing place_id or title', item);
        return null;
    }

    // Extract coordinates
    const lat = item.latitude ?? item.gps_coordinates?.latitude ?? null;
    const lng = item.longitude ?? item.gps_coordinates?.longitude ?? null;

    // Extract gallery images
    const galleryImages: string[] = [];
    if (item.thumbnail) galleryImages.push(item.thumbnail);
    if (item.image) galleryImages.push(item.image);
    if (Array.isArray(item.images)) galleryImages.push(...item.images);
    if (Array.isArray(item.photos)) galleryImages.push(...item.photos);

    // Deduplicate and filter
    const uniqueGallery = Array.from(new Set(galleryImages.filter(Boolean)));

    // Determine stay type
    const type = determineStayType(item.type || (Array.isArray(item.types) ? item.types[0] : undefined));

    // Generate unique slug
    const baseSlug = slugify(`${title}-${placeId.substring(0, 8)}`, {
        lower: true,
        strict: true,
    });
    const slug = `${baseSlug}-${nanoid(6)}`;

    // Build description
    const address = item.address || 'Kuala Kubu Bharu';
    const description = item.description || `${title} in ${address}`;
    const shortDescription = item.type || 'Accommodation';

    // Parse price
    const pricePerNight = parsePriceFromString(item.price) || 100;

    return {
        title,
        serpPlaceId: placeId,
        slug,
        description,
        shortDescription,
        image: uniqueGallery[0] || '/images/placeholder-stay.jpg',
        gallery: JSON.stringify(uniqueGallery.length > 0 ? uniqueGallery : []),
        location: address,
        lat,
        lng,
        pricePerNight,
        type,
        amenities: 'WiFi, Parking',
        maxGuests: 2,
        rooms: 1,
        rating: item.rating ?? 0,
        reviewCount: item.reviews ?? item.review_count ?? 0,
        rawMeta: JSON.stringify(item),
        sourceType: 'SERPAPI',
        status: 'PUBLISHED',
        lastSyncedAt: new Date(),
    };
}

/**
 * Determine restaurant type from SerpAPI type string
 */
function determineRestaurantType(type?: string): string {
    if (!type) return 'RESTAURANT';

    const t = type.toLowerCase();
    if (t.includes('cafe') || t.includes('coffee')) return 'CAFE';
    if (t.includes('warung')) return 'WARUNG';
    if (t.includes('street') || t.includes('stall')) return 'STREET_FOOD';
    if (t.includes('dessert') || t.includes('ice cream')) return 'DESSERT';
    if (t.includes('bakery')) return 'BAKERY';
    if (t.includes('mamak')) return 'MAMAK';
    return 'RESTAURANT';
}

/**
 * Determine stay type from SerpAPI type string
 */
function determineStayType(type?: string): string {
    if (!type) return 'HOTEL';

    const t = type.toLowerCase();
    if (t.includes('resort')) return 'RESORT';
    if (t.includes('hostel')) return 'HOSTEL';
    if (t.includes('homestay')) return 'HOMESTAY';
    if (t.includes('apartment') || t.includes('condo')) return 'APARTMENT';
    if (t.includes('villa')) return 'VILLA';
    if (t.includes('chalet')) return 'CHALET';
    if (t.includes('camp')) return 'CAMPING';
    return 'HOTEL';
}

/**
 * Parse price from string (e.g., "$50", "RM 100", "50-100")
 */
function parsePriceFromString(priceStr?: string): number | null {
    if (!priceStr) return null;

    // Extract first number from string
    const match = priceStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}
