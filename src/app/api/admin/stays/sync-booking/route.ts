import { NextRequest, NextResponse } from 'next/server';
import { syncBookingComStays, syncSingleBookingHotel } from '@/lib/booking-com-sync';

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

        const body = await request.json().catch(() => ({}));
        const { hotelId } = body;

        console.log('🚀 Booking.com sync requested from dashboard');

        let result;

        if (hotelId) {
            // Sync single hotel
            console.log(`Syncing single hotel: ${hotelId}`);
            result = await syncSingleBookingHotel(hotelId);
        } else {
            // Full sync
            console.log('Starting full Booking.com sync');
            result = await syncBookingComStays();
        }

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Sync completed successfully. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`,
                data: {
                    totalFetched: result.totalFetched,
                    created: result.created,
                    updated: result.updated,
                    skipped: result.skipped,
                    errorsCount: result.errors.length,
                    errors: result.errors.slice(0, 5), // Return first 5 errors
                },
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: result.message || 'Sync failed',
                    data: {
                        totalFetched: result.totalFetched,
                        created: result.created,
                        updated: result.updated,
                        skipped: result.skipped,
                        errors: result.errors,
                    },
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        console.error('❌ Booking.com sync API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
