import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

        const pin = await prisma.mapPin.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: pin,
        });
    } catch (error: unknown) {
        console.error('Error updating pin:', error);
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

        await prisma.mapPin.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Pin deleted successfully',
        });
    } catch (error: unknown) {
        console.error('Error deleting pin:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
