import { NextRequest, NextResponse } from 'next/server';
import { syncRestaurantsFromSerpApi } from '@/lib/serpapi-sync';

export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                {
                    error: 'UNAUTHORIZED',
                    message: 'Admin access required. Please provide authorization header.'
                },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { query } = body;

        console.log('🍽️ Starting SerpAPI restaurant sync via API endpoint');

        const result = await syncRestaurantsFromSerpApi(
            query || 'restaurants in Kuala Kubu Bharu'
        );

        // Check for API key missing error
        if (!result.success && result.errors.length > 0 && result.errors[0].item === 'API_KEY') {
            return NextResponse.json(
                {
                    error: 'SERPAPI_KEY_MISSING',
                    message: 'Configure SerpAPI key in Dashboard → API & Integrations.',
                    data: {
                        runId: result.runId,
                        logId: result.logId,
                    },
                },
                { status: 400 }
            );
        }

        if (result.success || result.created > 0 || result.updated > 0) {
            return NextResponse.json({
                success: true,
                message: `Sync completed. Created: ${result.created}, Updated: ${result.updated}, Failed: ${result.failed}`,
                data: {
                    runId: result.runId,
                    fetched: result.totalFetched,
                    created: result.created,
                    updated: result.updated,
                    skipped: result.skipped,
                    failed: result.failed,
                    errors: result.errors.slice(0, 10), // First 10 errors
                    logId: result.logId,
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'SYNC_FAILED',
                    message: 'Restaurant sync failed. Check logs for details.',
                    data: {
                        runId: result.runId,
                        fetched: result.totalFetched,
                        created: result.created,
                        updated: result.updated,
                        failed: result.failed,
                        errors: result.errors,
                        logId: result.logId,
                    },
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('❌ SerpAPI restaurant sync endpoint error:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        // Handle rate limit errors
        if (errorMessage.includes('Rate limit')) {
            return NextResponse.json(
                {
                    error: 'RATE_LIMIT_EXCEEDED',
                    message: errorMessage,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '60',
                    },
                }
            );
        }

        // Handle API key errors
        if (errorMessage.includes('SERPAPI_KEY')) {
            return NextResponse.json(
                {
                    error: 'SERPAPI_KEY_MISSING',
                    message: 'Configure SerpAPI key in Dashboard → API & Integrations.',
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'INTERNAL_ERROR',
                message: errorMessage,
                stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
