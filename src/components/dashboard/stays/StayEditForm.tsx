"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
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

interface StayInitialData {
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  longDescription?: string;
  location?: string;
  lat?: number | string | null;
  lng?: number | string | null;
  pricePerNight?: number | null;
  type?: string;
  amenities?: string | string[];
  maxGuests?: number | null;
  rooms?: number | null;
  status?: string;
  isFeatured?: boolean;
  rankingScore?: number | null;
  affiliateMatchName?: string | null;
  affiliateProvider?: string | null;
  affiliateDeepLink?: string | null;
  autoMatchEnabled?: boolean;
  experienceTags?: string | string[];
  image?: string | null;
  gallery?: string | string[];
  sourceType?: string;
  externalPlaceId?: string | null;
  currency?: string;
  priceFrom?: number | null;
  rating?: number;
  reviewCount?: number;
}

interface StayFormData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  longDescription: string;
  location: string;
  lat: string | number;
  lng: string | number;
  pricePerNight: string;
  type: string;
  amenities: string;
  maxGuests: string;
  rooms: string;
  status: string;
  isFeatured: boolean;
  rankingScore: string;
  affiliateMatchName: string;
  affiliateProvider: string;
  affiliateDeepLink: string;
  autoMatchEnabled: boolean;
  experienceTags: string;
  image: string;
  gallery: string;
}

interface StayEditFormProps {
  initialStay: StayInitialData;
}

const STAY_TYPES = [
  "HOTEL",
  "HOMESTAY",
  "HOSTEL",
  "RESORT",
  "CHALET",
  "CAMPING",
  "GLAMPING",
  "APARTMENT",
];

const STATUS_OPTIONS = ["PUBLISHED", "DRAFT", "HIDDEN"];

