import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/middleware/auth';
import { checkRateLimit, strictLimiter } from '@/lib/middleware/rate-limit';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// ===========================================
// Input Validation Schema
// ===========================================
const activitySchema = z.object({
    title: z.string().min(3).max(200),
    slug: z.string().min(3).max(200),
    description: z.string().max(5000),
    shortDescription: z.string().max(500).optional(),
    price: z.number().positive().optional(),
    location: z.string().min(1),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD']).optional(),
});

// ===========================================
// GET - List all activities (Admin only)
// ===========================================
export async function GET(req: NextRequest) {
    try {
        // 1. Rate limiting - 30 requests per minute
        const rateLimitCheck = await checkRateLimit(req, strictLimiter, 30);
        if (!rateLimitCheck.success) {
            return rateLimitCheck.response;
        }

        // 2. Authentication & Authorization
        const user = await requireRole(req, ['ADMIN', 'MODERATOR']);
        if (user instanceof NextResponse) {
            return user; // Return auth error
        }

        // 3. Parse query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const status = searchParams.get('status') || undefined;

        // 4. Fetch data with pagination
        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where: status ? { status } : undefined,
                take: limit,
                skip: (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    shortDescription: true,
                    price: true,
                    location: true,
                    lat: true,
                    lng: true,
                    status: true,
                    difficulty: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                    // Don't expose internal fields
                },
            }),
            prisma.activity.count({
                where: status ? { status } : undefined,
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ===========================================
// POST - Create new activity (Admin only)
// ===========================================
export async function POST(req: NextRequest) {
    try {
        // 1. Rate limiting - Stricter for write operations
        const rateLimitCheck = await checkRateLimit(req, strictLimiter, 10);
        if (!rateLimitCheck.success) {
            return rateLimitCheck.response;
        }

        // 2. Authentication & Authorization
        const user = await requireRole(req, ['ADMIN']);
        if (user instanceof NextResponse) {
            return user;
        }

        // 3. Parse and validate request body
        const body = await req.json();
        const validation = activitySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.errors,
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        // 4. Check for duplicate slug
        const existing = await prisma.activity.findUnique({
            where: { slug: data.slug },
        });

        if (existing) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Activity with this slug already exists',
                },
                { status: 409 }
            );
        }

        // 5. Create activity
        const activity = await prisma.activity.create({
            data: {
                ...data,
                sourceType: 'MANUAL',
            },
        });

        // 6. Return created resource
        return NextResponse.json(
            {
                success: true,
                data: activity,
                message: 'Activity created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating activity:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ===========================================
// PUT - Update activity (Admin only)
// ===========================================
export async function PUT(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitCheck = await checkRateLimit(req, strictLimiter, 20);
        if (!rateLimitCheck.success) {
            return rateLimitCheck.response;
        }

        // Authentication
        const user = await requireRole(req, ['ADMIN', 'MODERATOR']);
        if (user instanceof NextResponse) {
            return user;
        }

        // Validation
        const body = await req.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Activity ID is required' },
                { status: 400 }
            );
        }

        const validation = activitySchema.partial().safeParse(updateData);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.errors,
                },
                { status: 400 }
            );
        }

        // Update
        const activity = await prisma.activity.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json({
            success: true,
            data: activity,
            message: 'Activity updated successfully',
        });
    } catch (error) {
        console.error('Error updating activity:', error);

        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { success: false, error: 'Activity not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// ===========================================
// DELETE - Delete activity (Admin only)
// ===========================================
export async function DELETE(req: NextRequest) {
    try {
        // Rate limiting - Strictest for destructive operations
        const rateLimitCheck = await checkRateLimit(req, strictLimiter, 5);
        if (!rateLimitCheck.success) {
            return rateLimitCheck.response;
        }

        // Authentication - Only admins can delete
        const user = await requireRole(req, ['ADMIN']);
        if (user instanceof NextResponse) {
            return user;
        }

        // Get ID from query params
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Activity ID is required' },
                { status: 400 }
            );
        }

        // Soft delete by setting status to ARCHIVED
        const activity = await prisma.activity.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });

        return NextResponse.json({
            success: true,
            data: activity,
            message: 'Activity archived successfully',
        });
    } catch (error) {
        console.error('Error deleting activity:', error);

        if (error instanceof Error && error.message.includes('Record to update not found')) {
            return NextResponse.json(
                { success: false, error: 'Activity not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
