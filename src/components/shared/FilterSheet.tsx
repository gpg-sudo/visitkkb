"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useState, useEffect } from "react";

export type FilterType = "activities" | "stays" | "dining";

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  difficulty?: string; // For activities
  amenities?: string[]; // For stays
  cuisine?: string[]; // For dining
  sortBy: string;
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: FilterType;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export function FilterSheet({
  isOpen,
  onClose,
  type,
  filters,
  onFilterChange,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 1000],
      categories: [],
      difficulty: "all",
      amenities: [],
      cuisine: [],
      sortBy: "recommended",
    };
    setLocalFilters(defaultFilters);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Refine your search results.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {/* Sort By */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Sort By</h3>
            <Select
              value={localFilters.sortBy}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, sortBy: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <h3 className="text-sm font-medium">Price Range</h3>
              <span className="text-sm text-muted-foreground">
                RM {localFilters.priceRange[0]} - RM{" "}
                {localFilters.priceRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={[0, 1000]}
              value={localFilters.priceRange}
              max={1000}
              step={10}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  priceRange: [value[0], value[1]],
                })
              }
            />
          </div>

          {/* Activities Filters */}
          {type === "activities" && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Difficulty</h3>
                <Select
                  value={localFilters.difficulty || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Categories checkboxes */}
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Categories</h3>
                <div className="grid gap-2">
                  {["Adventure", "Culture", "Nature"].map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat}`}
                        checked={localFilters.categories?.includes(cat)}
                        onCheckedChange={(checked) => {
                          const current = localFilters.categories || [];
                          if (checked) {
                            setLocalFilters({
                              ...localFilters,
                              categories: [...current, cat],
                            });
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              categories: current.filter((c) => c !== cat),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`category-${cat}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Stays Filters */}
          {type === "stays" && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Amenities</h3>
              <div className="grid gap-2">
                {["Wifi", "Pool", "Kitchen", "Parking", "AC"].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={localFilters.amenities?.includes(amenity)}
                      onCheckedChange={(checked) => {
                        const current = localFilters.amenities || [];
                        if (checked) {
                          setLocalFilters({
                            ...localFilters,
                            amenities: [...current, amenity],
                          });
                        } else {
                          setLocalFilters({
                            ...localFilters,
                            amenities: current.filter((a) => a !== amenity),
                          });
                        }
                      }}
                    />
                    <label
                      htmlFor={`amenity-${amenity}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dining Filters */}
          {type === "dining" && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Cuisine</h3>
              <div className="grid gap-2">
                {["Malay", "Chinese", "Indian", "Western", "Fusion"].map(
                  (cuisine) => (
                    <div key={cuisine} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${cuisine}`}
                        checked={localFilters.cuisine?.includes(cuisine)}
                        onCheckedChange={(checked) => {
                          const current = localFilters.cuisine || [];
                          if (checked) {
                            setLocalFilters({
                              ...localFilters,
                              cuisine: [...current, cuisine],
                            });
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              cuisine: current.filter((c) => c !== cuisine),
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`cuisine-${cuisine}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cuisine}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full">
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
