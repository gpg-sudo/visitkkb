import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
// import { verifyToken, requireRole } from "@/lib/auth";

// GET blog post by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({
            ...post,
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            images: post.images ? JSON.parse(post.images) : null,
        });
    } catch (error) {
        console.error("Error fetching blog post:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}

// PUT: Update blog post
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add proper admin authentication
        // const user = await verifyToken(request);
        // if (!requireRole(user, ["ADMIN", "SUPER_ADMIN"])) {
        //     return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        // }

        const { id } = await params;
        const body = await request.json();

        const existingPost = await prisma.blogPost.findUnique({
            where: { id },
        });

        if (!existingPost) {
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        // Generate slug if title changed
        let slug = existingPost.slug;
        if (body.title && body.title !== existingPost.title) {
            const baseSlug = slugify(body.title, { lower: true, strict: true });
            slug = baseSlug;
            let counter = 1;
            while (await prisma.blogPost.findUnique({ where: { slug } })) {
                if (slug === existingPost.slug) break; // Keep existing slug if it matches
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        // Calculate read time
        const content = body.content || existingPost.content;
        const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);

        // Handle publishedAt
        let publishedAt = existingPost.publishedAt;
        if (body.status === "PUBLISHED" && !existingPost.publishedAt) {
            publishedAt = new Date();
        } else if (body.status !== "PUBLISHED" && body.status) {
            publishedAt = null;
        }

        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                title: body.title ?? existingPost.title,
                slug,
                excerpt: body.excerpt !== undefined ? body.excerpt : existingPost.excerpt,
                content: body.content ?? existingPost.content,
                coverImage: body.coverImage !== undefined ? body.coverImage : existingPost.coverImage,
                images: body.images ? JSON.stringify(body.images) : existingPost.images,
                category: body.category ?? existingPost.category,
                tags: body.tags !== undefined ? body.tags : existingPost.tags,
                authorName: body.authorName ?? existingPost.authorName,
                metaTitle: body.metaTitle !== undefined ? body.metaTitle : existingPost.metaTitle,
                metaDescription: body.metaDescription !== undefined ? body.metaDescription : existingPost.metaDescription,
                metaKeywords: body.metaKeywords !== undefined ? body.metaKeywords : existingPost.metaKeywords,
                status: body.status ?? existingPost.status,
                publishedAt,
                readTime: `${readTime} min read`,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                ...post,
                publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                images: post.images ? JSON.parse(post.images) : null,
            },
        });
    } catch (error: unknown) {
        console.error("Error updating blog post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update blog post", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// DELETE: Delete or archive blog post
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add proper admin authentication
        // const user = await verifyToken(request);
        // if (!requireRole(user, ["ADMIN", "SUPER_ADMIN"])) {
        //     return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        // }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const archive = searchParams.get("archive") === "true";

        if (archive) {
            // Archive instead of delete
            const post = await prisma.blogPost.update({
                where: { id },
                data: { status: "ARCHIVED" },
            });
            return NextResponse.json({ success: true, data: post });
        } else {
            // Permanently delete
            await prisma.blogPost.delete({
                where: { id },
            });
            return NextResponse.json({ success: true, message: "Post deleted successfully" });
        }
    } catch (error: unknown) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete blog post", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// PATCH: Publish/Unpublish blog post
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // TODO: Add proper admin authentication
        // const user = await verifyToken(request);
        // if (!requireRole(user, ["ADMIN", "SUPER_ADMIN"])) {
        //     return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        // }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "Invalid status" },
                { status: 400 }
            );
        }

        const post = await prisma.blogPost.findUnique({ where: { id } });
        if (!post) {
            return NextResponse.json(
                { success: false, error: "Post not found" },
                { status: 404 }
            );
        }

        const publishedAt = status === "PUBLISHED" && !post.publishedAt
            ? new Date()
            : post.publishedAt;

        const updatedPost = await prisma.blogPost.update({
            where: { id },
            data: {
                status,
                publishedAt,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updatedPost,
                publishedAt: updatedPost.publishedAt ? updatedPost.publishedAt.toISOString() : null,
            },
        });
    } catch (error: unknown) {
        console.error("Error updating blog post status:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update blog post status", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
