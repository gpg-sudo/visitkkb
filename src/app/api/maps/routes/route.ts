import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode');

        const where: Prisma.TransportRouteWhereInput = {};
        if (mode) {
            where.mode = mode;
        }

        const routes = await prisma.transportRoute.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            success: true,
            data: routes,
            count: routes.length,
        });
    } catch (error: unknown) {
        console.error('Error fetching routes:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            slug,
            description,
            polyline,
            distance,
            duration,
            startLat,
            startLng,
            startName,
            endLat,
            endLng,
            endName,
            mode = 'driving',
            createdById,
        } = body;

        if (!title || !slug || startLat === undefined || startLng === undefined || endLat === undefined || endLng === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, slug, startLat, startLng, endLat, endLng' },
                { status: 400 }
            );
        }

        const route = await prisma.transportRoute.create({
            data: {
                title,
                slug,
                description,
                polyline,
                distance,
                duration,
                startLat,
                startLng,
                startName,
                endLat,
                endLng,
                endName,
                mode,
                createdById,
            },
        });

        return NextResponse.json({
            success: true,
            data: route,
        });
    } catch (error: unknown) {
        console.error('Error creating route:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
