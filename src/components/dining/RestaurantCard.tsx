"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, DollarSign, MapPin, Star, Utensils, Truck, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Support both the old Restaurant type and new database Restaurant type
interface RestaurantData {
  id?: string | number;
  slug: string;
  name: string;
  image: string;
  cuisine: string;
  location: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  hours?: string;
  priceRange: string;
  specialties: string[] | string;
  isHalal?: boolean;
  isFeatured?: boolean;
  sourceType?: string;
  primaryAffiliateProvider?: string | null;
  affiliateDeepLink?: string | null;
  autoMatchEnabled?: boolean;
}

interface RestaurantCardProps {
  restaurant: RestaurantData;
  showDeliveryButton?: boolean;
}

const priceRangeDisplay: Record<string, string> = {
  $: "Budget-friendly",
  $$: "Moderate",
  $$$: "Fine Dining",
  $$$$: "Premium",
};

const DELIVERY_PROVIDERS: Record<string, { label: string; color: string }> = {
  FOODPANDA: { label: "Foodpanda", color: "bg-pink-500 hover:bg-pink-600" },
  GRABFOOD: { label: "GrabFood", color: "bg-green-500 hover:bg-green-600" },
  SHOPEEFOOD: { label: "ShopeeFood", color: "bg-orange-500 hover:bg-orange-600" },
};

export function RestaurantCard({ restaurant, showDeliveryButton = true }: RestaurantCardProps) {
  // Parse specialties if it's a string
  const specialtiesList = typeof restaurant.specialties === "string"
    ? restaurant.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : restaurant.specialties;

  // Handle delivery button click
  const handleOrderDelivery = () => {
    // If there's a direct affiliate deep link, use it
    if (restaurant.affiliateDeepLink) {
      window.open(restaurant.affiliateDeepLink, "_blank");
      return;
    }

    // Otherwise, use our affiliate redirect endpoint
    const redirectUrl = `/api/dining/${restaurant.slug}/affiliate-redirect`;
    window.open(redirectUrl, "_blank");
  };

  // Check if delivery is available
  const hasDelivery = restaurant.primaryAffiliateProvider || 
    restaurant.affiliateDeepLink || 
    restaurant.autoMatchEnabled;

  const deliveryProvider = restaurant.primaryAffiliateProvider
    ? DELIVERY_PROVIDERS[restaurant.primaryAffiliateProvider]
    : null;

  return (
    <Card className="overflow-hidden flex flex-col h-full group">
      <Link href={`/dining/${restaurant.slug}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={restaurant.image || "/images/dining/placeholder.jpg"}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-300"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium tracking-wide shadow-sm text-foreground">
              {restaurant.cuisine}
            </span>
            {restaurant.isHalal && (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Halal
              </span>
            )}
          </div>
          {restaurant.isFeatured && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              Featured
            </div>
          )}
          {restaurant.sourceType === "GOOGLE_PLACES" && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px]">
              Via Google
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl mb-1 font-serif truncate">
              {restaurant.name}
            </CardTitle>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{restaurant.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {(restaurant.rating || restaurant.rating === 0) && restaurant.rating > 0 && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs font-medium text-primary">
                <Star className="h-3 w-3 fill-primary" />
                {restaurant.rating.toFixed(1)}
              </div>
            )}
            {restaurant.reviewCount && restaurant.reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {restaurant.reviewCount} reviews
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {restaurant.description}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          {restaurant.hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="truncate">{restaurant.hours}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {priceRangeDisplay[restaurant.priceRange] || restaurant.priceRange}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {specialtiesList.slice(0, 3).map((specialty) => (
            <div
              key={specialty}
              className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
            >
              <Utensils className="h-3 w-3 mr-1" />
              {specialty}
            </div>
          ))}
          {specialtiesList.length > 3 && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              +{specialtiesList.length - 3} more
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4 bg-muted/10 gap-2">
        <div className="text-sm font-medium text-foreground">
          {restaurant.priceRange} • {restaurant.cuisine}
        </div>
        <div className="flex gap-2">
          <Link href={`/dining/${restaurant.slug}`}>
            <Button variant="outline" size="sm">Details</Button>
          </Link>
          {showDeliveryButton && hasDelivery && (
            <Button 
              size="sm" 
              onClick={handleOrderDelivery}
              className={`gap-1 ${deliveryProvider?.color || ""}`}
            >
              <Truck className="h-3 w-3" />
              Order
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
