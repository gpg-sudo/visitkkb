import { NextRequest, NextResponse } from 'next/server';
import { syncStaysFromSerpApi } from '@/lib/serpapi-sync';

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

        const body = await request.json().catch(() => ({}));
        const { query } = body;

        console.log('🏨 Starting SerpAPI stays sync');

        const result = await syncStaysFromSerpApi(
            query || 'hotels in Kuala Kubu Bharu'
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Sync completed. Created: ${result.created}, Updated: ${result.updated}`,
                data: {
                    totalFetched: result.totalFetched,
                    created: result.created,
                    updated: result.updated,
                    skipped: result.skipped,
                    failed: result.failed,
                    errors: result.errors.slice(0, 5),
                    logId: result.logId,
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Sync failed',
                    data: {
                        errors: result.errors,
                        logId: result.logId,
                    },
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('❌ SerpAPI stays sync error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
