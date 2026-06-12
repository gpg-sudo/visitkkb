"use client";

import TripForm from "@/components/dashboard/trips/TripForm";

// Page: Create New Trip
// Route: /admin/activities/trips/new

export default function TripCreatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Create New Trip</h1>
                <p className="text-muted-foreground">
                    Schedule a new trip for an activity.
                </p>
            </div>

            <TripForm mode="create" />
        </div>
    );
}
