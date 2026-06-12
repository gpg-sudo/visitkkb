// Formatting utilities
import { CURRENCY } from '@/config/app';

/**
 * Format price for display
 * @param amount - price in MYR
 * @param showCurrency - whether to show currency symbol
 */
export function formatPrice(amount: number | null | undefined, showCurrency = true): string {
    if (!amount && amount !== 0) return 'Contact for price';

    const formatted = new Intl.NumberFormat(CURRENCY.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);

    return showCurrency ? `${CURRENCY.symbol} ${formatted}` : formatted;
}

// quick helper for "from X" pricing
export const formatFromPrice = (amount: number | null | undefined) =>
    amount ? `From ${formatPrice(amount)}` : 'Contact for price';

/**
 * Format rating with 1 decimal place
 */
export function formatRating(rating: number | null | undefined): string {
    if (!rating && rating !== 0) return 'N/A';
    return rating.toFixed(1);
}

/**
 * Format review count with proper pluralization
 */
export function formatReviewCount(count: number | null | undefined): string {
    if (!count) return 'No reviews';
    if (count === 1) return '1 review';

    // abbreviate large numbers
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k reviews`;
    }

    return `${count} reviews`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate slug from text
 * TODO: handle unicode/malay characters better
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove special chars
        .replace(/[\s_-]+/g, '-') // replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ''); // trim hyphens
}

/**
 * Format distance in meters to human-readable string
 */
export function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration in minutes
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

// Date formatting
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'short') {
        return d.toLocaleDateString('en-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    return d.toLocaleDateString('en-MY', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Format time (24h to 12h)
 */
export function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Parse amenities string to array
export const parseAmenities = (amenities: string | string[]): string[] => {
    if (Array.isArray(amenities)) return amenities;
    return amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
};
