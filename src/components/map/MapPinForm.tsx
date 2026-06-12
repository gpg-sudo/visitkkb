"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

interface MapPinFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  lat: string;
  lng: string;
  address: string;
  linkType: string;
  activityId: string;
  stayId: string;
  restaurantId: string;
  externalUrl: string;
  iconType: string;
  isVisible: boolean;
  priority: string;
}

interface Activity {
  id: string;
  title: string;
  slug: string;
}

interface Stay {
  id: string;
  title: string;
  slug: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface MapPinFormProps {
  mode: "create" | "edit";
  initialData?: Partial<MapPinFormData> & { id?: string };
}

const CATEGORIES = [
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

const ICON_TYPES = [
  { value: "default", label: "Default Pin" },
  { value: "waterfall", label: "Waterfall" },
  { value: "hot_spring", label: "Hot Spring" },
  { value: "hiking", label: "Hiking" },
  { value: "raft", label: "Rafting" },
  { value: "paraglide", label: "Paragliding" },
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel" },
  { value: "landmark", label: "Landmark" },
  { value: "photo_spot", label: "Photo Spot" },
];

const LINK_TYPES = [
  { value: "none", label: "No Link" },
  { value: "activity", label: "Link to Activity" },
  { value: "stay", label: "Link to Stay" },
  { value: "restaurant", label: "Link to Restaurant" },
  { value: "external", label: "External URL" },
];

export function MapPinForm({ mode, initialData }: MapPinFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<MapPinFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "OTHER",
    lat: initialData?.lat?.toString() || "3.5728",
    lng: initialData?.lng?.toString() || "101.6411",
    address: initialData?.address || "",
    linkType: initialData?.linkType || "none",
    activityId: initialData?.activityId || "",
    stayId: initialData?.stayId || "",
    restaurantId: initialData?.restaurantId || "",
    externalUrl: initialData?.externalUrl || "",
    iconType: initialData?.iconType || "default",
    isVisible: initialData?.isVisible ?? true,
    priority: initialData?.priority?.toString() || "0",
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch activities, stays, and restaurants for linking
    const fetchLinkOptions = async () => {
      try {
        const [activitiesRes, staysRes, restaurantsRes] = await Promise.all([
          fetch("/api/search?type=activities&limit=100"),
          fetch("/api/search?type=stays&limit=100"),
          fetch("/api/search?type=restaurants&limit=100"),
        ]);

        const [activitiesData, staysData, restaurantsData] = await Promise.all([
          activitiesRes.json(),
          staysRes.json(),
          restaurantsRes.json(),
        ]);

        if (activitiesData.success) setActivities(activitiesData.data?.activities || []);
        if (staysData.success) setStays(staysData.data?.stays || []);
        if (restaurantsData.success) setRestaurants(restaurantsData.data?.restaurants || []);
      } catch (error) {
        console.error("Failed to fetch link options:", error);
      }
    };

    fetchLinkOptions();
  }, []);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: mode === "create" ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const url =
        mode === "create" ? "/api/map/pins" : `/api/map/pins/${initialData?.id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token", // TODO: Use real auth token
        },
        body: JSON.stringify({
          ...formData,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          priority: parseInt(formData.priority),
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/dashboard/explore/map-pins");
        router.refresh();
      } else {
        setError(data.error || "Failed to save pin");
      }
    } catch (error) {
      console.error("Failed to save pin:", error);
      setError("Failed to save pin. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/explore/map-pins">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "create" ? "Add New Pin" : "Edit Pin"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create"
                ? "Create a new point of interest for the map."
                : "Update this map pin."}
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === "create" ? "Create Pin" : "Save Changes"}
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Name and identification for this pin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Chilling Waterfall"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="chilling-waterfall"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly identifier (auto-generated from title)
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this location..."
                className="w-full px-3 py-2 border rounded-md bg-background min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>GPS coordinates and address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lat: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lng: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="e.g., Jalan Kolam Air, KKB"
              />
            </div>

            {/* Mini Map Preview Placeholder */}
            <div className="border rounded-lg p-4 bg-muted/50 text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                Lat: {formData.lat}, Lng: {formData.lng}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Interactive map picker coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Link Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Link Configuration</CardTitle>
            <CardDescription>Connect this pin to content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkType">Link Type</Label>
              <select
                id="linkType"
                value={formData.linkType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, linkType: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {LINK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.linkType === "activity" && (
              <div>
                <Label htmlFor="activityId">Select Activity</Label>
                <select
                  id="activityId"
                  value={formData.activityId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, activityId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">-- Select Activity --</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.linkType === "stay" && (
              <div>
                <Label htmlFor="stayId">Select Stay</Label>
                <select
                  id="stayId"
                  value={formData.stayId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stayId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">-- Select Stay --</option>
                  {stays.map((stay) => (
                    <option key={stay.id} value={stay.id}>
                      {stay.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.linkType === "restaurant" && (
              <div>
                <Label htmlFor="restaurantId">Select Restaurant</Label>
                <select
                  id="restaurantId"
                  value={formData.restaurantId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, restaurantId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">-- Select Restaurant --</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.linkType === "external" && (
              <div>
                <Label htmlFor="externalUrl">External URL</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  value={formData.externalUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, externalUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Icon and visibility options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="iconType">Icon Type</Label>
              <select
                id="iconType"
                value={formData.iconType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, iconType: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                {ICON_TYPES.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="priority">Priority (0-100)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, priority: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher priority pins appear more prominently
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Visible on Map</p>
                <p className="text-sm text-muted-foreground">
                  Show this pin on the public map
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, isVisible: !prev.isVisible }))
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  formData.isVisible
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {formData.isVisible ? "Visible" : "Hidden"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

