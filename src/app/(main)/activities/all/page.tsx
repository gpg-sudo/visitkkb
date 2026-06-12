import prisma from "@/lib/prisma";
import Link from "next/link";
import { ActivitiesClient } from "../ActivitiesClient";

export const dynamic = "force-dynamic";

export default async function AllActivitiesPage() {
  // Fetch active activities from the database
  const dbActivities = await prisma.activity.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Transform to match the frontend interface
  const activities = dbActivities.map((activity) => {
    const avgRating =
      activity.reviews.length > 0
        ? activity.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) /
        activity.reviews.length
        : 0;

    // Parse gallery JSON
    let galleryImages: string[] = [];
    try {
      galleryImages = JSON.parse(activity.gallery);
    } catch {
      galleryImages = [activity.image];
    }

    return {
      id: activity.id,
      title: activity.title,
      slug: activity.slug,
      description: activity.description,
      price: `RM ${activity.pricePerPerson}`,
      pricePerPerson: activity.pricePerPerson,
      rating: avgRating,
      image: activity.image,
      duration: activity.duration,
      difficulty: activity.difficulty.charAt(0) + activity.difficulty.slice(1).toLowerCase() as "Easy" | "Moderate" | "Hard",
      location: activity.location,
      tags: activity.tags ? activity.tags.split(",").map((t: string) => t.trim()) : [],
      maxParticipants: activity.maxParticipants,
      operatorIds: activity.operatorId,
      galleryImages: galleryImages,
      imageSource: (activity as unknown as { imageSource: string | null }).imageSource,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/activities" className="hover:text-primary">Things to Do</Link>
            <span>/</span>
            <span className="text-foreground">All Activities</span>
          </nav>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">
            All Activities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our complete collection of {activities.length} experiences in Kuala Kubu Bharu.
          </p>
        </div>
      </div>

      {/* Client Component for Filters & Grid */}
      <ActivitiesClient initialActivities={activities} />
    </div>
  );
}

