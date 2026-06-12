"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

// Page: Agents List
// Route: /admin/activities/agents

export default function AgentsListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Agents</h1>
                    <p className="text-muted-foreground">
                        View and manage all registered agents.
                    </p>
                </div>
                <Link href="/dashboard/activities/agents/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Agent
                    </Button>
                </Link>
            </div>

            {/* TODO: Table/List of agents:
          - Name
          - Phone
          - Email
          - Status
          - "Edit" action -> /dashboard/activities/agents/[id]
      */}
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Agent List Placeholder
            </div>
        </div>
    );
}
