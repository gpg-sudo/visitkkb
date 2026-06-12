"use client";

import ActivityForm from "@/components/dashboard/activities/forms/ActivityForm";
import { use } from "react";

// Page: Edit Activity
// Route: /admin/activities/[id]

export default function ActivityEditPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id } = use(params);
    // Mock data for demonstration
    const mockActivity = {
        title: "White Water Rafting",
        slug: "white-water-rafting",
        shortTagline: "Adrenaline Rush",
        locationName: "Sungai Selangor, KKB",
        shortDescription: "Experience the thrill of white water rafting on the Selangor River. Suitable for beginners and experienced rafters alike.",
        durationText: "4 Hours",
        difficulty: "MODERATE",
        rating: 4.8,
        mainCategory: "Water Sports",
        tags: "Adventure, Group Friendly, Nature",
        price: 150,
        pricingUnit: "per person",
        priceLabel: "RM 150 per person",
        status: "PUBLISHED",
        isFeatured: true,
        bookingType: "EXTERNAL_LINK",
        bookingUrl: "https://example.com/book-rafting",
        showOnMap: true,
        mapLocation: { lat: "3.558", lng: "101.655" },
        operatorId: "1",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Edit Activity</h1>
                <p className="text-muted-foreground">
                    Update this activity’s details, pricing, and operator/guide links.
                </p>
            </div>

            <ActivityForm mode="edit" initialData={mockActivity} />
        </div>
    );
}
