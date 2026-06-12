import prisma from "@/lib/prisma";
import { DiningListClient } from "@/components/dashboard/dining/DiningListClient";

export const dynamic = "force-dynamic";

export default async function DiningPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const formattedRestaurants = restaurants.map(r => ({
    ...r,
    description: r.description ?? "",
    image: r.image ?? "",
    cuisine: r.cuisine ?? "",
    priceLevel: r.priceLevel ?? 1,
    rating: r.rating || 0,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <DiningListClient initialRestaurants={formattedRestaurants as any} />;
}
