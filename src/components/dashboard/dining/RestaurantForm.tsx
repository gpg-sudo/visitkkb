"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  OperatingHoursEditor,
  WeeklySchedule,
  scheduleToHumanReadable
} from "./OperatingHoursEditor";

const RESTAURANT_TYPES = [
  "RESTAURANT", "CAFE", "WARUNG", "STREET_FOOD", "DESSERT", "BAKERY", "MAMAK"
];

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

interface RestaurantFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  location: string;
  lat: string | number;
  lng: string | number;
  type: string;
  cuisine: string;
  cuisineTags: string;
  priceRange: string;
  priceLevel: number;
  isHalal: boolean;
  isFeatured: boolean;
  status: string;
  image: string;
  gallery: string;
  primaryAffiliateProvider: string;
  affiliateDeepLink: string;
  autoMatchEnabled: boolean;
  [key: string]: unknown;
}

interface RestaurantFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any>;
  isEditing?: boolean;
}

export function RestaurantForm({ initialData, isEditing = false }: RestaurantFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operatingHours, setOperatingHours] = useState<WeeklySchedule | null>(null);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    location: "",
    lat: "",
    lng: "",
    type: "RESTAURANT",
    cuisine: "",
    cuisineTags: "",
    priceRange: "$$",
    priceLevel: 2,
    isHalal: false,
    isFeatured: false,
    status: "PUBLISHED",
    image: "",
    gallery: "",
    primaryAffiliateProvider: "none",
    affiliateDeepLink: "",
    autoMatchEnabled: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        name: (initialData.name as string) || "",
        slug: (initialData.slug as string) || "",
        description: (initialData.description as string) || "",
        shortDescription: (initialData.shortDescription as string) || "",
        location: (initialData.location as string) || "",
        type: (initialData.type as string) || "RESTAURANT",
        cuisine: (initialData.cuisine as string) || "",
        priceRange: (initialData.priceRange as string) || "$$",
        isHalal: (initialData.isHalal as boolean) || false,
        isFeatured: (initialData.isFeatured as boolean) || false,
        status: (initialData.status as string) || "PUBLISHED",
        image: (initialData.image as string) || "",
        autoMatchEnabled: initialData.autoMatchEnabled !== false,
        cuisineTags: Array.isArray(initialData.cuisineTags)
          ? (initialData.cuisineTags as string[]).join(", ")
          : (typeof initialData.cuisineTags === 'string' && initialData.cuisineTags.startsWith('[') ? JSON.parse(initialData.cuisineTags).join(", ") : ((initialData.cuisineTags as string) || "")),
        gallery: Array.isArray(initialData.gallery)
          ? (initialData.gallery as string[]).join(", ")
          : (typeof initialData.gallery === 'string' && initialData.gallery.startsWith('[') ? JSON.parse(initialData.gallery).join(", ") : ((initialData.gallery as string) || "")),
        primaryAffiliateProvider: (initialData.primaryAffiliateProvider as string) || "none",
        affiliateDeepLink: (initialData.affiliateDeepLink as string) || "",
        lat: (initialData.lat as string) || "",
        lng: (initialData.lng as string) || "",
        priceLevel: (initialData.priceLevel as number) || 2,
      });

      // Parse operating hours JSON if exists
      if (initialData.operatingHoursJson) {
        try {
          const parsed = typeof initialData.operatingHoursJson === 'string'
            ? JSON.parse(initialData.operatingHoursJson)
            : initialData.operatingHoursJson;
          setOperatingHours(parsed);
        } catch (e) {
          console.error("Failed to parse operating hours:", e);
        }
      }
    }
  }, [initialData]);

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev: RestaurantFormData) => {
      const newData = { ...prev, [key]: value };
      if (key === "name" && !isEditing && !prev.slug) {
        newData.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Generate human-readable hours from structured schedule
      const hours = operatingHours
        ? scheduleToHumanReadable(operatingHours)
        : "Hours not set";

      const payload = {
        ...formData,
        cuisineTags: formData.cuisineTags ? formData.cuisineTags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
        gallery: formData.gallery ? formData.gallery.split(",").map((url: string) => url.trim()).filter(Boolean) : [],
        primaryAffiliateProvider: formData.primaryAffiliateProvider === "none" ? null : formData.primaryAffiliateProvider,
        affiliateDeepLink: formData.affiliateDeepLink || null,
        lat: formData.lat ? Number(formData.lat) : null,
        lng: formData.lng ? Number(formData.lng) : null,
        priceLevel: formData.priceLevel ? Number(formData.priceLevel) : null,
        // Operating hours
        hours: hours,
        operatingHoursJson: operatingHours,
        hoursVerified: operatingHours !== null,
      };

      const url = isEditing
        ? `/api/dining/${initialData?.slug}`
        : "/api/dining";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-dashboard",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);

        let errorMessage = errorData.error || errorData.message || "Failed to save restaurant";
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors = errorData.details.map((d: { path?: string[]; message: string }) =>
            `${d.path?.join('.') || 'Field'}: ${d.message}`
          ).join('\n');
          errorMessage = `Validation errors:\n${fieldErrors}`;
        }
        throw new Error(errorMessage);
      }

      router.push("/dashboard/dining");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes('\n')) {
        alert(message.replace(/\\n/g, '\n'));
      } else {
        alert("Error saving restaurant: " + message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "Edit Restaurant" : "Add Restaurant"}</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Listing" : "Create Listing"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Restaurant Name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="restaurant-name-kkb"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">URL-friendly identifier</p>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  placeholder="Brief summary..."
                  value={formData.shortDescription}
                  onChange={(e) => handleChange("shortDescription", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  className="h-32"
                  placeholder="Detailed description..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location Name / Address</Label>
                <Input
                  placeholder="e.g., KKB Town Center"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="3.57..."
                    value={formData.lat}
                    onChange={(e) => handleChange("lat", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="101.64..."
                    value={formData.lng}
                    onChange={(e) => handleChange("lng", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours - New Structured Editor */}
          <OperatingHoursEditor
            value={operatingHours}
            onChange={setOperatingHours}
          />

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thumbnail Image URL</Label>
                <Input
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Main image for the card</p>
              </div>
              <div className="space-y-2">
                <Label>Gallery Images (comma separated URLs)</Label>
                <Textarea
                  placeholder="https://..., https://..."
                  value={formData.gallery}
                  onChange={(e) => handleChange("gallery", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={(val) => handleChange("status", val)} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="HIDDEN">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select onValueChange={(val) => handleChange("type", val)} value={formData.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESTAURANT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Cuisine</Label>
                <Input
                  placeholder="e.g., Malay, Western"
                  value={formData.cuisine}
                  onChange={(e) => handleChange("cuisine", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Cuisine Tags</Label>
                <Input
                  placeholder="e.g., Spicy, Halal, Breakfast"
                  value={formData.cuisineTags}
                  onChange={(e) => handleChange("cuisineTags", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Comma separated</p>
              </div>

              <div className="space-y-2">
                <Label>Price Range</Label>
                <Select onValueChange={(val) => handleChange("priceRange", val)} value={formData.priceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <Label>Halal Certified/Friendly</Label>
                <Switch
                  checked={formData.isHalal}
                  onCheckedChange={(val) => handleChange("isHalal", val)}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <Label>Featured Listing</Label>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(val) => handleChange("isFeatured", val)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Delivery</Label>
                <Select
                  onValueChange={(val) => handleChange("primaryAffiliateProvider", val)}
                  value={formData.primaryAffiliateProvider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="FOODPANDA">Foodpanda</SelectItem>
                    <SelectItem value="GRABFOOD">GrabFood</SelectItem>
                    <SelectItem value="SHOPEEFOOD">ShopeeFood</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Direct Deep Link</Label>
                <Input
                  placeholder="https://foodpanda..."
                  value={formData.affiliateDeepLink}
                  onChange={(e) => handleChange("affiliateDeepLink", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
