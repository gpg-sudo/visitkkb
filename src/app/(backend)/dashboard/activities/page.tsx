import prisma from "@/lib/prisma";
import ActivitiesListClient from "./ActivitiesListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Activities Management | VisitKKB Admin",
    description: "Manage Kuala Kubu Bharu activities and experiences",
};

export default async function ActivitiesPage() {
    const activities = await prisma.activity.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            title: true,
            slug: true,
            image: true,
            location: true,
            pricePerPerson: true,
            difficulty: true,
            status: true,
            imageSource: true,
        },
    });

    return (
        <div className="container mx-auto py-6">
            <ActivitiesListClient initialActivities={activities} />
        </div>
    );
}
