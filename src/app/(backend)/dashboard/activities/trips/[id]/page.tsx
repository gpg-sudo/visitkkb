"use client";

import TripForm from "@/components/dashboard/trips/TripForm";
import { use } from "react";

// Page: Edit Trip
// Route: /admin/activities/trips/[id]

export default function TripEditPage({ params }: { params: Promise<{ id: string }> }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = use(params);
    // Mock data for demonstration
    const mockTrip = {
        id: "1",
        title: "Rafting - 12 Feb",
        activityId: "1",
        operatorId: "1",
        agentId: "",
        guideIds: ["1", "2"],
        date: "2024-02-12",
        startTime: "08:00",
        endTime: "12:00",
        durationOverride: "",
        maxParticipants: 15,
        currentParticipants: 5,
        status: "UPCOMING",
        priceOverride: "",
        pricingUnit: "per person",
        meetingPointName: "KKB Post Office",
        whatsappGroupLink: "https://chat.whatsapp.com/example",
        notesForParticipants: "Please bring a change of clothes.",
        notesForGuide: "Check water levels before departure.",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Edit Trip</h1>
                <p className="text-muted-foreground">
                    Update trip details, schedule, and assignments.
                </p>
            </div>

            <TripForm mode="edit" initialData={mockTrip} />
        </div>
    );
}
