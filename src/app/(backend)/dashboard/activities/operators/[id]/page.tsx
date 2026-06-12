"use client";

import OperatorForm from "@/components/dashboard/activities/forms/OperatorForm";
import { use } from "react";

// Page: Edit Operator
// Route: /admin/activities/operators/[id]

export default function OperatorEditPage({ params }: { params: Promise<{ id: string }> }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id } = use(params);
    // Mock data for demonstration
    const mockOperator = {
        company: "Example Operator",
        regNo: "123456-X",
        contactPerson: "John Doe",
        email: "contact@example.com",
        phone: "+60123456789",
        officePhone: "+60312345678",
        address: "123 Main St, KKB",
        description: "Experienced local operator specializing in hiking and rafting.",
        website: "https://example.com",
        whatsapp: "wa.me/60123456789",
        social: "@example_operator",
        tags: "Hiking, Rafting",
        permitExpiry: "2025-12-31",
        onLeave: false,
        bankName: "Maybank",
        accountNumber: "1234567890",
        commissionRate: 10,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Edit Operator</h1>
                <p className="text-muted-foreground">
                    Update this operator’s profile, contact details, documents, and activities.
                </p>
            </div>

            <OperatorForm mode="edit" initialData={mockOperator} />
        </div>
    );
}
