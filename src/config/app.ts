// App-wide configuration
// TODO: move some of these to env vars for multi-tenant support

export const APP_CONFIG = {
    name: 'VisitKKB',
    tagline: 'Discover Kuala Kubu Bharu',
    location: {
        name: 'Kuala Kubu Bharu',
        short: 'KKB',
        state: 'Selangor',
        country: 'Malaysia',
        // center point for map stuff
        lat: 3.5728,
        lng: 101.6411,
        radius: 15000, // meters - covers most of KKB area
    },
    contact: {
        email: 'hello@visitkkb.com',
        phone: '+60-12-345-6789', // placeholder
    },
    social: {
        instagram: '@visitkkb',
        facebook: 'visitkkb',
        // twitter: null, // not using twitter yet
    },
} as const;

// Search & pagination defaults
export const SEARCH_CONFIG = {
    resultsPerPage: 12,
    maxResults: 100,
    debounceMs: 300,
    minQueryLength: 2,
} as const;

// Map configuration
export const MAP_CONFIG = {
    defaultZoom: 13,
    minZoom: 10,
    maxZoom: 18,
    clusterRadius: 50,
    // hack: these bounds keep users from panning too far away
    maxBounds: {
        north: 3.65,
        south: 3.50,
        east: 101.75,
        west: 101.55,
    },
} as const;

// Pricing display
export const CURRENCY = {
    code: 'MYR',
    symbol: 'RM',
    locale: 'ms-MY',
} as const;

// Feature flags - toggle features on/off
export const FEATURES = {
    enableBooking: true,
    enableReviews: true,
    enableChat: false, // not ready yet
    enableAffiliateLinks: true,
    enableBlog: true,
    enableEvents: true,
    // experimental stuff
    enableAI: false, // AI recommendations - maybe later
    enableVR: false, // VR tours - nice to have
} as const;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
    stays: 300, // 5 min
    activities: 300,
    restaurants: 300,
    blogPosts: 600, // 10 min
    events: 600,
    mapPins: 900, // 15 min
    // shorter for dynamic stuff
    availability: 60,
    bookings: 30,
} as const;
