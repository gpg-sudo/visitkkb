import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { StayEditForm } from "@/components/dashboard/stays/StayEditForm";

interface EditStayPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditStayPage({ params }: EditStayPageProps) {
  const { slug } = await params;

  const stay = await prisma.stay.findUnique({
    where: { slug },
  });

  if (!stay) {
    notFound();
  }

  const formattedStay = {
    ...stay,
    shortDescription: stay.shortDescription ?? undefined,
    longDescription: stay.longDescription ?? undefined,
    coordinates: stay.coordinates ?? undefined,
    rawMeta: stay.rawMeta ?? undefined,
  };

  return (
    <div className="container mx-auto py-6">
      <StayEditForm initialStay={formattedStay as any} />
    </div>
  );
}


