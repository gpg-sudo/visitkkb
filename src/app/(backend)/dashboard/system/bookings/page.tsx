"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Search, Filter, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Mock Data
const bookings = [
    {
        id: "BK-2024-001",
        customer: "Sarah Ahmad",
        item: "Bukit Kutu Hiking",
        type: "Activity",
        date: "2024-05-15",
        amount: 160,
        status: "Confirmed",
    },
    {
        id: "BK-2024-002",
        customer: "John Doe",
        item: "The Sticks Retreat",
        type: "Stay",
        date: "2024-06-01",
        amount: 450,
        status: "Pending",
    },
    {
        id: "BK-2024-003",
        customer: "Emily Chen",
        item: "Whitewater Rafting",
        type: "Activity",
        date: "2024-05-20",
        amount: 300,
        status: "Cancelled",
    },
    {
        id: "BK-2024-004",
        customer: "Michael Brown",
        item: "Paragliding Adventure",
        type: "Activity",
        date: "2024-05-22",
        amount: 250,
        status: "Confirmed",
    },
    {
        id: "BK-2024-005",
        customer: "Jessica Lee",
        item: "Fraser's Hill Tour",
        type: "Activity",
        date: "2024-05-25",
        amount: 120,
        status: "Confirmed",
    },
];

export default function BookingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">
                    Bookings
                </h1>
                <p className="text-muted-foreground">
                    Manage and view all customer bookings.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search bookings..." className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">
                                            {booking.id}
                                        </TableCell>
                                        <TableCell>{booking.customer}</TableCell>
                                        <TableCell>{booking.item}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{booking.type}</Badge>
                                        </TableCell>
                                        <TableCell>{booking.date}</TableCell>
                                        <TableCell>RM {booking.amount}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === "Confirmed"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
