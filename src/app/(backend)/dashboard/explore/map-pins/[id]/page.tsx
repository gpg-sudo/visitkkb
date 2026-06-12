"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { MapPinForm } from "@/components/map/MapPinForm";
import { AlertCircle } from "lucide-react";

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
  activityId: string | null;
  stayId: string | null;
  restaurantId: string | null;
  externalUrl: string | null;
  iconType: string;
  isVisible: boolean;
  priority: number;
}

export default function EditMapPinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pin, setPin] = useState<MapPinData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const res = await fetch(`/api/map/pins/${id}`);
        const data = await res.json();

        if (data.success) {
          setPin(data.data);
        } else {
          setError(data.error || "Pin not found");
        }
      } catch (error) {
        console.error("Failed to fetch pin:", error);
        setError("Failed to load pin data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPin();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !pin) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5" />
          {error || "Pin not found"}
        </div>
        <button
          onClick={() => router.push("/dashboard/explore/map-pins")}
          className="mt-4 text-primary hover:underline"
        >
          ← Back to Map Pins
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MapPinForm
        mode="edit"
        initialData={{
          id: pin.id,
          title: pin.title,
          slug: pin.slug,
          description: pin.description || "",
          category: pin.category,
          lat: pin.lat.toString(),
          lng: pin.lng.toString(),
          address: pin.address || "",
          linkType: pin.linkType,
          activityId: pin.activityId || "",
          stayId: pin.stayId || "",
          restaurantId: pin.restaurantId || "",
          externalUrl: pin.externalUrl || "",
          iconType: pin.iconType,
          isVisible: pin.isVisible,
          priority: pin.priority.toString(),
        }}
      />
    </div>
  );
}

