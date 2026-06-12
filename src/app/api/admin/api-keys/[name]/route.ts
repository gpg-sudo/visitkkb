import { NextRequest, NextResponse } from 'next/server';
import { deleteApiKey } from '@/lib/api-keys';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        // TODO: Add proper admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { name } = await params;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Key name is required' },
                { status: 400 }
            );
        }

        await deleteApiKey(name);

        return NextResponse.json({
            success: true,
            message: 'API key deleted successfully',
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error deleting API key:', errorMessage);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
