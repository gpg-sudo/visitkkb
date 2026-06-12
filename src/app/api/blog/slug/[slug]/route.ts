import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET blog post by slug (public endpoint)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const post = await prisma.blogPost.findUnique({
            where: { slug },
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
        console.error("Error fetching blog post by slug:", error);
        return NextResponse.json(
            { error: "Failed to fetch blog post" },
            { status: 500 }
        );
    }
}

