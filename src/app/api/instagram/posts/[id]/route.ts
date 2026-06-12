import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { isVisible, isFeatured, displayOrder } = body;

        const post = await prisma.instagramPost.update({
            where: { id },
            data: {
                ...(isVisible !== undefined && { isVisible }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(displayOrder !== undefined && { displayOrder }),
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error updating Instagram post:", error);
        return NextResponse.json(
            { error: "Failed to update Instagram post" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await prisma.instagramPost.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting Instagram post:", error);
        return NextResponse.json(
            { error: "Failed to delete Instagram post" },
            { status: 500 }
        );
    }
}
