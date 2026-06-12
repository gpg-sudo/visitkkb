import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global middleware for the application
 * Handles CORS, security headers, and route protection
 */
export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const response = NextResponse.next();

    // ===========================================
    // CORS Configuration for API Routes
    // ===========================================
    if (pathname.startsWith('/api/')) {
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? [
                'https://visitkkb.com',
                'https://www.visitkkb.com',
                // Add your production domains
            ]
            : [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
            ];

        const origin = request.headers.get('origin');

        if (origin && allowedOrigins.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        }

        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        );

        response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-Requested-With'
        );

        response.headers.set(
            'Access-Control-Max-Age',
            '86400' // 24 hours
        );

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: response.headers,
            });
        }
    }

    // ===========================================
    // Security Headers - Apply to all routes
    // ===========================================

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy browsers)
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self)'
    );

    // HSTS - Force HTTPS (only in production)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=63072000; includeSubDomains; preload'
        );
    }

    return response;
}

// ===========================================
// Middleware Configuration
// ===========================================
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
