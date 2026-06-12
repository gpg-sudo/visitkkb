"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    LayoutDashboard,
    FileText,
    Calendar,
    BookOpen,
    HelpCircle,
    Image,
    Compass,
    MapPin,
    Users,
    UserCheck,
    Briefcase,
    ShieldAlert,
    Home,
    Building,
    Settings as SettingsIcon,
    UtensilsCrossed,
    Menu as MenuIcon,
    Map,
    Route,
    Plug,
    MessageSquare,
    BarChart3,
    LogOut,
    ChevronDown,
    ChevronRight,
    Database,
} from "lucide-react";

interface SidebarProps {
    userRole?: "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "AGENT" | "GUIDE";
    className?: string;
}

interface NavLink {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
    children?: NavLink[];
}

export default function Sidebar({
    userRole = "SUPER_ADMIN",
    className,
}: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>([
        "Content Management",
        "Experiences & Activities",
    ]);

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title],
        );
    };

    const links: NavLink[] = [
        {
            title: "Dashboard Overview",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR", "AGENT", "GUIDE"],
        },
        {
            title: "Content Management",
            href: "/dashboard/content",
            icon: FileText,
            roles: ["SUPER_ADMIN", "ADMIN"],
            children: [
                {
                    title: "Blog & Articles",
                    href: "/dashboard/content/blog",
                    icon: BookOpen,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Events",
                    href: "/dashboard/content/events",
                    icon: Calendar,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "History & Culture",
                    href: "/dashboard/content/history",
                    icon: BookOpen,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "FAQ & Safety",
                    href: "/dashboard/content/faq",
                    icon: HelpCircle,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Media Library",
                    href: "/dashboard/content/media",
                    icon: Image,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
            ],
        },
        {
            title: "Experiences & Activities",
            href: "/dashboard/activities",
            icon: Compass,
            roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
            children: [
                {
                    title: "Activities Overview",
                    href: "/dashboard/activities",
                    icon: Compass,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Trips & Schedules",
                    href: "/dashboard/trips",
                    icon: Calendar,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR", "AGENT"],
                },
                {
                    title: "Operators",
                    href: "/dashboard/activities/operators",
                    icon: Briefcase,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Agents",
                    href: "/dashboard/activities/agents",
                    icon: Users,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Guides",
                    href: "/dashboard/activities/guides",
                    icon: UserCheck,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Permits & Insurance",
                    href: "/dashboard/permits",
                    icon: ShieldAlert,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
            ],
        },
        {
            title: "Where to Stay",
            href: "/dashboard/stays",
            icon: Home,
            roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
            children: [
                {
                    title: "Stay Listings",
                    href: "/dashboard/stays",
                    icon: Building,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Manual Stays",
                    href: "/dashboard/stays/manual",
                    icon: Home,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Affiliate Settings",
                    href: "/dashboard/stays/affiliate",
                    icon: SettingsIcon,
                    roles: ["SUPER_ADMIN"],
                },
            ],
        },
        {
            title: "What to Eat",
            href: "/dashboard/dining",
            icon: UtensilsCrossed,
            roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
            children: [
                {
                    title: "Dining Listings",
                    href: "/dashboard/dining",
                    icon: UtensilsCrossed,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
                {
                    title: "Manual Restaurants",
                    href: "/dashboard/dining/manual",
                    icon: UtensilsCrossed,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Menu Management",
                    href: "/dashboard/dining/menus",
                    icon: MenuIcon,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR"],
                },
            ],
        },
        {
            title: "Discover & Explore",
            href: "/dashboard/explore",
            icon: Map,
            roles: ["SUPER_ADMIN", "ADMIN"],
            children: [
                {
                    title: "Points of Interest",
                    href: "/dashboard/explore/poi",
                    icon: MapPin,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Transport & Routes",
                    href: "/dashboard/explore/transport",
                    icon: Route,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Map Settings",
                    href: "/dashboard/explore/maps",
                    icon: Map,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "Map Pins",
                    href: "/dashboard/explore/map-pins",
                    icon: MapPin,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
            ],
        },
        {
            title: "API & Integrations",
            href: "/dashboard/integrations",
            icon: Plug,
            roles: ["SUPER_ADMIN"],
            children: [
                {
                    title: "Data Ingestion",
                    href: "/dashboard/data-ingestion",
                    icon: Database,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Scraped Content",
                    href: "/dashboard/scraped-content",
                    icon: FileText,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Affiliate Programs",
                    href: "/dashboard/integrations/affiliate-programs",
                    icon: Plug,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Accommodation APIs",
                    href: "/dashboard/integrations/accommodation",
                    icon: Home,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Activities & Attractions",
                    href: "/dashboard/integrations/activities",
                    icon: Compass,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Dining APIs",
                    href: "/dashboard/integrations/dining",
                    icon: UtensilsCrossed,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Maps & Transport",
                    href: "/dashboard/integrations/maps-transport",
                    icon: Map,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Social Media",
                    href: "/dashboard/integrations/social-media",
                    icon: MessageSquare,
                    roles: ["SUPER_ADMIN"],
                },
            ],
        },
        {
            title: "System & Settings",
            href: "/dashboard/system",
            icon: SettingsIcon,
            roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR", "AGENT", "GUIDE"],
            children: [
                {
                    title: "User Roles & Permissions",
                    href: "/dashboard/system/users",
                    icon: Users,
                    roles: ["SUPER_ADMIN"],
                },
                {
                    title: "Booking Management",
                    href: "/dashboard/system/bookings",
                    icon: Calendar,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR", "AGENT"],
                },
                {
                    title: "WhatsApp Groups",
                    href: "/dashboard/whatsapp",
                    icon: MessageSquare,
                    roles: ["SUPER_ADMIN", "ADMIN", "OPERATOR", "AGENT"],
                },
                {
                    title: "Reports & Analytics",
                    href: "/dashboard/reports",
                    icon: BarChart3,
                    roles: ["SUPER_ADMIN", "ADMIN"],
                },
                {
                    title: "General Settings",
                    href: "/dashboard/settings",
                    icon: SettingsIcon,
                    roles: ["SUPER_ADMIN"],
                },
            ],
        },
    ];

    const filterLinks = (links: NavLink[]): NavLink[] => {
        return links
            .filter((link) => link.roles.includes(userRole))
            .map((link) => ({
                ...link,
                children: link.children ? filterLinks(link.children) : undefined,
            }))
            .filter((link) => !link.children || link.children.length > 0);
    };

    const filteredLinks = filterLinks(links);

    const renderNavLink = (link: NavLink, depth: number = 0) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        const isExpanded = expandedSections.includes(link.title);
        const hasChildren = link.children && link.children.length > 0;
        const isChildActive =
            hasChildren &&
            link.children!.some(
                (child) => pathname === child.href || pathname.startsWith(child.href),
            );

        return (
            <div key={link.href}>
                {hasChildren ? (
                    <div className="flex items-center gap-1">
                        <Link
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex-1",
                                depth > 0 && "pl-6",
                                isActive || isChildActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="truncate">{link.title}</span>
                        </Link>
                        <button
                            onClick={() => toggleSection(link.title)}
                            className={cn(
                                "p-2 rounded-lg transition-colors flex-shrink-0",
                                isActive || isChildActive
                                    ? "text-primary-foreground hover:bg-primary/90"
                                    : "text-muted-foreground hover:bg-muted",
                            )}
                            aria-label={`Toggle ${link.title}`}
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                ) : (
                    <Link
                        href={link.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            depth > 0 && "pl-10",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{link.title}</span>
                    </Link>
                )}

                {hasChildren && isExpanded && (
                    <div className="mt-1 space-y-1">
                        {link.children!.map((child) => renderNavLink(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-card border-r border-border",
                className,
            )}
        >
            <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-serif font-bold text-primary">
                        VisitKKB
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Admin
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {filteredLinks.map((link) => renderNavLink(link))}
                </nav>
            </div>

            <div className="p-4 border-t border-border">
                <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
