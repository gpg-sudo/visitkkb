import { NextRequest, NextResponse } from 'next/server';
import { syncStaysFromGoogle } from '@/../scripts/sync-stays-from-google';

/**
 * POST /api/admin/sync/stays
 * 
 * Trigger sync of stays from Google Places API
 * 
 * This endpoint calls the sync function and returns a summary
 * of what was created/updated.
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('🚀 Sync stays requested from dashboard');

    // Run the sync
    const result = await syncStaysFromGoogle();

    // Return result
    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Sync completed. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`
        : 'Sync failed - check logs',
      data: {
        totalFetched: result.totalFetched,
        created: result.created,
        updated: result.updated,
        skipped: result.skipped,
        finalCount: result.finalCount,
        errorsCount: result.errors.length,
        errors: result.errors.slice(0, 5), // Return first 5 errors only
      },
    });
  } catch (error: unknown) {
    console.error('Error in sync stays API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync stays',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sync/stays
 * 
 * Get sync status/history (optional - for future enhancement)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, just return basic info
    // In the future, you could track sync history in database
    return NextResponse.json({
      success: true,
      message: 'Sync endpoint ready',
      info: {
        endpoint: '/api/admin/sync/stays',
        method: 'POST',
        description: 'Sync stays from Google Places API',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
