"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
    const router = useRouter();

    return (
        <DashboardPageTemplate
            title="History & Culture"
            description="Manage historical sites and cultural content."
            actionLabel="Add Entry"
            onAction={() => router.push("/dashboard/content/history/create")}
        />
    );
}
