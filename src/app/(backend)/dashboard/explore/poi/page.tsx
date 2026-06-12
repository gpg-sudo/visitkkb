"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";

export default function POIPage() {
    const router = useRouter();

    return (
        <DashboardPageTemplate
            title="Points of Interest"
            description="Manage tourist attractions and landmarks."
            actionLabel="Add POI"
            onAction={() => router.push("/dashboard/explore/poi/create")}
        />
    );
}
