import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";
import { Prisma } from "@prisma/client";

// GET all blog posts (admin view - shows all statuses)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const where: Prisma.BlogPostWhereInput = {};
        if (status) {
            where.status = status;
        }
        if (category) {
            where.category = category;
        }

        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                category: true,
                status: true,
                publishedAt: true,
                authorName: true,
                viewCount: true,
                readTime: true,
                coverImage: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        // Serialize dates properly
        const serializedPosts = posts.map((post) => ({
            ...post,
            publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
        }));

        return NextResponse.json(serializedPosts);
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json([], { status: 500 });
    }
}

// POST: Create new blog post
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication
        // const user = await verifyToken(request);
        // if (!requireRole(user, ["ADMIN", "SUPER_ADMIN"])) {
        //     return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        // }

        const body = await request.json();
        const { title, excerpt, content, coverImage, category, tags, authorName, metaTitle, metaDescription, metaKeywords, status, images } = body;

        if (!title || !content) {
            return NextResponse.json(
                { success: false, error: "Title and content are required" },
                { status: 400 }
            );
        }

        // Generate unique slug
        const baseSlug = slugify(title, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;

        // Ensure slug is unique
        while (await prisma.blogPost.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Calculate read time (rough estimate: 200 words per minute)
        const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);

        const post = await prisma.blogPost.create({
            data: {
                title,
                slug,
                excerpt: excerpt || null,
                content,
                coverImage: coverImage || null,
                images: images ? JSON.stringify(images) : null,
                category: category || "general",
                tags: tags || null,
                authorName: authorName || "Admin",
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                metaKeywords: metaKeywords || null,
                status: status || "DRAFT",
                publishedAt: status === "PUBLISHED" ? new Date() : null,
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
            },
        });
    } catch (error: unknown) {
        console.error("Error creating blog post:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create blog post", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
