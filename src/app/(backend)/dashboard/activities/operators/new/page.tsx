"use client";

import OperatorForm from "@/components/dashboard/activities/forms/OperatorForm";

// Page: Add Operator
// Route: /admin/activities/operators/new

export default function OperatorCreatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Add Operator</h1>
                <p className="text-muted-foreground">
                    Create a new operator profile with full company and compliance details.
                </p>
            </div>

            <OperatorForm mode="create" />
        </div>
    );
}
