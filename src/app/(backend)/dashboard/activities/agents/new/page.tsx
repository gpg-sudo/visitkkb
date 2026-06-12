"use client";

import AgentForm from "@/components/dashboard/activities/forms/AgentForm";

// Page: Add Agent
// Route: /admin/activities/agents/new

export default function AgentCreatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Add Agent</h1>
                <p className="text-muted-foreground">
                    Create a new agent profile with full personal and booking details.
                </p>
            </div>

            <AgentForm mode="create" />
        </div>
    );
}
