import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import DiningDetailClient from "./DiningDetailClient";

// Force dynamic to ensure fresh data on reload
export const dynamic = "force-dynamic";

interface RestaurantDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  // Await params in Next.js 15+
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) {
    notFound();
  }

  // Serialize and format for client component
  const formattedRestaurant = {
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
  };

  return <DiningDetailClient restaurant={formattedRestaurant} />;
}
