import prisma from "@/lib/prisma";
import { StaysClient } from "./StaysClient";

export const dynamic = "force-dynamic";

export default async function StaysPage() {
  // Fetch stays from database
  const stays = await prisma.stay.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [
      { isFeatured: "desc" },
      { rankingScore: "desc" },
      { rating: "desc" },
    ],
  });

  // Serialize JSON fields and dates for client component
  const formattedStays = stays.map((stay) => ({
    ...stay,
    gallery: stay.gallery ? JSON.parse(stay.gallery) : [],
    coordinates: stay.coordinates ? JSON.parse(stay.coordinates) : null,
    experienceTags: stay.experienceTags ? JSON.parse(stay.experienceTags) : [],
    amenities: stay.amenities ? stay.amenities.split(',').map(a => a.trim()) : [],
    images: stay.gallery ? JSON.parse(stay.gallery) : [],
    capacity: stay.maxGuests,
    rating: stay.rating || 0,
    createdAt: stay.createdAt.toISOString(),
    updatedAt: stay.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            From cozy chalets by the river to luxury villas on the hill,
            discover the best accommodations Kuala Kubu Bharu has to offer.
          </p>
        </div>
      </div>

      {/* Client Component for Filters & Grid */}
      <StaysClient initialStays={formattedStays} />
    </div>
  );
}
