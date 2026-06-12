import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RestaurantForm } from "@/components/dashboard/dining/RestaurantForm";

interface EditDiningPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditDiningPage({ params }: EditDiningPageProps) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <RestaurantForm initialData={restaurant} isEditing />
    </div>
  );
}

