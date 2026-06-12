"use client";

import ActivityForm from "@/components/dashboard/activities/forms/ActivityForm";

// Page: Add Activity
// Route: /admin/activities/new

export default function ActivityCreatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Add Activity</h1>
                <p className="text-muted-foreground">
                    Create a new activity that will appear on the “Things to Do” page.
                </p>
            </div>

            <ActivityForm mode="create" />
        </div>
    );
}
