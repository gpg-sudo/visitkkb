"use client";

import GuideForm from "@/components/dashboard/activities/forms/GuideForm";
import { use } from "react";

// Page: Edit Guide
// Route: /admin/activities/guides/[id]

export default function GuideEditPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = use(params);
    // Mock data for demonstration
    const mockGuide = {
        name: "Ali bin Abu",
        dob: "1985-08-20",
        email: "ali@example.com",
        phone: "+60123456789",
        languages: "Malay, English",
        specialization: "Hiking, Bird Watching",
        bio: "Certified nature guide with deep knowledge of KKB flora and fauna.",
        malimId: "MG-12345",
        malimExpiry: "2026-12-31",
        whatsappLink: "https://chat.whatsapp.com/guide-group",
        apiToken: "guide_token",
        onLeave: false,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Edit Guide</h1>
                <p className="text-muted-foreground">
                    Update this guide’s profile, certifications, and availability.
                </p>
            </div>

            <GuideForm mode="edit" initialData={mockGuide} />
        </div>
    );
}
