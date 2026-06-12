import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

/**
 * GET /api/scraped-items - List scraped items
 * Query params: category, status, limit, offset
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const category = searchParams.get('category'); // STAY, DINING, ACTIVITY
        const status = searchParams.get('status'); // NEW, REVIEWED, IMPORTED, IGNORED
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where clause
        const where: Record<string, unknown> = {};

        if (category) {
            where.category = category;
        }

        if (status) {
            where.status = status;
        }

        const items = await prisma.scrapedItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                source: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        const total = await prisma.scrapedItem.count({ where });

        return NextResponse.json({
            success: true,
            data: items,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + items.length < total,
            },
        });
    } catch (error) {
        console.error('Error fetching scraped items:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch scraped items' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/scraped-items - Update scraped item status
 */
export async function PATCH(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const updateSchema = z.object({
            id: z.string(),
            status: z.enum(['NEW', 'REVIEWED', 'IMPORTED', 'IGNORED', 'ERROR']).optional(),
            reviewedBy: z.string().optional(),
            errorMessage: z.string().optional(),
            targetRecordId: z.string().optional(),
        });

        const validatedData = updateSchema.parse(body);

        const updated = await prisma.scrapedItem.update({
            where: { id: validatedData.id },
            data: {
                status: validatedData.status,
                reviewedBy: validatedData.reviewedBy,
                reviewedAt: validatedData.status === 'REVIEWED' ? new Date() : undefined,
                errorMessage: validatedData.errorMessage,
                targetRecordId: validatedData.targetRecordId,
            },
        });

        return NextResponse.json({
            success: true,
            data: updated,
            message: 'Scraped item updated successfully',
        });
    } catch (error) {
        console.error('Error updating scraped item:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid data', details: error.issues },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to update scraped item' },
            { status: 500 }
        );
    }
}
