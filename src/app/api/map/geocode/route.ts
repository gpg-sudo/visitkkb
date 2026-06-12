import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/map/geocode
 * Proxy for Nominatim geocoding to avoid CORS and rate limiting issues
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { success: false, error: 'Query parameter required' },
                { status: 400 }
            );
        }

        // Use Nominatim (OpenStreetMap geocoding)
        const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
        nominatimUrl.searchParams.set('q', query);
        nominatimUrl.searchParams.set('format', 'json');
        nominatimUrl.searchParams.set('limit', '5');
        nominatimUrl.searchParams.set('addressdetails', '1');

        // Add bounding box if provided (for KKB area)
        const viewbox = searchParams.get('viewbox');
        if (viewbox) {
            nominatimUrl.searchParams.set('viewbox', viewbox);
            nominatimUrl.searchParams.set('bounded', '1');
        }

        const response = await fetch(nominatimUrl.toString(), {
            headers: {
                'User-Agent': 'VisitKKB/1.0 (Tourism Platform)',
            },
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(
            {
                success: true,
                results: data,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                },
            }
        );
    } catch (error: unknown) {
        console.error('❌ Geocoding error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Geocoding failed',
                message: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
