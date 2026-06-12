"use client";

import { Button } from "@/components/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Download } from "lucide-react";
import {
    RevenueChart,
    ActivityDistributionChart,
} from "@/components/dashboard/Charts";

// Mock Data
const revenueData = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 2780 },
    { name: "May", value: 1890 },
    { name: "Jun", value: 2390 },
    { name: "Jul", value: 3490 },
    { name: "Aug", value: 4200 },
    { name: "Sep", value: 5100 },
    { name: "Oct", value: 3800 },
    { name: "Nov", value: 4500 },
    { name: "Dec", value: 6000 },
];

const activityData = [
    { name: "Hiking", value: 400 },
    { name: "Rafting", value: 300 },
    { name: "Paragliding", value: 300 },
    { name: "Cycling", value: 200 },
    { name: "Camping", value: 150 },
    { name: "Workshops", value: 100 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        Analytics
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed platform performance and insights.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="30d">
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 Days</SelectItem>
                            <SelectItem value="30d">Last 30 Days</SelectItem>
                            <SelectItem value="90d">Last 3 months</SelectItem>
                            <SelectItem value="1y">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart
                    title="Total Revenue"
                    data={revenueData}
                    className="col-span-1 lg:col-span-2"
                />

                <ActivityDistributionChart
                    title="Bookings by Category"
                    data={activityData}
                    className="col-span-1"
                />

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
                            <p className="text-muted-foreground">User Growth Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Order Value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM 245.50</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Conversion Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2%</div>
                        <p className="text-xs text-red-600 flex items-center mt-1">
                            -0.5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Commission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM 12,450</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            +18% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
