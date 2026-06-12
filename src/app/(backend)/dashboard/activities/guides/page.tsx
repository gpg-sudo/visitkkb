"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus } from "lucide-react";

// Page: Guides List
// Route: /admin/activities/guides

export default function GuidesListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Guides</h1>
                    <p className="text-muted-foreground">
                        View and manage all registered guides.
                    </p>
                </div>
                <Link href="/dashboard/activities/guides/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Guide
                    </Button>
                </Link>
            </div>

            {/* TODO: Table/List of guides:
          - Name
          - Phone
          - Email
          - Status
          - "Edit" action -> /dashboard/activities/guides/[id]
      */}
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
                Guide List Placeholder
            </div>
        </div>
    );
}