export function StayEditForm({ initialStay }: StayEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<StayFormData>({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    longDescription: "",
    location: "",
    lat: "",
    lng: "",
    pricePerNight: "",
    type: "HOTEL",
    amenities: "",
    maxGuests: "",
    rooms: "1",
    status: "PUBLISHED",
    isFeatured: false,
    rankingScore: "",
    affiliateMatchName: "",
    affiliateProvider: "",
    affiliateDeepLink: "",
    autoMatchEnabled: true,
    experienceTags: "",
    image: "",
    gallery: "",
  });

  const [sourceInfo, setSourceInfo] = useState({
    sourceType: initialStay.sourceType as string,
    externalPlaceId: initialStay.externalPlaceId as string | null,
    currency: initialStay.currency as string,
    priceFrom: initialStay.priceFrom as number | null,
    rating: initialStay.rating as number,
    reviewCount: initialStay.reviewCount as number,
  });

  useEffect(() => {
    if (!initialStay) return;

    let gallery = "";
    try {
      gallery = initialStay.gallery
        ? Array.isArray(initialStay.gallery)
          ? (initialStay.gallery as string[]).join(", ")
          : JSON.parse(initialStay.gallery as string).join(", ")
        : "";
    } catch {
      gallery = (initialStay.gallery as string) || "";
    }

    const amenities = initialStay.amenities
      ? typeof initialStay.amenities === "string"
        ? initialStay.amenities
        : (initialStay.amenities as string[]).join(", ")
      : "";

    let experienceTags = "";
    try {
      experienceTags = initialStay.experienceTags
        ? Array.isArray(initialStay.experienceTags)
          ? (initialStay.experienceTags as string[]).join(", ")
          : JSON.parse(initialStay.experienceTags as string).join(", ")
        : "";
    } catch {
      experienceTags = (initialStay.experienceTags as string) || "";
    }

    setFormData({
      title: initialStay.title || "",
      slug: initialStay.slug || "",
      shortDescription: initialStay.shortDescription || "",
      description: initialStay.description || "",
      longDescription: initialStay.longDescription || "",
      location: initialStay.location || "",
      lat: initialStay.lat ?? "",
      lng: initialStay.lng ?? "",
      pricePerNight: initialStay.pricePerNight?.toString() || "",
      type: initialStay.type || "HOTEL",
      amenities,
      maxGuests: initialStay.maxGuests?.toString() || "",
      rooms: initialStay.rooms?.toString() || "1",
      status: initialStay.status || "PUBLISHED",
      isFeatured: initialStay.isFeatured || false,
      rankingScore: initialStay.rankingScore?.toString() || "",
      affiliateMatchName: initialStay.affiliateMatchName || "",
      affiliateProvider: initialStay.affiliateProvider || "",
      affiliateDeepLink: initialStay.affiliateDeepLink || "",
      autoMatchEnabled: initialStay.autoMatchEnabled ?? true,
      experienceTags,
      image: initialStay.image || "",
      gallery,
    });

    setSourceInfo({
      sourceType: (initialStay.sourceType as string) || "",
      externalPlaceId: initialStay.externalPlaceId || null,
      currency: initialStay.currency || "MYR",
      priceFrom: initialStay.priceFrom ?? null,
      rating: initialStay.rating ?? 0,
      reviewCount: initialStay.reviewCount ?? 0,
    });
  }, [initialStay]);

  const handleChange = (key: string, value: unknown) => {
    setFormError(null);
    setFormData((prev: StayFormData) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.slug) {
        setFormError("Name and slug are required.");
        setIsSubmitting(false);
        return;
      }

      const payload: Record<string, unknown> = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        image: formData.image,
        gallery: formData.gallery
          ? formData.gallery
            .split(",")
            .map((url: string) => url.trim())
            .filter(Boolean)
          : [],
        location: formData.location,
        lat: formData.lat ? Number(formData.lat) : undefined,
        lng: formData.lng ? Number(formData.lng) : undefined,
        pricePerNight: formData.pricePerNight
          ? Number(formData.pricePerNight)
          : undefined,
        type: formData.type,
        amenities: formData.amenities
          ? formData.amenities
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean)
          : [],
        maxGuests: formData.maxGuests ? Number(formData.maxGuests) : undefined,
        rooms: formData.rooms ? Number(formData.rooms) : undefined,
        status: formData.status,
        isFeatured: formData.isFeatured,
        rankingScore: formData.rankingScore
          ? Number(formData.rankingScore)
          : undefined,
        affiliateMatchName: formData.affiliateMatchName || null,
        affiliateProvider: formData.affiliateProvider || null,
        affiliateDeepLink: formData.affiliateDeepLink || null,
        autoMatchEnabled: formData.autoMatchEnabled,
        experienceTags: formData.experienceTags
          ? formData.experienceTags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
          : [],
      };

      const response = await fetch(`/api/stays/${initialStay.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-dashboard",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        let message =
          errorData.error || errorData.message || "Failed to update stay";
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors = errorData.details
            .map((d: { path?: string[]; message: string }) => `${d.path?.join(".") || "Field"}: ${d.message}`)
            .join("\n");
          message = `Validation errors:\n${fieldErrors}`;
        }
        throw new Error(message);
      }

      alert("Stay updated successfully");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      setFormError(error instanceof Error ? error.message : "Failed to update stay");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Stay</h1>
          {formError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/stays")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Stay name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="stay-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier (used in /stays/[slug])
                </p>
              </div>

              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleChange("shortDescription", e.target.value)
                  }
                  placeholder="1–2 sentence summary. Manual override (not overwritten by sync)."
                />
              </div>

              <div className="space-y-2">
                <Label>Full Description</Label>
                <Textarea
                  className="min-h-[140px]"
                  value={formData.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  placeholder="Detailed description for this stay. Manual override (not overwritten by sync)."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location, Address & Map</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Location Name / Area</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g. KKB Town Centre, Ampang Pecah"
                />
                <p className="text-xs text-muted-foreground">
                  Local-friendly label shown on frontend. Manual field.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={formData.longDescription}
                  onChange={(e) =>
                    handleChange("longDescription", e.target.value)
                  }
                  placeholder="Full address as guests will see it"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => handleChange("lat", e.target.value)}
                    placeholder="3.57..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => handleChange("lng", e.target.value)}
                    placeholder="101.64..."
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Map picker can be added later; for now you can set lat/lng
                manually.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Thumbnail Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Main image used on cards. Manual override; sync will not
                  overwrite this if set.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Gallery Image URLs (comma-separated)</Label>
                <Textarea
                  value={formData.gallery}
                  onChange={(e) => handleChange("gallery", e.target.value)}
                  placeholder="https://..., https://..."
                />
                <p className="text-xs text-muted-foreground">
                  If images were imported from Google, you can override them
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Classification & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleChange("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => handleChange("type", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Price Per Night (MYR)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.pricePerNight}
                  onChange={(e) => handleChange("pricePerNight", e.target.value)}
                  placeholder="e.g. 250"
                />
              </div>

              <div className="space-y-2">
                <Label>Max Guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxGuests}
                  onChange={(e) => handleChange("maxGuests", e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>

              <div className="space-y-2">
                <Label>Rooms</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.rooms}
                  onChange={(e) => handleChange("rooms", e.target.value)}
                  placeholder="e.g. 2"
                />
              </div>

              <div className="space-y-2">
                <Label>Amenities (comma-separated)</Label>
                <Input
                  value={formData.amenities}
                  onChange={(e) => handleChange("amenities", e.target.value)}
                  placeholder="wifi, parking, riverside, family-friendly"
                />
                <p className="text-xs text-muted-foreground">
                  Manual list of amenities. Sync jobs will not overwrite this
                  field.
                </p>
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
              <CardTitle>Source & Google Places</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source Type</span>
                <span className="font-medium">{sourceInfo.sourceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">External Place ID</span>
                <span className="font-mono text-xs break-all">
                  {sourceInfo.externalPlaceId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating</span>
                <span>
                  {sourceInfo.rating?.toFixed(1)} ({sourceInfo.reviewCount}{" "}
                  reviews)
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Rating, review count and some address details may be updated by
                future syncs from Google or external providers. Manual fields
                like descriptions, images and amenities are preserved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate & Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Affiliate Match Name</Label>
                <Input
                  value={formData.affiliateMatchName}
                  onChange={(e) =>
                    handleChange("affiliateMatchName", e.target.value)
                  }
                  placeholder="Canonical name used for affiliate matching"
                />
              </div>

              <div className="space-y-2">
                <Label>Primary Affiliate Provider</Label>
                <Input
                  value={formData.affiliateProvider}
                  onChange={(e) =>
                    handleChange("affiliateProvider", e.target.value)
                  }
                  placeholder="BOOKING_COM, AGODA, EXPEDIA, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Direct Affiliate Deep Link</Label>
                <Input
                  value={formData.affiliateDeepLink}
                  onChange={(e) =>
                    handleChange("affiliateDeepLink", e.target.value)
                  }
                  placeholder="https://partner.booking.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  If set, users will be redirected here directly when clicking
                  Book/Check availability.
                </p>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <Label>Auto-Match Enabled</Label>
                <Switch
                  checked={formData.autoMatchEnabled}
                  onCheckedChange={(val) =>
                    handleChange("autoMatchEnabled", val)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Experience Tags (comma-separated)</Label>
                <Input
                  value={formData.experienceTags}
                  onChange={(e) =>
                    handleChange("experienceTags", e.target.value)
                  }
                  placeholder="family_friendly, romantic, nature_retreat, adventure_base"
                />
                <p className="text-xs text-muted-foreground">
                  Used for filtering in Where to Stay and Discover sections.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
