"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  DollarSign,
  ChevronLeft,
  Utensils,
  Truck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Restaurant } from "../DiningClient"; // Import shared type
import { OperatingHoursDisplay } from "@/components/dining/OperatingHoursDisplay";

const DELIVERY_PROVIDERS: Record<string, { label: string; color: string }> = {
  FOODPANDA: { label: "Foodpanda", color: "bg-pink-500 hover:bg-pink-600 text-white" },
  GRABFOOD: { label: "GrabFood", color: "bg-green-500 hover:bg-green-600 text-white" },
  SHOPEEFOOD: { label: "ShopeeFood", color: "bg-orange-500 hover:bg-orange-600 text-white" },
};

const priceRangeDisplay: Record<string, string> = {
  $: "Budget-friendly",
  $$: "Moderate",
  $$$: "Fine Dining",
  $$$$: "Premium",
};

export default function DiningDetailClient({ restaurant }: { restaurant: Restaurant }) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Prepare images array: main image + gallery
  const images = [restaurant.image, ...restaurant.gallery].filter(Boolean);

  const handleOrderDelivery = () => {
    if (restaurant.affiliateDeepLink) {
      window.open(restaurant.affiliateDeepLink, "_blank");
      return;
    }
    const redirectUrl = `/api/dining/${restaurant.slug}/affiliate-redirect`;
    window.open(redirectUrl, "_blank");
  };

  const hasDelivery = restaurant.primaryAffiliateProvider || 
    restaurant.affiliateDeepLink || 
    restaurant.autoMatchEnabled;

  const deliveryProvider = restaurant.primaryAffiliateProvider
    ? DELIVERY_PROVIDERS[restaurant.primaryAffiliateProvider]
    : null;

  // Parse specialties if string
  const specialtiesList = typeof restaurant.specialties === "string"
    ? restaurant.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : restaurant.specialties;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/dining">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dining
          </Button>
        </Link>
      </div>

      {/* Image Gallery */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid gap-4">
          {/* Main Image */}
          <div className="relative h-96 w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={images[selectedImage] || "/images/dining/placeholder.jpg"}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-24 rounded-lg overflow-hidden bg-muted transition-all ${
                    selectedImage === idx ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${restaurant.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
                  {restaurant.cuisine}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-muted">
                  {restaurant.priceRange}
                </span>
                {restaurant.isHalal && (
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                    Halal
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4 font-serif">
                {restaurant.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {restaurant.location}
                </div>
                {(restaurant.rating > 0) && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {restaurant.rating.toFixed(1)} Rating
                    {restaurant.reviewCount > 0 && ` (${restaurant.reviewCount} reviews)`}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {priceRangeDisplay[restaurant.priceRange] || restaurant.priceRange}
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Place</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {restaurant.description}
                </p>
              </CardContent>
            </Card>

            {/* Specialties */}
            {specialtiesList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Signature Dishes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {specialtiesList.map((specialty: string) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-muted text-foreground rounded-md text-sm font-medium flex items-center gap-2"
                      >
                        <Utensils className="h-3 w-3 text-muted-foreground" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Button */}
            {hasDelivery && (
              <Card className="border-primary/20 bg-primary/5 shadow-md">
                <CardContent className="pt-6">
                  <Button 
                    className={`w-full gap-2 h-12 text-lg font-semibold ${deliveryProvider?.color || ""}`}
                    onClick={handleOrderDelivery}
                  >
                    <Truck className="h-5 w-5" />
                    Order Delivery
                    <ExternalLink className="h-4 w-4 ml-auto opacity-70" />
                  </Button>
                  <p className="text-xs text-center mt-2 text-muted-foreground">
                    Powered by {deliveryProvider?.label || "Affiliate Partner"}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Visit Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Structured Operating Hours */}
                <OperatingHoursDisplay 
                  operatingHoursJson={restaurant.operatingHoursJson || null}
                  fallbackHours={restaurant.hours}
                />

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Address
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {restaurant.location}
                  </p>
                  {restaurant.coordinates && (
                    <Button variant="outline" className="w-full" size="sm" onClick={() => {
                        // Open Google Maps
                        try {
                            const coords = JSON.parse(restaurant.coordinates!);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`, '_blank');
                        } catch {
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + " " + restaurant.location)}`, '_blank');
                        }
                    }}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

