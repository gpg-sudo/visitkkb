"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface MapPinData {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  lat: number;
  lng: number;
  address: string | null;
  linkType: string;
  iconType: string;
  isVisible: boolean;
  priority: number;
  sourceType?: string;
  activity?: { id: string; title: string; slug: string } | null;
  stay?: { id: string; title: string; slug: string } | null;
  restaurant?: { id: string; name: string; slug: string } | null;
}

const CATEGORIES = [
  { value: "ALL", label: "All Categories" },
  { value: "HOT_SPRING", label: "Hot Springs" },
  { value: "WATERFALL", label: "Waterfalls" },
  { value: "HIKING", label: "Hiking" },
  { value: "TOWN", label: "Town & History" },
  { value: "DINING", label: "Dining" },
  { value: "ACTIVITY", label: "Activities" },
  { value: "STAY", label: "Accommodation" },
  { value: "PARAGLIDING", label: "Paragliding" },
  { value: "RAFTING", label: "Rafting" },
  { value: "OTHER", label: "Other" },
];

const categoryColors: Record<string, string> = {
  HOT_SPRING: "bg-orange-100 text-orange-700",
  WATERFALL: "bg-blue-100 text-blue-700",
  HIKING: "bg-green-100 text-green-700",
  TOWN: "bg-purple-100 text-purple-700",
  DINING: "bg-amber-100 text-amber-700",
  ACTIVITY: "bg-cyan-100 text-cyan-700",
  STAY: "bg-pink-100 text-pink-700",
  PARAGLIDING: "bg-sky-100 text-sky-700",
  RAFTING: "bg-indigo-100 text-indigo-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export default function MapPinsPage() {
  const [pins, setPins] = useState<MapPinData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "visible" | "hidden">("all");
  const [isSerpApiSyncing, setIsSerpApiSyncing] = useState(false);

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/map/pins?includeHidden=true");
      const data = await res.json();
      if (data.success) {
        setPins(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async (pin: MapPinData) => {
    try {
      const res = await fetch(`/api/map/pins/${pin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token", // TODO: Use real auth token
        },
        body: JSON.stringify({ isVisible: !pin.isVisible }),
      });

      const data = await res.json();
      if (data.success) {
        setPins((prev) =>
          prev.map((p) => (p.id === pin.id ? { ...p, isVisible: !p.isVisible } : p))
        );
      }
    } catch (error) {
      console.error("Failed to toggle visibility:", error);
    }
  };

  const deletePin = async (pin: MapPinData) => {
    if (!confirm(`Are you sure you want to delete "${pin.title}"?`)) return;

    try {
      const res = await fetch(`/api/map/pins/${pin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer admin-token", // TODO: Use real auth token
        },
      });

      const data = await res.json();
      if (data.success) {
        setPins((prev) => prev.filter((p) => p.id !== pin.id));
      }
    } catch (error) {
      console.error("Failed to delete pin:", error);
    }
  };

  const handleSerpApiSync = async () => {
    setIsSerpApiSyncing(true);
    try {
      const res = await fetch("/api/admin/serpapi/sync-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify({ query: "tourist attractions in Kuala Kubu Bharu" }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`✅ SerpAPI Sync successful!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\n\nTotal fetched: ${data.data.totalFetched}`);
        fetchPins(); // Refresh the list
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

  const filteredPins = pins.filter((pin) => {
    const matchesSearch =
      pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || pin.category === categoryFilter;

    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "visible" && pin.isVisible) ||
      (visibilityFilter === "hidden" && !pin.isVisible);

    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const getLinkDisplay = (pin: MapPinData) => {
    if (pin.linkType === "activity" && pin.activity) {
      return `Activity: ${pin.activity.title}`;
    }
    if (pin.linkType === "stay" && pin.stay) {
      return `Stay: ${pin.stay.title}`;
    }
    if (pin.linkType === "restaurant" && pin.restaurant) {
      return `Restaurant: ${pin.restaurant.name}`;
    }
    if (pin.linkType === "external") {
      return "External Link";
    }
    return "No link";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Map Pins</h1>
          <p className="text-muted-foreground mt-1">
            Manage points of interest that appear on the Explore KKB map.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSerpApiSync}
            disabled={isSerpApiSyncing}
          >
            {isSerpApiSyncing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Sync SerpAPI
          </Button>
          <Link href="/dashboard/explore/maps">
            <Button variant="outline">Map Settings</Button>
          </Link>
          <Link href="/dashboard/explore/map-pins/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Pin
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pins.length}</div>
            <p className="text-sm text-muted-foreground">Total Pins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {pins.filter((p) => p.isVisible).length}
            </div>
            <p className="text-sm text-muted-foreground">Visible</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-400">
              {pins.filter((p) => !p.isVisible).length}
            </div>
            <p className="text-sm text-muted-foreground">Hidden</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {pins.filter((p) => p.sourceType === "SERPAPI").length}
            </div>
            <p className="text-sm text-muted-foreground">From SerpAPI</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(pins.map((p) => p.category)).size}
            </div>
            <p className="text-sm text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={visibilityFilter}
                onChange={(e) =>
                  setVisibilityFilter(e.target.value as "all" | "visible" | "hidden")
                }
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
              <Button variant="outline" size="icon" onClick={fetchPins}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pins Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pins ({filteredPins.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPins.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No pins found</p>
              <p className="text-sm">
                {pins.length === 0
                  ? "Create your first map pin to get started."
                  : "Try adjusting your filters."}
              </p>
              {pins.length === 0 && (
                <Link href="/dashboard/explore/map-pins/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Pin
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPins.map((pin) => (
                <div
                  key={pin.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors hover:bg-muted/50 ${!pin.isVisible ? "opacity-60" : ""
                    }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[pin.category] || categoryColors.OTHER
                      }`}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{pin.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${categoryColors[pin.category] || categoryColors.OTHER
                          }`}
                      >
                        {pin.category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                      </span>
                      <span>•</span>
                      <span>{getLinkDisplay(pin)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(pin)}
                      title={pin.isVisible ? "Hide pin" : "Show pin"}
                    >
                      {pin.isVisible ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Link href={`/dashboard/explore/map-pins/${pin.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePin(pin)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

