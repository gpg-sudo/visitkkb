import { NextRequest, NextResponse } from 'next/server';
import { listApiKeys, setApiKey } from '@/lib/api-keys';

export async function GET(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const keys = await listApiKeys();

        return NextResponse.json({
            success: true,
            data: keys,
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error listing API keys:', errorMessage);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

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

        const body = await request.json();
        const { name, value, description } = body;

        if (!name || !value) {
            return NextResponse.json(
                { success: false, error: 'Name and value are required' },
                { status: 400 }
            );
        }

        await setApiKey(name, value, description, 'admin'); // 'admin' is placeholder for user ID

        return NextResponse.json({
            success: true,
            message: 'API key saved successfully',
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving API key:', errorMessage);
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
