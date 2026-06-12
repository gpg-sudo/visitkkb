"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Plus, Search, ExternalLink, RefreshCw, Globe, PenLine, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface Stay {
    id: string;
    title: string;
    slug: string;
    type: string;
    location: string;
    pricePerNight: number;
    status: string;
    rooms: number;
    sourceType: string;
    rating: number;
    isFeatured: boolean;
    affiliateProvider: string | null;
    affiliateDeepLink: string | null;
    autoMatchEnabled: boolean;
    operator?: {
        name: string;
    } | null;
}

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
    MANUAL: { label: "Manual", color: "bg-blue-100 text-blue-700" },
    GOOGLE_TRAVEL: { label: "Google", color: "bg-green-100 text-green-700" },
    BOOKING_COM: { label: "Booking.com", color: "bg-indigo-100 text-indigo-700" },
    AGODA: { label: "Agoda", color: "bg-red-100 text-red-700" },
    SERPAPI: { label: "SerpAPI", color: "bg-purple-100 text-purple-700" },
};

const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-yellow-100 text-yellow-800",
    HIDDEN: "bg-gray-100 text-gray-800",
};

export default function StaysPage() {
    const [stays, setStays] = useState<Stay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBookingSyncing, setIsBookingSyncing] = useState(false);
    const [isSerpApiSyncing, setIsSerpApiSyncing] = useState(false);

    useEffect(() => {
        fetchStays();
    }, []);

    const fetchStays = async () => {
        try {
            const res = await fetch("/api/stays");
            const data = await res.json();
            if (data.success) {
                setStays(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stays:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/admin/sync/stays", {
                method: "POST",
                headers: {
                    Authorization: "Bearer admin-token", // TODO: Use real auth token
                },
            });
            const data = await res.json();

            if (data.success) {
                alert(`✅ Google Sync successful!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\n\nTotal fetched: ${data.data.totalFetched}`);
                fetchStays(); // Refresh the list
            } else {
                alert(`❌ Sync failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Sync failed:", error);
            alert('❌ Sync failed. Check console for details.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleBookingSync = async () => {
        setIsBookingSyncing(true);
        try {
            const res = await fetch("/api/admin/stays/sync-booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer admin-token", // TODO: Use real auth token
                },
            });
            const data = await res.json();

            if (data.success) {
                alert(`✅ Booking.com Sync successful!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\n\nTotal fetched: ${data.data.totalFetched}`);
                fetchStays(); // Refresh the list
            } else {
                alert(`❌ Booking.com sync failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Booking.com sync failed:", error);
            alert('❌ Booking.com sync failed. Check console for details.');
        } finally {
            setIsBookingSyncing(false);
        }
    };

    const handleSerpApiSync = async () => {
        setIsSerpApiSyncing(true);
        try {
            const res = await fetch("/api/admin/serpapi/sync-stays", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer admin-token",
                },
                body: JSON.stringify({ query: "hotels in Kuala Kubu Bharu" }),
            });
            const data = await res.json();

            if (data.success) {
                alert(`✅ SerpAPI Sync successful!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\n\nTotal fetched: ${data.data.totalFetched}`);
                fetchStays(); // Refresh the list
            } else {
                alert(`❌ SerpAPI sync failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("SerpAPI sync failed:", error);
            alert('❌ SerpAPI sync failed. Check console for details.');
        } finally {
            setIsSerpApiSyncing(false);
        }
    };

    const filteredStays = stays.filter((stay) => {
        const matchesSearch =
            stay.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stay.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || stay.type === typeFilter;
        const matchesSource = sourceFilter === "all" || stay.sourceType === sourceFilter;
        return matchesSearch && matchesType && matchesSource;
    });

    // Get unique types from data
    const uniqueTypes = [...new Set(stays.map((s) => s.type))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        Where to Stay
                    </h1>
                    <p className="text-muted-foreground">
                        Manage accommodation listings, external data, and affiliate settings.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleGoogleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Globe className="w-4 h-4 mr-2" />
                        )}
                        Sync Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleBookingSync}
                        disabled={isBookingSyncing}
                    >
                        {isBookingSyncing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Sync Booking.com
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleSerpApiSync}
                        disabled={isSerpApiSyncing}
                    >
                        {isSerpApiSyncing ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4 mr-2" />
                        )}
                        Sync SerpAPI
                    </Button>
                    <Link href="/dashboard/stays/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Stay
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stays.length}</div>
                        <p className="text-sm text-muted-foreground">Total Stays</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {stays.filter((s) => s.sourceType === "MANUAL").length}
                        </div>
                        <p className="text-sm text-muted-foreground">Manual</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            {stays.filter((s) => s.sourceType === "GOOGLE_TRAVEL").length}
                        </div>
                        <p className="text-sm text-muted-foreground">From Google</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-600">
                            {stays.filter((s) => s.sourceType === "SERPAPI").length}
                        </div>
                        <p className="text-sm text-muted-foreground">From SerpAPI</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-primary">
                            {stays.filter((s) => s.isFeatured).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Featured</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-indigo-600">
                            {stays.filter((s) => s.affiliateProvider).length}
                        </div>
                        <p className="text-sm text-muted-foreground">With Affiliate</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search stays..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {uniqueTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="MANUAL">Manual</SelectItem>
                                    <SelectItem value="GOOGLE_TRAVEL">Google</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Property</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Price/Night</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Affiliate</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                                            Loading stays...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredStays.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No stays found. Add a new stay or sync from Google.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStays.map((stay) => (
                                        <TableRow key={stay.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{stay.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {stay.location}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {stay.type.replace(/_/g, " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_BADGES[stay.sourceType]?.color || "bg-gray-100"
                                                        }`}
                                                >
                                                    {SOURCE_BADGES[stay.sourceType]?.label || stay.sourceType}
                                                </span>
                                            </TableCell>
                                            <TableCell>RM {stay.pricePerNight}</TableCell>
                                            <TableCell>
                                                {stay.rating > 0 ? (
                                                    <span className="text-yellow-600">★ {stay.rating.toFixed(1)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {stay.affiliateProvider ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                                                        <Link2 className="h-3 w-3" />
                                                        {stay.affiliateProvider}
                                                    </span>
                                                ) : stay.autoMatchEnabled ? (
                                                    <span className="text-xs text-muted-foreground">Auto</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[stay.status] || "bg-gray-100"
                                                        }`}
                                                >
                                                    {stay.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/dashboard/stays/${stay.slug}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <PenLine className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/stays/${stay.slug}`} target="_blank">
                                                        <Button variant="ghost" size="sm">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/dashboard/integrations/affiliates">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Link2 className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Affiliate Programs</p>
                                    <p className="text-sm text-muted-foreground">
                                        Manage booking partners
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/stays/create">
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Plus className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium">Add Manual Stay</p>
                                    <p className="text-sm text-muted-foreground">
                                        Create new listing
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={handleGoogleSync}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">Sync External Data</p>
                                <p className="text-sm text-muted-foreground">
                                    Import from Google Travel
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
