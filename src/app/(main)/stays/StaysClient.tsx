"use client";

import * as React from "react";
import { Stay } from "@/lib/data/stays";
import { StayCard } from "@/components/stays/StayCard";
import { FilterSheet, FilterState } from "@/components/shared/FilterSheet";
import { Button } from "@/components/ui/Button";

interface StaysClientProps {
  initialStays: Stay[];
}

export function StaysClient({ initialStays }: StaysClientProps) {
  const [filteredStays, setFilteredStays] = React.useState(initialStays);
  const [filters, setFilters] = React.useState<FilterState>({
    priceRange: [0, 500],
    categories: [] as string[], // maps to stay types
    amenities: [],
    sortBy: "recommended",
  });
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  React.useEffect(() => {
    let result = initialStays;

    // Filter by Price
    result = result.filter(
      (stay) =>
        stay.pricePerNight >= filters.priceRange[0] &&
        stay.pricePerNight <= filters.priceRange[1],
    );

    // Filter by Type (using categories as types)
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((stay) => filters.categories!.includes(stay.type));
    }

    // Filter by Amenities
    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter((stay) =>
        filters.amenities!.every((amenity) => stay.amenities.includes(amenity)),
      );
    }

    setFilteredStays(result);
  }, [filters, initialStays]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredStays.length}
          </span>{" "}
          properties
        </p>
        {/* Filter button */}
        <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
          Filters
        </Button>
        <FilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          type="stays"
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {filteredStays.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStays.map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No stays found matching your filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                priceRange: [0, 500],
                categories: [] as string[],
                amenities: [] as string[],
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
