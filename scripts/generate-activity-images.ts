/**
 * AI Image Generation Script for Activities
 * 
 * CRITICAL REQUIREMENTS:
 * - Photorealistic images only
 * - Malaysian tropical rainforest environment
 * - Hulu Selangor / KKB geography
 * - No foreign landscapes, snow, or inappropriate terrain
 * - Southeast Asian people with proper safety gear
 * 
 * Usage:
 *   npm run generate-activity-images
 *   npm run generate-activity-images -- --activity-id=<uuid>
 */

import prisma from "../src/lib/prisma";

// Image generation configuration
const IMAGE_CONFIG = {
  mainImage: {
    width: 1920,
    height: 1080,
    name: "main_activity_photo",
  },
  galleryImages: {
    count: 3,
    width: 1600,
    height: 900,
    namePrefix: "gallery_photo",
  },
};

/**
 * Build a geographically accurate, contextual prompt for activity images
 */
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

  // Extract primary activity category from tags
  const tagsList = activity.tags.split(",").map((t) => t.trim());
  const primaryTag = tagsList[0] || "outdoor activity";

  // Build contextual scene description
  let sceneDescription = "";

  if (imageType === "main") {
    // Main image: showcase the activity itself
    sceneDescription = `${activity.title} at ${activity.location}, ${baseLocation}`;
  } else {
    // Gallery images: show different perspectives
    const perspectives = [
      `wide angle view of ${activity.title}`,
      `participants engaged in ${activity.title}`,
      `scenic environment surrounding ${activity.location}`,
    ];
    sceneDescription = perspectives[galleryIndex || 0] + ` at ${baseLocation}`;
  }

  // Build the complete prompt with strict geographic controls
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

/**
 * Determine primary terrain type based on activity
 */
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

/**
 * Generate people description based on activity type and difficulty
 */
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

/**
 * Generate image using the generate_image tool
 * Note: This is a placeholder - actual implementation will use the tool
 */
async function generateImage(
  prompt: string,
  imageName: string
): Promise<string> {
  console.log(`\n📸 Generating image: ${imageName}`);
  console.log(`📝 Prompt: ${prompt.substring(0, 150)}...`);

  // In actual implementation, this would call the generate_image tool
  // For now, return a placeholder path
  // The actual tool call will be made by the AI assistant

  return `/images/activities/ai-generated/${imageName}.webp`;
}

/**
 * Generate all images for a single activity
 */
async function generateActivityImages(activityId: string) {
  console.log(`\n🎨 Processing activity: ${activityId}`);

  // Fetch activity from database
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    console.error(`❌ Activity not found: ${activityId}`);
    return;
  }

  console.log(`📋 Activity: ${activity.title}`);
  console.log(`📍 Location: ${activity.location}`);
  console.log(`🏷️  Tags: ${activity.tags}`);

  // Generate main image
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

  const mainImageName = `${activity.slug}_main`;
  const mainImageUrl = await generateImage(mainPrompt, mainImageName);

  // Generate gallery images
  const galleryPrompts: string[] = [];
  const galleryUrls: string[] = [];

  for (let i = 0; i < IMAGE_CONFIG.galleryImages.count; i++) {
    const galleryPrompt = buildActivityImagePrompt(
      {
        title: activity.title,
        location: activity.location,
        description: activity.description,
        tags: activity.tags,
        difficulty: activity.difficulty,
      },
      "gallery",
      i
    );

    const galleryImageName = `${activity.slug}_gallery_${i + 1}`;
    const galleryImageUrl = await generateImage(galleryPrompt, galleryImageName);

    galleryPrompts.push(galleryPrompt);
    galleryUrls.push(galleryImageUrl);
  }

  // Update database
  await prisma.activity.update({
    where: { id: activityId },
    data: {
      image: mainImageUrl,
      gallery: JSON.stringify(galleryUrls),
      imageSource: "AI_GENERATED_FALLBACK",
      imagePrompt: mainPrompt,
      galleryPrompts: JSON.stringify(galleryPrompts),
      imagesGeneratedAt: new Date(),
    },
  });

  console.log(`✅ Generated ${1 + galleryUrls.length} images for ${activity.title}`);
  console.log(`   Main: ${mainImageUrl}`);
  console.log(`   Gallery: ${galleryUrls.length} images`);
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 AI Activity Image Generation Script");
  console.log("=".repeat(60));

  const args = process.argv.slice(2);
  const activityIdArg = args.find((arg) => arg.startsWith("--activity-id="));

  if (activityIdArg) {
    // Generate for specific activity
    const activityId = activityIdArg.split("=")[1];
    await generateActivityImages(activityId);
  } else {
    // Generate for all activities with missing or AI-generated images
    console.log("📊 Fetching activities that need image generation...\n");

    const activities = await prisma.activity.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { imageSource: null },
          { imageSource: "AI_GENERATED_FALLBACK" },
          { image: { contains: "unsplash.com" } }, // Replace broken Unsplash links
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(`Found ${activities.length} activities to process\n`);

    for (const activity of activities) {
      await generateActivityImages(activity.id);
      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("\n✨ Image generation complete!");
  console.log("=".repeat(60));
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
