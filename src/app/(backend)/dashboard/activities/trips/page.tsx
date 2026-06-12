"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Search, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/Input";

// Page: Trips List
// Route: /admin/activities/trips

export default function TripsListPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Trips & Schedule</h1>
                    <p className="text-muted-foreground">
                        View, filter, and manage all trips created by operators, agents, and guides.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/activities/trips/calendar">
                        <Button variant="outline">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Calendar View
                        </Button>
                    </Link>
                    <Link href="/dashboard/activities/trips/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Trip
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input className="pl-10" placeholder="Search trips by title, activity, or guide..." />
                </div>
                <div className="flex gap-2">
                    <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="">All Activities</option>
                        <option value="1">White Water Rafting</option>
                        <option value="2">Chiling Waterfall Hike</option>
                    </select>
                    <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option value="">All Statuses</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Trips Table */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-4 py-3">Trip Title</th>
                            <th className="px-4 py-3">Activity</th>
                            <th className="px-4 py-3">Date & Time</th>
                            <th className="px-4 py-3">Operator</th>
                            <th className="px-4 py-3">Guide(s)</th>
                            <th className="px-4 py-3">Capacity</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {/* Example Row 1 */}
                        <tr className="hover:bg-muted/5">
                            <td className="px-4 py-3 font-medium">Rafting - 12 Feb</td>
                            <td className="px-4 py-3">White Water Rafting</td>
                            <td className="px-4 py-3">12 Feb 2024, 08:00 AM</td>
                            <td className="px-4 py-3">KKB Outdoor</td>
                            <td className="px-4 py-3">Ali, Ahmad</td>
                            <td className="px-4 py-3">5 / 15</td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800">
                                    Upcoming
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link href="/dashboard/activities/trips/1">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </Link>
                            </td>
                        </tr>
                        {/* Example Row 2 */}
                        <tr className="hover:bg-muted/5">
                            <td className="px-4 py-3 font-medium">Chiling Hike - 18 Feb</td>
                            <td className="px-4 py-3">Chiling Waterfall Hike</td>
                            <td className="px-4 py-3">18 Feb 2024, 09:00 AM</td>
                            <td className="px-4 py-3">Nature Guides</td>
                            <td className="px-4 py-3">Sarah</td>
                            <td className="px-4 py-3">12 / 12</td>
                            <td className="px-4 py-3">
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-red-100 text-red-800">
                                    Fully Booked
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Link href="/dashboard/activities/trips/2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
