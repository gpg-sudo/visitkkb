// Sync configuration for external data sources
// NOTE: these are defaults - can be overridden per integration in DB

export const SYNC_INTERVALS = {
    stays: '0 */6 * * *',      // every 6 hours
    dining: '0 */12 * * *',    // twice daily
    activities: '0 0 * * *',   // daily at midnight
    events: '0 8 * * *',       // daily at 8am
    instagram: '*/30 * * * *', // every 30 min (aggressive but instagram changes fast)
} as const;

// Rate limiting for API calls
export const RATE_LIMITS = {
    googlePlaces: {
        requestsPerMinute: 10,
        requestsPerDay: 1000,
    },
    serpApi: {
        requestsPerMinute: 5,
        requestsPerDay: 500,
    },
    instagram: {
        requestsPerMinute: 20,
        requestsPerDay: 5000,
    },
} as const;

// Fields to preserve during sync (don't overwrite manual edits)
export const PRESERVED_FIELDS = {
    common: ['description', 'longDescription', 'isFeatured', 'status'],
    stays: ['affiliateMatchName', 'affiliateProvider', 'affiliateDeepLink', 'experienceTags'],
    dining: ['specialties', 'menuUrl', 'reservationUrl'],
    activities: ['difficulty', 'duration', 'minAge', 'bookingUrl'],
} as const;

// Data quality thresholds
export const QUALITY_THRESHOLDS = {
    minRating: 0,           // accept all ratings
    minReviewCount: 0,      // accept places with no reviews (new places need love too)
    requireImage: false,    // we'll use placeholders if needed
    requireCoordinates: true, // this is critical for map display
} as const;

// Retry configuration for failed syncs
export const RETRY_CONFIG = {
    maxAttempts: 3,
    backoffMs: 1000,
    backoffMultiplier: 2, // exponential backoff
} as const;
