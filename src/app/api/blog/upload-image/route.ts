import { NextRequest, NextResponse } from "next/server";
// import { verifyToken, requireRole } from "@/lib/auth";

/**
 * Image upload endpoint for blog posts
 * TODO: Implement proper image upload to cloud storage (Cloudinary, S3, etc.)
 * For now, this is a placeholder that returns the uploaded file as base64
 */
export async function POST(request: NextRequest) {
    try {
        // TODO: Add proper admin authentication
        // const user = await verifyToken(request);
        // if (!requireRole(user, ["ADMIN", "SUPER_ADMIN"])) {
        //     return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
        // }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "File must be an image" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // TODO: Upload to cloud storage (Cloudinary, S3, etc.)
        // For now, convert to base64 (not recommended for production)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64}`;

        return NextResponse.json({
            success: true,
            data: {
                url: dataUrl,
                // In production, return the cloud storage URL instead
                // url: `https://your-cloud-storage.com/images/${filename}`,
            },
        });
    } catch (error: unknown) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { success: false, error: "Failed to upload image", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

