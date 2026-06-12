import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * API Route: Generate AI Images for Activities
 * POST /api/admin/activities/generate-images
 * 
 * Body:
 *   - activityId (optional): Generate for specific activity
 *   - regenerate (optional): Force regeneration even if images exist
 */

// Helper function to build geographically accurate prompts
function buildActivityImagePrompt(
    activity: {
        title: string;
        location: string;
        description: string;
        tags: string;
        difficulty: string;
    },
    imageType: "main" | "gallery",
    galleryIndex?: number
): string {
    const baseLocation = "Kuala Kubu Bharu, Hulu Selangor, Selangor, Malaysia";
    const environment = "tropical rainforest";

    const tagsList = activity.tags.split(",").map((t) => t.trim());
    const primaryTag = tagsList[0] || "outdoor activity";

    let sceneDescription = "";

    if (imageType === "main") {
        sceneDescription = `${activity.title} at ${activity.location}, ${baseLocation}`;
    } else {
        const perspectives = [
            `wide angle view of ${activity.title}`,
            `participants engaged in ${activity.title}`,
            `scenic environment surrounding ${activity.location}`,
        ];
        sceneDescription = perspectives[galleryIndex || 0] + ` at ${baseLocation}`;
    }

    const prompt = `Photorealistic outdoor photograph of ${sceneDescription}. 
${environment} environment with lush green vegetation, tropical trees, and Malaysian landscape. 
Accurate terrain for ${activity.location} area - ${getPrimaryTerrain(activity.title, activity.tags)}.
Natural daylight, realistic colors, no artistic stylization or filters.
${getPeopleDescription(activity.title)}
STRICT REQUIREMENTS:
- NO snow, ice, or winter landscapes
- NO European/Western forests or Alps-style mountains
- NO desert, savannah, or beach (unless activity explicitly involves beach)
- NO urban skyscrapers or modern city backgrounds
- ONLY Malaysian tropical rainforest environment
- ONLY Hulu Selangor geography (jungle hills, rivers, waterfalls, small town trails)
- Natural Malaysian lighting and weather conditions
Activity type: ${primaryTag}
Difficulty level: ${activity.difficulty}`;

    return prompt.trim();
}

function getPrimaryTerrain(title: string, tags: string): string {
    const titleLower = title.toLowerCase();
    const tagsLower = tags.toLowerCase();

    if (titleLower.includes("waterfall") || tagsLower.includes("waterfall")) {
        return "jungle waterfall with natural pools and rocky terrain";
    }
    if (titleLower.includes("rafting") || tagsLower.includes("water sports")) {
        return "river with rapids flowing through tropical jungle";
    }
    if (titleLower.includes("paragliding") || titleLower.includes("flying")) {
        return "hilltop launch site overlooking green valleys and jungle";
    }
    if (titleLower.includes("hiking") || titleLower.includes("trek")) {
        return "jungle trail with dense vegetation and natural terrain";
    }
    if (titleLower.includes("hot spring")) {
        return "natural hot spring pools surrounded by tropical vegetation";
    }
    if (titleLower.includes("town") || titleLower.includes("street") || titleLower.includes("historical")) {
        return "small Malaysian town with colonial architecture and local shops";
    }
    if (titleLower.includes("lake") || titleLower.includes("dam")) {
        return "calm lake surrounded by jungle-covered hills";
    }
    if (titleLower.includes("cycling") || titleLower.includes("biking")) {
        return "winding road through tropical rainforest and hills";
    }
    if (titleLower.includes("atv") || titleLower.includes("off-road")) {
        return "jungle trail with mud and natural obstacles";
    }

    return "tropical rainforest terrain with natural vegetation";
}

function getPeopleDescription(title: string): string {
    const titleLower = title.toLowerCase();

    let gearDescription = "";

    if (titleLower.includes("rafting")) {
        gearDescription = "wearing life jackets, helmets, and rafting gear";
    } else if (titleLower.includes("paragliding")) {
        gearDescription = "wearing paragliding harness and safety equipment";
    } else if (titleLower.includes("hiking") || titleLower.includes("trek")) {
        gearDescription = "wearing hiking boots, backpacks, and appropriate outdoor clothing";
    } else if (titleLower.includes("cycling") || titleLower.includes("biking")) {
        gearDescription = "wearing cycling helmets and athletic gear";
    } else if (titleLower.includes("atv")) {
        gearDescription = "wearing helmets and protective gear";
    } else {
        gearDescription = "wearing appropriate outdoor activity clothing";
    }

    return `If people are visible: Southeast Asian appearance, ${gearDescription}, natural poses.`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { activityId, regenerate = false } = body;

        // Build query based on parameters
        const whereClause: Prisma.ActivityWhereInput = {
            status: "ACTIVE",
        };

        if (activityId) {
            whereClause.id = activityId;
        } else if (!regenerate) {
            // Only generate for activities that need images
            whereClause.OR = [
                { imageSource: null },
                { imageSource: "AI_GENERATED_FALLBACK" },
                { image: { contains: "unsplash.com" } },
            ];
        }

        const activities = await prisma.activity.findMany({
            where: whereClause,
            orderBy: { createdAt: "asc" },
        });

        if (activities.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No activities need image generation",
                count: 0,
            });
        }

        // Return the prompts for the AI assistant to generate images
        const generationTasks = activities.map((activity) => {
            const mainPrompt = buildActivityImagePrompt(
                {
                    title: activity.title,
                    location: activity.location,
                    description: activity.description,
                    tags: activity.tags,
                    difficulty: activity.difficulty,
                },
                "main"
            );

            const galleryPrompts = [0, 1, 2].map((i) =>
                buildActivityImagePrompt(
                    {
                        title: activity.title,
                        location: activity.location,
                        description: activity.description,
                        tags: activity.tags,
                        difficulty: activity.difficulty,
                    },
                    "gallery",
                    i
                )
            );

            return {
                activityId: activity.id,
                activityTitle: activity.title,
                slug: activity.slug,
                mainPrompt,
                galleryPrompts,
            };
        });

        return NextResponse.json({
            success: true,
            message: `Ready to generate images for ${activities.length} activities`,
            count: activities.length,
            tasks: generationTasks,
        });
    } catch (error: unknown) {
        console.error("Error preparing image generation:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to prepare image generation",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * Update activity with generated image URLs
 * PUT /api/admin/activities/generate-images
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { activityId, mainImageUrl, galleryImageUrls, mainPrompt, galleryPrompts } = body;

        if (!activityId || !mainImageUrl) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        await prisma.activity.update({
            where: { id: activityId },
            data: {
                image: mainImageUrl,
                gallery: JSON.stringify(galleryImageUrls || []),
                imageSource: "AI_GENERATED_FALLBACK",
                imagePrompt: mainPrompt,
                galleryPrompts: JSON.stringify(galleryPrompts || []),
                imagesGeneratedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Activity images updated successfully",
        });
    } catch (error: unknown) {
        console.error("Error updating activity images:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update activity images",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
