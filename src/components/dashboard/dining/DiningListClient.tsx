"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
    Plus,
    Search,
    ExternalLink,
    RefreshCw,
    Globe,
    PenLine,
    Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
    MANUAL: { label: "Manual", color: "bg-blue-100 text-blue-700" },
    GOOGLE_PLACES: { label: "Google", color: "bg-green-100 text-green-700" },
    SERPAPI: { label: "SerpAPI", color: "bg-purple-100 text-purple-700" },
};

const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-yellow-100 text-yellow-800",
    HIDDEN: "bg-gray-100 text-gray-800",
};

const DELIVERY_BADGES: Record<string, { label: string; color: string }> = {
    FOODPANDA: { label: "Foodpanda", color: "bg-pink-100 text-pink-700" },
    GRABFOOD: { label: "GrabFood", color: "bg-green-100 text-green-700" },
    SHOPEEFOOD: { label: "ShopeeFood", color: "bg-orange-100 text-orange-700" },
};

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    type: string;
    cuisine: string;
    location: string;
    sourceType: string;
    priceRange: string;
    rating: number;
    isHalal: boolean;
    isFeatured: boolean;
    primaryAffiliateProvider: string | null;
    autoMatchEnabled: boolean;
    status: string;
    [key: string]: unknown;
}

interface DiningListClientProps {
    initialRestaurants: Restaurant[];
}

export function DiningListClient({ initialRestaurants }: DiningListClientProps) {
    const router = useRouter();
    const restaurants = initialRestaurants;
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [sourceFilter, setSourceFilter] = useState("all");
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSerpApiSyncing, setIsSerpApiSyncing] = useState(false);

    const handleGoogleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/dining/sync-google", {
                method: "POST",
            });
            const data = await res.json();
            if (data.success) {
                router.refresh(); // Refresh server data
            } else {
                alert("Sync failed: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Sync failed:", error);
            alert("Sync failed check console");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSerpApiSync = async () => {
        setIsSerpApiSyncing(true);
        try {
            const res = await fetch("/api/admin/serpapi/sync-food", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer admin-token",
                },
                body: JSON.stringify({ query: "restaurants in Kuala Kubu Bharu" }),
            });
            const data = await res.json();

            if (data.success) {
                alert(`✅ SerpAPI Sync successful!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\n\nTotal fetched: ${data.data.totalFetched}`);
                router.refresh(); // Refresh server data
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

    const filteredRestaurants = restaurants.filter((restaurant: Restaurant) => {
        const matchesSearch =
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || restaurant.type === typeFilter;
        const matchesSource = sourceFilter === "all" || restaurant.sourceType === sourceFilter;
        return matchesSearch && matchesType && matchesSource;
    });

    // Get unique types from data
    const uniqueTypes = [...new Set(restaurants.map((r: Restaurant) => r.type))];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        What to Eat
                    </h1>
                    <p className="text-muted-foreground">
                        Manage dining listings, external data, and food delivery affiliates.
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
                    <Link href="/dashboard/dining/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Restaurant
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{restaurants.length}</div>
                        <p className="text-sm text-muted-foreground">Total Places</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                            {restaurants.filter((r: Restaurant) => r.sourceType === "MANUAL").length}
                        </div>
                        <p className="text-sm text-muted-foreground">Manual</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                            {restaurants.filter((r: Restaurant) => r.sourceType === "GOOGLE_PLACES").length}
                        </div>
                        <p className="text-sm text-muted-foreground">From Google</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-600">
                            {restaurants.filter((r: Restaurant) => r.sourceType === "SERPAPI").length}
                        </div>
                        <p className="text-sm text-muted-foreground">From SerpAPI</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-primary">
                            {restaurants.filter((r: Restaurant) => r.isHalal).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Halal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-amber-600">
                            {restaurants.filter((r: Restaurant) => r.isFeatured).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Featured</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-pink-600">
                            {restaurants.filter((r: Restaurant) => r.primaryAffiliateProvider).length}
                        </div>
                        <p className="text-sm text-muted-foreground">With Delivery</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search restaurants..."
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
                                    {uniqueTypes.map((type: string) => (
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
                                    <SelectItem value="GOOGLE_PLACES">Google</SelectItem>
                                    <SelectItem value="SERPAPI">SerpAPI</SelectItem>
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
                                    <TableHead>Restaurant</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Delivery</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRestaurants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No restaurants found. Add a new restaurant or sync from Google.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRestaurants.map((restaurant: Restaurant) => (
                                        <TableRow key={restaurant.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {restaurant.name}
                                                        {restaurant.isHalal && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                                                HALAL
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {restaurant.cuisine} • {restaurant.location}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                    {restaurant.type.replace(/_/g, " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_BADGES[restaurant.sourceType]?.color || "bg-gray-100"
                                                        }`}
                                                >
                                                    {SOURCE_BADGES[restaurant.sourceType]?.label || restaurant.sourceType}
                                                </span>
                                            </TableCell>
                                            <TableCell>{restaurant.priceRange}</TableCell>
                                            <TableCell>
                                                {restaurant.rating > 0 ? (
                                                    <span className="text-yellow-600">★ {restaurant.rating.toFixed(1)}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {restaurant.primaryAffiliateProvider ? (
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${DELIVERY_BADGES[restaurant.primaryAffiliateProvider]?.color || "bg-gray-100"
                                                            }`}
                                                    >
                                                        <Truck className="h-3 w-3" />
                                                        {DELIVERY_BADGES[restaurant.primaryAffiliateProvider]?.label || restaurant.primaryAffiliateProvider}
                                                    </span>
                                                ) : restaurant.autoMatchEnabled ? (
                                                    <span className="text-xs text-muted-foreground">Auto</span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[restaurant.status] || "bg-gray-100"
                                                        }`}
                                                >
                                                    {restaurant.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link href={`/dashboard/dining/${restaurant.slug}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <PenLine className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/dining/${restaurant.slug}`} target="_blank">
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
        </div>
    );
}
