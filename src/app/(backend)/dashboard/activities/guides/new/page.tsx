"use client";

import GuideForm from "@/components/dashboard/activities/forms/GuideForm";

// Page: Add Guide
// Route: /admin/activities/guides/new

export default function GuideCreatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Add Guide</h1>
                <p className="text-muted-foreground">
                    Create a new guide profile with full certification and availability details.
                </p>
            </div>

            <GuideForm mode="create" />
        </div>
    );
}
