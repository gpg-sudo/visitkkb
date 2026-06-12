import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, requireRole } from '@/lib/auth';

/**
 * POST /api/admin/activities/update-images
 * 
 * Update activity thumbnail and gallery images
 * Body: { slug, thumbnailImage, galleryImages }
 */
export async function POST(request: NextRequest) {
    try {
        // Admin authentication
        const user = await verifyToken(request);
        if (!requireRole(user, ['ADMIN', 'SUPER_ADMIN'])) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { slug, thumbnailImage, galleryImages } = body;

        if (!slug) {
            return NextResponse.json(
                { success: false, error: 'Activity slug is required' },
                { status: 400 }
            );
        }

        if (!thumbnailImage) {
            return NextResponse.json(
                { success: false, error: 'Thumbnail image URL is required' },
                { status: 400 }
            );
        }

        if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Gallery images array is required' },
                { status: 400 }
            );
        }

        // Find activity by slug
        const activity = await prisma.activity.findUnique({
            where: { slug },
        });

        if (!activity) {
            return NextResponse.json(
                { success: false, error: `Activity with slug "${slug}" not found` },
                { status: 404 }
            );
        }

        // Update activity images
        const updated = await prisma.activity.update({
            where: { slug },
            data: {
                image: thumbnailImage,
                gallery: JSON.stringify(galleryImages),
            },
        });

        return NextResponse.json({
            success: true,
            message: `Images updated for ${activity.title}`,
            data: {
                slug: updated.slug,
                title: updated.title,
                thumbnail: updated.image,
                gallery: JSON.parse(updated.gallery),
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Update activity images error:', errorMessage);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to update activity images',
            },
            { status: 500 }
        );
    }
}

