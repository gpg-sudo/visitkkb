import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const route = await prisma.transportRoute.findUnique({
            where: { id },
        });

        if (!route) {
            return NextResponse.json(
                { success: false, error: 'Route not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: route,
        });
    } catch (error: unknown) {
        console.error('Error fetching route:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add admin authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const route = await prisma.transportRoute.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: route,
        });
    } catch (error: unknown) {
        console.error('Error updating route:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add admin authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { id } = await params;

        await prisma.transportRoute.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Route deleted successfully',
        });
    } catch (error: unknown) {
        console.error('Error deleting route:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
