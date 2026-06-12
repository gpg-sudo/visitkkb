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
import { Search, Filter, UserCog } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Mock Data
const users = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@visitkkb.com",
        role: "ADMIN",
        status: "Active",
        joined: "2024-01-01",
    },
    {
        id: 2,
        name: "Malik Gunung",
        email: "malik@example.com",
        role: "OPERATOR",
        status: "Active",
        joined: "2024-02-15",
    },
    {
        id: 3,
        name: "Sarah Ahmad",
        email: "sarah@example.com",
        role: "USER",
        status: "Active",
        joined: "2024-03-10",
    },
    {
        id: 4,
        name: "John Doe",
        email: "john@example.com",
        role: "USER",
        status: "Inactive",
        joined: "2024-03-12",
    },
    {
        id: 5,
        name: "KKB Adventure",
        email: "info@kkbadventure.com",
        role: "OPERATOR",
        status: "Active",
        joined: "2024-02-20",
    },
];

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-primary">
                    Users
                </h1>
                <p className="text-muted-foreground">
                    Manage user accounts and roles.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            <Select defaultValue="all">
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="operator">Operator</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "ADMIN" ? "default" : user.role === "OPERATOR" ? "secondary" : "outline"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{user.joined}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <UserCog className="w-4 h-4" />
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
