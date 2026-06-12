import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const publicOnly = searchParams.get('public') === 'true';
        const bbox = searchParams.get('bbox'); // format: "minLat,minLng,maxLat,maxLng"

        const where: Prisma.MapPinWhereInput = {};

        if (category) {
            where.category = category;
        }

        if (publicOnly) {
            where.public = true;
            where.isVisible = true;
        }

        if (bbox) {
            const [minLat, minLng, maxLat, maxLng] = bbox.split(',').map(Number);
            where.lat = { gte: minLat, lte: maxLat };
            where.lng = { gte: minLng, lte: maxLng };
        }

        const pins = await prisma.mapPin.findMany({
            where,
            include: {
                activity: {
                    select: { id: true, title: true, slug: true },
                },
                stay: {
                    select: { id: true, title: true, slug: true },
                },
                restaurant: {
                    select: { id: true, name: true, slug: true },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: pins,
            count: pins.length,
        });
    } catch (error: unknown) {
        console.error('Error fetching pins:', error);
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
            category,
            lat,
            lng,
            address,
            linkType = 'none',
            activityId,
            stayId,
            restaurantId,
            externalUrl,
            iconType = 'default',
            isVisible = true,
            public: isPublic = true,
            priority = 0,
            createdById,
        } = body;

        if (!title || !slug || !category || lat === undefined || lng === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, slug, category, lat, lng' },
                { status: 400 }
            );
        }

        const pin = await prisma.mapPin.create({
            data: {
                title,
                slug,
                description,
                category,
                lat,
                lng,
                address,
                linkType,
                activityId,
                stayId,
                restaurantId,
                externalUrl,
                iconType,
                isVisible,
                public: isPublic,
                priority,
                createdById,
            },
        });

        return NextResponse.json({
            success: true,
            data: pin,
        });
    } catch (error: unknown) {
        console.error('Error creating pin:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
