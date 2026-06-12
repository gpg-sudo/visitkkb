import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Operator as DbOperator } from "@prisma/client";
import ActivityBookingClient from "./ActivityBookingClient";
import type { Activity } from "@/lib/data/activities";
import type { Operator } from "@/lib/data/operators";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Fetch the activity with its primary operator
  const dbActivity = await prisma.activity.findUnique({
    where: { slug },
    include: {
      operator: true,
      reviews: {
        select: { rating: true }
      }
    }
  });

  if (!dbActivity) {
    notFound();
  }

  // 2. Determine keywords for finding related operators
  const searchTerms = [
    dbActivity.title.split(' ')[0], // First word of title (often "White", "KKB", "Bukit") - maybe not best
    ...(dbActivity.tags ? dbActivity.tags.split(',') : [])
  ].map(t => t.trim().toLowerCase())
    .filter(t => t.length > 3 && !['adventure', 'sports', 'nature', 'group', 'friendly', 'white', 'holiday', 'family'].includes(t));

  // Specific category logic to match our seed data
  let categoryKeyword = "";
  const titleLower = dbActivity.title.toLowerCase();
  const tagsLower = (dbActivity.tags || "").toLowerCase();

  if (titleLower.includes('rafting') || tagsLower.includes('rafting')) categoryKeyword = 'rafting';
  else if (titleLower.includes('paragliding') || tagsLower.includes('flying')) categoryKeyword = 'paragliding';
  else if (titleLower.includes('cycling') || tagsLower.includes('biking')) categoryKeyword = 'bike';
  else if (titleLower.includes('atv') || tagsLower.includes('quad')) categoryKeyword = 'atv';
  else if (titleLower.includes('kayak') || tagsLower.includes('water')) categoryKeyword = 'water'; // Broad for water sports
  else if (titleLower.includes('cultural') || tagsLower.includes('history')) categoryKeyword = 'heritage';
  else if (titleLower.includes('hike') || tagsLower.includes('hiking') || titleLower.includes('trek')) categoryKeyword = 'trek';
  else categoryKeyword = 'nature';

  // 3. Fetch other relevant operators
  const relatedOperators = await prisma.operator.findMany({
    where: {
      id: { not: dbActivity.operator.id }, // Exclude primary
      OR: [
        { description: { contains: categoryKeyword } },
        { name: { contains: categoryKeyword } },
        // Fallback to searching by tags if category match fails
        ...searchTerms.map(term => ({ description: { contains: term } }))
      ]
    },
    take: 3
  });

  const avgRating =
    dbActivity.reviews.length > 0
      ? dbActivity.reviews.reduce((sum, r) => sum + r.rating, 0) /
      dbActivity.reviews.length
      : 0;

  let galleryImages: string[] = [];
  try {
    galleryImages = JSON.parse(dbActivity.gallery);
  } catch {
    galleryImages = [dbActivity.image];
  }

  const activity: Activity = {
    id: dbActivity.id, // Use UUID directly
    title: dbActivity.title,
    slug: dbActivity.slug,
    description: dbActivity.description,
    price: `RM ${dbActivity.pricePerPerson}`,
    pricePerPerson: dbActivity.pricePerPerson,
    rating: avgRating,
    image: dbActivity.image,
    duration: dbActivity.duration,
    difficulty: (dbActivity.difficulty.charAt(0) + dbActivity.difficulty.slice(1).toLowerCase()) as "Easy" | "Moderate" | "Hard",
    location: dbActivity.location,
    tags: dbActivity.tags ? dbActivity.tags.split(",").map((t) => t.trim()) : [],
    maxParticipants: dbActivity.maxParticipants,
    operatorIds: dbActivity.operatorId, // Keep this for reference, though we pass objects now
    galleryImages: galleryImages,
    imageSource: (dbActivity as unknown as { imageSource: string | null }).imageSource
  };

  // Helper to map DB operator to Frontend Operator
  const mapOperator = (op: DbOperator): Operator => ({
    id: op.id,
    name: op.name,
    type: op.type === "OPERATOR" ? "company" : "guide",
    specialization: ["General"], // We could derive this from description
    rating: 5.0, // Mock or fetch real rating
    experience: "Verified Operator",
    contact: op.phone as string,
    logo: op.logo as string // Ensure your frontend Operator type supports 'logo' if added
  });

  const primaryOperator = mapOperator(dbActivity.operator);
  const otherOperators = relatedOperators.map(mapOperator);

  // Combine unique operators
  const allOperators = [primaryOperator, ...otherOperators];

  return (
    <ActivityBookingClient
      activity={activity}
      availableOperators={allOperators}
    />
  );
}
