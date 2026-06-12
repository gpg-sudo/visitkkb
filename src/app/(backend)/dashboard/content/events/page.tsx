"use client";

import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const mockEvents = [
    {
        id: "EVT-2025-001",
        name: "KKB International Paragliding Championship",
        date: "2025-05-15",
        location: "Bukit Batu Pahat",
        type: "Sports",
        status: "Published",
        registrations: 128,
    },
    {
        id: "EVT-2025-002",
        name: "KKB Heritage Food Festival",
        date: "2025-08-30",
        location: "KKB Town Centre",
        type: "Festival",
        status: "Draft",
        registrations: 0,
    },
    {
        id: "EVT-2025-003",
        name: "Selangor River Rafting Challenge",
        date: "2025-10-10",
        location: "Sungai Selangor",
        type: "Sports",
        status: "Scheduled",
        registrations: 42,
    },
];

export default function EventsPage() {
    const router = useRouter();

    return (
        <DashboardPageTemplate
            title="Events"
            description="Manage upcoming local events and festivals."
            actionLabel="New Event"
            onAction={() => router.push("/dashboard/content/events/create")}
        >
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Registrations
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockEvents.map((event) => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{event.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {event.id}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{event.date}</TableCell>
                                <TableCell>{event.location}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{event.type}</Badge>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === "Published"
                                            ? "bg-green-100 text-green-800"
                                            : event.status === "Scheduled"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {event.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    {event.registrations}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">
                                        Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </DashboardPageTemplate>
    );
}

