"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";

export default function FAQPage() {
    const router = useRouter();

    return (
        <DashboardPageTemplate
            title="FAQ & Safety"
            description="Manage frequently asked questions and safety guidelines."
            actionLabel="Add FAQ"
            onAction={() => router.push("/dashboard/content/faq/create")}
        />
    );
}
