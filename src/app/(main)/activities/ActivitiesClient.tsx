"use client";

import * as React from "react";
import { Suspense } from "react";
import { Activity } from "@/lib/data/activities";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { FilterSheet, FilterState } from "@/components/shared/FilterSheet";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ActivitiesClientProps {
  initialActivities: Activity[];
}

function ActivitiesContent({ initialActivities }: ActivitiesClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [filteredActivities, setFilteredActivities] =
    React.useState(initialActivities);
  const [filters, setFilters] = React.useState<FilterState>({
    priceRange: [0, 500],
    categories: categoryParam ? [categoryParam] : [],
    difficulty: "",
    sortBy: "recommended",
  });
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  // Update filters when URL category changes
  React.useEffect(() => {
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam],
      }));
    }
  }, [categoryParam]);

  React.useEffect(() => {
    let result = initialActivities;

    // Filter by Price
    result = result.filter(
      (activity) =>
        activity.pricePerPerson >= filters.priceRange[0] &&
        activity.pricePerPerson <= filters.priceRange[1],
    );

    // Filter by Difficulty
    if (filters.difficulty && filters.difficulty !== "") {
      result = result.filter(
        (activity) => activity.difficulty === filters.difficulty,
      );
    }

    // Filter by Categories (Tags) - Case insensitive & Hyphen handling
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((activity) =>
        activity.tags.some((tag) => {
          const normalizedTag = tag.toLowerCase().replace(/-/g, " ");
          return filters.categories!.some((filterCat) => {
            const normalizedFilter = filterCat.toLowerCase().replace(/-/g, " ");
            return normalizedTag.includes(normalizedFilter) || normalizedFilter.includes(normalizedTag);
          });
        }),
      );
    }

    setFilteredActivities(result);
  }, [filters, initialActivities]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <p className="text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredActivities.length}
          </span>{" "}
          activities
        </p>
        {/* Filter button */}
        <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
          Filters
        </Button>
        <FilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          type="activities"
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>

      {filteredActivities.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No activities found matching your filters.
          </p>
          <button
            onClick={() =>
              setFilters({
                priceRange: [0, 500],
                categories: [] as string[],
                difficulty: "",
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

export function ActivitiesClient({ initialActivities }: ActivitiesClientProps) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ActivitiesContent initialActivities={initialActivities} />
    </Suspense>
  );
}
