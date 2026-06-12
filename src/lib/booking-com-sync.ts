import prisma from '@/lib/prisma';
import slugify from 'slugify';

// Booking.com Content API configuration
const BOOKING_API_BASE = 'https://distribution-xml.booking.com/2.7/json';
const BOOKING_API_USER = process.env.BOOKING_API_USER || '';
const BOOKING_API_PASS = process.env.BOOKING_API_PASS || '';
const BOOKING_AFFILIATE_ID = process.env.BOOKING_AFFILIATE_ID || '';

// KKB coordinates for search
const KKB_LAT = 3.5410;
const KKB_LNG = 101.6900;
const SEARCH_RADIUS_KM = 20;

interface BookingHotel {
    hotel_id: number;
    name: string;
    address: string;
    city: string;
    zip: string;
    country: string;
    latitude: number;
    longitude: number;
    hotel_currency_code: string;
    minrate: number;
    maxrate?: number;
    review_score?: number;
    review_nr?: number;
    hotel_type_id?: number;
    hotel_facilities?: string;
    room_facilities?: string;
    photos?: Array<{
        url_original: string;
        url_max300: string;
    }>;
    url?: string;
}

interface SyncResult {
    success: boolean;
    totalFetched: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    message?: string;
}

/**
 * Fetch hotels from Booking.com Content API
 */
async function fetchBookingHotels(): Promise<BookingHotel[]> {
    if (!BOOKING_API_USER || !BOOKING_API_PASS) {
        throw new Error('Booking.com API credentials not configured. Set BOOKING_API_USER and BOOKING_API_PASS in .env');
    }

    try {
        // Booking.com uses Basic Auth
        const auth = Buffer.from(`${BOOKING_API_USER}:${BOOKING_API_PASS}`).toString('base64');

        // Search for hotels near KKB
        const url = `${BOOKING_API_BASE}/hotels?latitude=${KKB_LAT}&longitude=${KKB_LNG}&radius=${SEARCH_RADIUS_KM}&rows=100&extras=hotel_info,hotel_photos,hotel_description,hotel_facilities`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Booking.com API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.result || !Array.isArray(data.result)) {
            console.warn('No hotels found in Booking.com response');
            return [];
        }

        return data.result;
    } catch (error: unknown) {
        console.error('Error fetching from Booking.com:', error);
        throw error;
    }
}

/**
 * Determine stay type from Booking.com hotel type
 */
function determineStayType(hotelTypeId?: number, name?: string): string {
    const nameLower = (name || '').toLowerCase();

    if (nameLower.includes('resort')) return 'RESORT';
    if (nameLower.includes('hostel')) return 'HOSTEL';
    if (nameLower.includes('homestay') || nameLower.includes('home stay')) return 'HOMESTAY';
    if (nameLower.includes('apartment') || nameLower.includes('condo')) return 'APARTMENT';
    if (nameLower.includes('villa')) return 'VILLA';
    if (nameLower.includes('chalet')) return 'CHALET';
    if (nameLower.includes('camping') || nameLower.includes('camp')) return 'CAMPING';

    // Booking.com hotel type IDs (common ones)
    if (hotelTypeId === 204) return 'HOTEL';
    if (hotelTypeId === 201) return 'APARTMENT';
    if (hotelTypeId === 216) return 'RESORT';
    if (hotelTypeId === 203) return 'HOSTEL';

    return 'HOTEL'; // Default
}

/**
 * Generate affiliate deep link for Booking.com
 */
function generateAffiliateLink(hotelId: number): string {
    if (BOOKING_AFFILIATE_ID) {
        return `https://www.booking.com/hotel/my/hotel-${hotelId}.html?aid=${BOOKING_AFFILIATE_ID}`;
    }
    return `https://www.booking.com/hotel/my/hotel-${hotelId}.html`;
}

/**
 * Sync a single hotel to the database
 */
