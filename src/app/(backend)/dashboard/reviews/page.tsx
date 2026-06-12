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
import { Search, Filter, Star, Flag, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

// Mock Data
const reviews = [
    {
        id: 1,
        user: "Sarah Ahmad",
        item: "Bukit Kutu Hiking",
        rating: 5,
        comment: "Amazing experience! The guide was very knowledgeable.",
        date: "2024-05-16",
        status: "Published",
    },
    {
        id: 2,
        user: "John Doe",
        item: "The Sticks Retreat",
        rating: 4,
        comment: "Great place to relax, but the food could be better.",
        date: "2024-06-02",
        status: "Published",
    },
    {
        id: 3,
        user: "Anonymous",
        item: "Whitewater Rafting",
        rating: 1,
        comment: "Terrible service. Avoid at all costs!",
        date: "2024-05-21",
        status: "Flagged",
    },
    {
        id: 4,
        user: "Emily Chen",
        item: "Paragliding Adventure",
        rating: 5,
        comment: "Best experience of my life! Highly recommended.",
        date: "2024-05-23",
        status: "Pending",
    },
];

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">
                    Reviews
                </h1>
                <p className="text-muted-foreground">
                    Moderate and manage user reviews.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search reviews..." className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="flagged">Flagged</SelectItem>
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
                                    <TableHead>User</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">
                                            {review.user}
                                        </TableCell>
                                        <TableCell>{review.item}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="ml-1 text-sm text-foreground">{review.rating}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {review.comment}
                                        </TableCell>
                                        <TableCell>{review.date}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.status === "Published"
                                                        ? "bg-green-100 text-green-800"
                                                        : review.status === "Flagged"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {review.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500">
                                                    <Flag className="w-4 h-4" />
                                                </Button>
                                            </div>
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
