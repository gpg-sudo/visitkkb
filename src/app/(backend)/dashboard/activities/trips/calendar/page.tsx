"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { List, ChevronLeft, ChevronRight } from "lucide-react";

// Page: Trips Calendar
// Route: /admin/activities/trips/calendar

export default function TripsCalendarPage() {
    // Mock days for a calendar view
    const days = Array.from({ length: 35 }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Trips Calendar</h1>
                    <p className="text-muted-foreground">
                        Monthly view of all scheduled trips.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/activities/trips">
                        <Button variant="outline">
                            <List className="w-4 h-4 mr-2" />
                            List View
                        </Button>
                    </Link>
                    <Link href="/dashboard/activities/trips/new">
                        <Button>
                            Create New Trip
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
                <Button variant="ghost" size="icon">
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">February 2024</h2>
                <Button variant="ghost" size="icon">
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                {/* Weekday Headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, index) => {
                    const isCurrentMonth = day <= 29; // Mock logic for Feb
                    const dayNum = isCurrentMonth ? day : day - 29;

                    return (
                        <div key={index} className={`bg-background min-h-[120px] p-2 ${!isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""}`}>
                            <div className="text-right text-sm mb-2">{dayNum}</div>

                            {/* Mock Events */}
                            {isCurrentMonth && day === 12 && (
                                <Link href="/dashboard/activities/trips/1" className="block mb-1">
                                    <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded truncate hover:opacity-80">
                                        <span className="font-semibold">08:00</span> Rafting
                                    </div>
                                </Link>
                            )}
                            {isCurrentMonth && day === 18 && (
                                <Link href="/dashboard/activities/trips/2" className="block mb-1">
                                    <div className="bg-green-100 text-green-800 text-xs p-1 rounded truncate hover:opacity-80">
                                        <span className="font-semibold">09:00</span> Chiling Hike
                                    </div>
                                </Link>
                            )}
                            {isCurrentMonth && day === 18 && (
                                <Link href="/dashboard/activities/trips/3" className="block mb-1">
                                    <div className="bg-purple-100 text-purple-800 text-xs p-1 rounded truncate hover:opacity-80">
                                        <span className="font-semibold">14:00</span> Paragliding
                                    </div>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