async function syncHotelToDatabase(hotel: BookingHotel): Promise<'created' | 'updated' | 'skipped'> {
    try {
        const slug = slugify(`${hotel.name} ${hotel.city}`, { lower: true, strict: true });
        const stayType = determineStayType(hotel.hotel_type_id, hotel.name);

        // Extract photos
        const photos = hotel.photos || [];
        const thumbnailImage = photos.length > 0 ? photos[0].url_max300 : '';
        const gallery = photos.slice(0, 10).map(p => p.url_original);

        // Parse facilities as amenities
        const facilities = hotel.hotel_facilities || hotel.room_facilities || '';
        const amenities = facilities
            .split(',')
            .map(f => f.trim())
            .filter(f => f.length > 0)
            .slice(0, 10)
            .join(', ');

        const stayData = {
            title: hotel.name,
            slug: slug,
            description: `${hotel.name} in ${hotel.city}. ${hotel.address}`,
            shortDescription: `${stayType} in ${hotel.city}`,
            image: thumbnailImage,
            gallery: JSON.stringify(gallery),
            location: `${hotel.address}, ${hotel.city}`,
            coordinates: JSON.stringify({ lat: hotel.latitude, lng: hotel.longitude }),
            lat: hotel.latitude,
            lng: hotel.longitude,
            pricePerNight: hotel.minrate || 0,
            priceFrom: hotel.minrate || 0,
            type: stayType,
            amenities: amenities || 'WiFi, Parking',
            maxGuests: 2,
            rooms: 1,
            status: 'PUBLISHED',
            sourceType: 'BOOKING_COM',
            bookingPlaceId: hotel.hotel_id.toString(),
            rating: hotel.review_score ? hotel.review_score / 2 : 0, // Booking uses 0-10, we use 0-5
            reviewCount: hotel.review_nr || 0,
            currency: hotel.hotel_currency_code || 'MYR',
            affiliateProvider: 'BOOKING_COM',
            affiliateDeepLink: generateAffiliateLink(hotel.hotel_id),
            lastSyncedAt: new Date(),
        };

        // Check if exists by bookingPlaceId
        const existing = await prisma.stay.findUnique({
            where: { bookingPlaceId: hotel.hotel_id.toString() },
        });

        if (existing) {
            await prisma.stay.update({
                where: { id: existing.id },
                data: {
                    ...stayData,
                    updatedAt: new Date(),
                },
            });
            return 'updated';
        } else {
            // Check if slug exists (to avoid conflicts)
            const existingSlug = await prisma.stay.findUnique({
                where: { slug },
            });

            if (existingSlug) {
                // Append hotel ID to make slug unique
                stayData.slug = `${slug}-${hotel.hotel_id}`;
            }

            await prisma.stay.create({ data: stayData });
            return 'created';
        }
    } catch (error: unknown) {
        console.error(`Error syncing hotel ${hotel.hotel_id}:`, error);
        throw error;
    }
}

/**
 * Main sync function - fetches all hotels and syncs to database
 */
export async function syncBookingComStays(): Promise<SyncResult> {
    console.log('🏨 Starting Booking.com stays sync...');

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
        // Fetch hotels from Booking.com
        const hotels = await fetchBookingHotels();
        console.log(`📦 Fetched ${hotels.length} hotels from Booking.com`);

        // Sync each hotel
        for (const hotel of hotels) {
            try {
                const result = await syncHotelToDatabase(hotel);
                if (result === 'created') created++;
                else if (result === 'updated') updated++;
                else skipped++;
            } catch (error: unknown) {
                errors.push(`Hotel ${hotel.hotel_id}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        console.log(`✅ Sync complete: ${created} created, ${updated} updated, ${skipped} skipped`);

        return {
            success: true,
            totalFetched: hotels.length,
            created,
            updated,
            skipped,
            errors,
        };
    } catch (error: unknown) {
        console.error('❌ Booking.com sync failed:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            totalFetched: 0,
            created,
            updated,
            skipped,
            errors: [msg],
            message: msg,
        };
    }
}

/**
 * Sync a single hotel by ID
 */
export async function syncSingleBookingHotel(hotelId: string): Promise<SyncResult> {
    console.log(`🏨 Syncing single hotel: ${hotelId}`);

    try {
        if (!BOOKING_API_USER || !BOOKING_API_PASS) {
            throw new Error('Booking.com API credentials not configured');
        }

        const auth = Buffer.from(`${BOOKING_API_USER}:${BOOKING_API_PASS}`).toString('base64');
        const url = `${BOOKING_API_BASE}/hotels?hotel_ids=${hotelId}&extras=hotel_info,hotel_photos,hotel_description,hotel_facilities`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Booking.com API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.result || data.result.length === 0) {
            throw new Error('Hotel not found');
        }

        const hotel = data.result[0];
        const result = await syncHotelToDatabase(hotel);

        return {
            success: true,
            totalFetched: 1,
            created: result === 'created' ? 1 : 0,
            updated: result === 'updated' ? 1 : 0,
            skipped: result === 'skipped' ? 1 : 0,
            errors: [],
        };
    } catch (error: unknown) {
        console.error('Error syncing single hotel:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            totalFetched: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [msg],
            message: msg,
        };
    }
}
