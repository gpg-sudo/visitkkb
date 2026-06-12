import prisma from "@/lib/prisma";
import { DiningClient } from "./DiningClient";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
  // Fetch dining places from database
  const restaurants = await prisma.restaurant.findMany({
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
  const formattedRestaurants = restaurants.map((restaurant) => ({
    ...restaurant,
    gallery: restaurant.gallery ? JSON.parse(restaurant.gallery) : [],
    cuisineTags: restaurant.cuisineTags ? JSON.parse(restaurant.cuisineTags) : [],
    openDays: restaurant.openDays ? JSON.parse(restaurant.openDays) : [],
    createdAt: restaurant.createdAt.toISOString(),
    updatedAt: restaurant.updatedAt.toISOString(),
    priceLevel: restaurant.priceLevel ?? 2,
    description: restaurant.description ?? "",
    image: restaurant.image ?? "",
    location: restaurant.location ?? "",
    priceRange: restaurant.priceRange ?? "",
    specialties: restaurant.specialties ?? "",
    hours: restaurant.hours ?? "",
    type: restaurant.type ?? "",
    cuisine: restaurant.cuisine ?? "",
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Dining in KKB
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            From traditional kopitiams to fine dining, discover the diverse
            culinary scene of Kuala Kubu Bharu.
          </p>
        </div>
      </div>

      {/* Client Component for Filters & Grid */}
      <DiningClient initialRestaurants={formattedRestaurants} />
    </div>
  );
}
