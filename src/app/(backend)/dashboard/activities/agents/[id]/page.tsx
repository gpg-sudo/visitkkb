"use client";

import AgentForm from "@/components/dashboard/activities/forms/AgentForm";
import { use } from "react";

// Page: Edit Agent
// Route: /admin/activities/agents/[id]

export default function AgentEditPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = use(params);
    // Mock data for demonstration
    const mockAgent = {
        name: "Jane Smith",
        dob: "1990-05-15",
        email: "jane@example.com",
        phone: "+60123456789",
        address: "456 Agent St, KKB",
        bio: "Top performing agent with 5 years of experience.",
        company: "KKB Travel Agency",
        whatsappLink: "https://chat.whatsapp.com/example",
        apiToken: "secret_token",
        onLeave: false,
        commissionRate: 15,
        activities: "Hiking, Cycling",
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Edit Agent</h1>
                <p className="text-muted-foreground">
                    Update this agent’s profile, booking tools, and settings.
                </p>
            </div>

            <AgentForm mode="edit" initialData={mockAgent} />
        </div>
    );
}
