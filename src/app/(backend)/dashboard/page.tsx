"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import {
    TrendingUp,
    Calendar,
    Users,
    ShoppingCart,
    DollarSign,
    Briefcase,
    UserCheck,
    Clock,
    Activity as ActivityIcon,
    MapPin,
    Utensils,
    FileText,
    AlertCircle,
} from "lucide-react";
import { AffiliateHealthWidget } from "@/components/dashboard/AffiliateHealthWidget";
import IntegrationsHealthWidget from "@/components/dashboard/IntegrationsHealthWidget";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts";

type SummaryData = {
    totalBookings: number;
    revenueToday: number;
    revenueMonth: number;
    activeListingsCount: number;
    pendingApprovals: number;
    last24hBookings: number;
    topActivities: { id: string; title: string; bookings: number }[];
    topOperators: { id: string; name: string; bookings: number; revenue: number }[];
    newUsersCount: number;
    avgRating: number;
};

type TrendPoint = {
    date: string;
    bookings: number;
    revenue: number;
};

type RecentActivityItem = {
    id: string;
    type: string;
    summary: string;
    createdAt: string;
    link?: string | null;
};

export default function DashboardPage() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<7 | 30 | 90>(7);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers = { Authorization: "Bearer admin-dashboard" };
                const now = new Date();
                const from = new Date(now.getTime() - range * 24 * 60 * 60 * 1000);
                const [summaryRes, trendRes, activityRes] = await Promise.all([
                    fetch("/api/admin/overview/summary", { headers }),
                    fetch(`/api/admin/overview/bookings-trend?from=${from.toISOString()}&to=${now.toISOString()}`, { headers }),
                    fetch(`/api/admin/overview/recent-activity?limit=20`, { headers }),
                ]);

                if (!summaryRes.ok) throw new Error("Failed to load summary");
                const summaryJson = await summaryRes.json();
                if (!summaryJson.success) throw new Error(summaryJson.error || "Failed to load summary");
                setSummary(summaryJson.data as SummaryData);

                if (trendRes.ok) {
                    const trendJson = await trendRes.json();
                    if (trendJson.success) setTrend(trendJson.data as TrendPoint[]);
                }

                if (activityRes.ok) {
                    const actJson = await activityRes.json();
                    if (actJson.success) setRecentActivity(actJson.data as RecentActivityItem[]);
                }
            } catch (e: unknown) {
                console.error(e);
                const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                setError(errorMessage || "Failed to load overview");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to your VisitKKB command center</p>
            </div>

            {/* Section 1: KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading && !summary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Loading overview…</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Fetching latest stats</p>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <Card className="border-red-200 bg-red-50 md:col-span-2 lg:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                Failed to load overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-red-700 mb-2">{error}</p>
                            <button
                                className="text-xs underline"
                                onClick={() => setRange((r) => r)}
                            >
                                Retry
                            </button>
                        </CardContent>
                    </Card>
                )}

                <Link href="/dashboard/activities">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activities Published</CardTitle>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary?.activeListingsCount ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Across all categories</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/activities/trips">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary?.last24hBookings ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Bookings last 24h</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/activities/guides">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Guides</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">—</div>
                            <p className="text-xs text-muted-foreground">Guide stats coming soon</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/system/bookings">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today&apos;s Bookings</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary?.last24hBookings ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">+ vs previous period</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            RM{" "}
                            {summary
                                ? summary.revenueMonth.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                  })
                                : "0"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Today: RM{" "}
                            {summary
                                ? summary.revenueToday.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                  })
                                : "0"}
                        </p>
                    </CardContent>
                </Card>

                <Link href="/dashboard/activities/operators">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Operators</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary?.topOperators.length ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">With recent bookings</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/activities/agents">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">—</div>
                            <p className="text-xs text-muted-foreground">Agent performance coming soon</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {summary?.pendingApprovals ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bookings & Revenue Trend */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Bookings & Revenue Trend
                    </CardTitle>
                    <div className="flex gap-2 text-xs">
                        {[7, 30, 90].map((r) => (
                            <button
                                key={r}
                                className={`px-2 py-1 rounded-full border ${
                                    range === r
                                        ? "bg-primary text-primary-foreground"
                                        : "border-muted-foreground/20"
                                }`}
                                onClick={() => setRange(r as 7 | 30 | 90)}
                            >
                                Last {r}d
                            </button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="h-64">
                    {trend.length === 0 ? (
                        <p className="text-xs text-muted-foreground mt-8">
                            No data yet for selected range.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 10 }}
                                    tickFormatter={(v) => `RM ${v}`}
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Bookings"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#16a34a"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Revenue (RM)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Section 2 & 3: Activity Feed + Intelligence */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* System Activity Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                    <div className="flex-1">
                                        <p className="text-sm">{activity.summary}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Activities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Top Performing Activities
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(summary?.topActivities || []).map((activity, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Bookings in recent period
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{activity.bookings}</p>
                                        <p className="text-xs text-muted-foreground">bookings</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Capacity Alerts */}
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="font-semibold">Active listings:</span>{" "}
                                {summary?.activeListingsCount ?? 0}
                            </p>
                            <p>
                                <span className="font-semibold">New users this month:</span>{" "}
                                {summary?.newUsersCount ?? 0}
                            </p>
                            <p>
                                <span className="font-semibold">Average rating:</span>{" "}
                                {summary ? summary.avgRating.toFixed(1) : "0.0"} ★
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3: Upcoming Trips */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Trips (Next 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        Upcoming trips schedule will be powered by real data from the trips module.
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Tourism Resources */}
            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/dashboard/stays/manual">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="w-4 h-4" />
                                Where to Stay
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Listings</span>
                                    <span className="font-bold">45</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">API Synced</span>
                                    <span className="font-bold">32</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Manual</span>
                                    <span className="font-bold">13</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/dining">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Utensils className="w-4 h-4" />
                                What to Eat
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Listings</span>
                                    <span className="font-bold">28</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Recent Updates</span>
                                    <span className="font-bold">5</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/content/events">
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4" />
                                Events & Blog
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Upcoming Events</span>
                                    <span className="font-bold">3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Published Blogs</span>
                                    <span className="font-bold">12</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Section 5: System Health & Integrations */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Integrations Health Widget */}
                <IntegrationsHealthWidget />
                
                {/* Affiliate Health Widget */}
                <AffiliateHealthWidget />
            </div>
        </div>
    );
}
