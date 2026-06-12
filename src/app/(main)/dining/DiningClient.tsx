"use client";

import * as React from "react";
import { RestaurantCard } from "@/components/dining/RestaurantCard";
import { FilterSheet, FilterState } from "@/components/shared/FilterSheet";
import { Button } from "@/components/ui/Button";

// Define type matching the DB structure + serialized fields
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[];
  location: string;
  coordinates?: string | null;
  lat?: number | null;
  lng?: number | null;
  type: string;
  cuisine: string;
  cuisineTags: string[];
  priceRange: string;
  priceLevel: number;
  specialties: string;
  hours: string;
  operatingHoursJson?: string | null; // Structured weekly schedule
  hoursVerified?: boolean;
  isHalal: boolean;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  primaryAffiliateProvider?: string | null;
  affiliateDeepLink?: string | null;
  autoMatchEnabled?: boolean;
}

interface DiningClientProps {
  initialRestaurants: Restaurant[];
}

export function DiningClient({ initialRestaurants }: DiningClientProps) {
  const [filteredRestaurants, setFilteredRestaurants] =
    React.useState(initialRestaurants);
  const [filters, setFilters] = React.useState<FilterState>({
    priceRange: [0, 500],
    categories: [],
    cuisine: [],
    sortBy: "recommended",
  });
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  React.useEffect(() => {
    let result = initialRestaurants;

    // Filter by Price (Approximate mapping for $, $$, $$$)
    // $ = 0-30, $$ = 30-80, $$$ = 80+
    result = result.filter((restaurant) => {
      // Use priceLevel if available (1-4), map to budget
      // Level 1 ($): ~15
      // Level 2 ($$): ~55
      // Level 3 ($$$): ~100
      // Level 4 ($$$$): ~200
      let priceValue = 55; // Default $$
      
      if (restaurant.priceLevel) {
        if (restaurant.priceLevel === 1) priceValue = 15;
        if (restaurant.priceLevel === 2) priceValue = 55;
        if (restaurant.priceLevel === 3) priceValue = 100;
        if (restaurant.priceLevel === 4) priceValue = 200;
      } else {
        // Fallback to string
        if (restaurant.priceRange === "$") priceValue = 15;
        if (restaurant.priceRange === "$$") priceValue = 55;
        if (restaurant.priceRange === "$$$") priceValue = 100;
        if (restaurant.priceRange === "$$$$") priceValue = 200;
      }

      return (
        priceValue >= filters.priceRange[0] &&
        priceValue <= filters.priceRange[1]
      );
    });

    // Filter by Cuisine (Exact match on cuisine or check cuisineTags)
    if (filters.cuisine && filters.cuisine.length > 0) {
      result = result.filter((restaurant) => {
        const mainCuisineMatch = filters.cuisine!.includes(restaurant.cuisine);
        const tagMatch = restaurant.cuisineTags.some(tag => filters.cuisine!.includes(tag));
        return mainCuisineMatch || tagMatch;
      });
    }
    
    // Filter by Categories (using restaurant.type)
    if (filters.categories && filters.categories.length > 0) {
        result = result.filter((restaurant) => 
            filters.categories!.includes(restaurant.type)
        );
    }

    // Sort
    if (filters.sortBy === "price_low") {
      result.sort((a, b) => (a.priceLevel || 0) - (b.priceLevel || 0));
    } else if (filters.sortBy === "price_high") {
      result.sort((a, b) => (b.priceLevel || 0) - (a.priceLevel || 0));
    } else if (filters.sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === "recommended") {
        // Featured first, then ranking score
        result.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return 0; // Maintain stable sort otherwise (or use rankingScore if available)
        });
    }

    setFilteredRestaurants([...result]); // Create new array to trigger re-render
  }, [filters, initialRestaurants]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredRestaurants.length}
          </span>{" "}
          restaurants
        </p>
        {/* Filter button */}
        <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
          Filters
        </Button>
        <FilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          type="dining"
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {filteredRestaurants.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No restaurants found matching your filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                priceRange: [0, 500],
                categories: [],
                cuisine: [],
                sortBy: "recommended",
              })
            }
            className="mt-4 text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
