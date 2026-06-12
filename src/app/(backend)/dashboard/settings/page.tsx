"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";

export default function SettingsPage() {
    return (
        <DashboardPageTemplate
            title="General Settings"
            description="Configure platform-wide settings and preferences."
            actionLabel="Save Changes"
        />
    );
}
