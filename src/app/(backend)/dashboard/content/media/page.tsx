"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";

export default function MediaPage() {
    const router = useRouter();

    return (
        <DashboardPageTemplate
            title="Media Library"
            description="Manage images and videos."
            actionLabel="Upload Media"
            onAction={() => router.push("/dashboard/content/media/upload")}
        />
    );
}
