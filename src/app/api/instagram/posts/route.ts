import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
    try {
        const posts = await prisma.instagramPost.findMany({
            where: {
                isVisible: true,
            },
            orderBy: [
                { isFeatured: "desc" },
                { displayOrder: "asc" },
                { createdAt: "desc" },
            ],
            take: 10, // Limit to 10 posts
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Error fetching Instagram posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch Instagram posts" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, caption, image, likes, postUrl, hashtags } = body;

        if (!username || !caption || !image || !likes) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const post = await prisma.instagramPost.create({
            data: {
                username,
                caption,
                image,
                likes,
                postUrl,
                hashtags,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error("Error creating Instagram post:", error);
        return NextResponse.json(
            { error: "Failed to create Instagram post" },
            { status: 500 }
        );
    }
}
