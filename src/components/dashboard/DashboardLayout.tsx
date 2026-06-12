"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Sheet, SheetContent } from "@/components/ui/Sheet";

type DashboardRole = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "AGENT";

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: DashboardRole;
    userName?: string;
    userImage?: string;
}

export default function DashboardLayout({
    children,
    userRole = "SUPER_ADMIN",
    userName,
    userImage,
}: DashboardLayoutProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<DashboardRole>(userRole);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 fixed inset-y-0 z-20">
                <Sidebar userRole={currentRole} />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <Sidebar userRole={currentRole} />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                <TopBar
                    onMenuClick={() => setIsMobileOpen(true)}
                    userName={userName}
                    userImage={userImage}
                    userRole={currentRole}
                    onRoleChange={(role) => setCurrentRole(role as DashboardRole)}
                />
                <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
            </div>
        </div>
    );
}
