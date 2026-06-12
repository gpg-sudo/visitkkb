"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { StayCard } from "@/components/stays/StayCard";
import { RestaurantCard } from "@/components/dining/RestaurantCard";
import { Button } from "@/components/ui/Button";

export function SearchClient() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState("all");
  interface SearchResult {
    id: string;
    title: string;
    [key: string]: unknown;
  }
  const [data, setData] = useState<{
      activities: SearchResult[];
      stays: SearchResult[];
      restaurants: SearchResult[];
  }>({ activities: [], stays: [], restaurants: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (!query) return;
      
      const fetchData = async () => {
          setLoading(true);
          try {
              // Map 'q' to 'query' for API
              const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&type=all`);
              const json = await res.json();
              if (json.success) {
                  // Ensure we handle potentially undefined arrays
                  setData({
                      activities: json.data.activities || [],
                      stays: json.data.stays || [],
                      restaurants: json.data.restaurants || [],
                  });
              }
          } catch (e) {
              console.error("Search failed", e);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [query]);

  const { activities, stays, restaurants } = data;

  const totalResults =
    activities.length + stays.length + restaurants.length;

  if (!query) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Search for something</h2>
        <p className="text-muted-foreground">
          Enter a keyword to search for activities, stays, or dining.
        </p>
      </div>
    );
  }

  if (loading) {
      return <div className="text-center py-12">Loading results...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">
          Search results for{" "}
          <span className="text-primary">&quot;{query}&quot;</span>
        </h1>
        <p className="text-muted-foreground">Found {totalResults} results</p>
      </div>

      {/* Custom Tabs */}
      <div className="flex space-x-2 border-b overflow-x-auto pb-1">
        <TabButton
          active={activeTab === "all"}
          onClick={() => setActiveTab("all")}
          label={`All (${totalResults})`}
        />
        <TabButton
          active={activeTab === "activities"}
          onClick={() => setActiveTab("activities")}
          label={`Activities (${activities.length})`}
        />
        <TabButton
          active={activeTab === "stays"}
          onClick={() => setActiveTab("stays")}
          label={`Stays (${stays.length})`}
        />
        <TabButton
          active={activeTab === "dining"}
          onClick={() => setActiveTab("dining")}
          label={`Dining (${restaurants.length})`}
        />
      </div>

      {/* Content */}
      <div className="space-y-12">
        {activeTab === "all" && (
          <>
            {activities.length > 0 && (
              <Section title="Activities" link="/activities">
                {activities.slice(0, 3).map((item) => (
                  <ActivityCard key={item.id} activity={item} />
                ))}
              </Section>
            )}
            {stays.length > 0 && (
              <Section title="Stays" link="/stays">
                {stays.slice(0, 3).map((item) => (
                  <StayCard key={item.id} stay={item} />
                ))}
              </Section>
            )}
            {restaurants.length > 0 && (
              <Section title="Dining" link="/dining">
                {restaurants.slice(0, 3).map((item) => (
                  <RestaurantCard key={item.id} restaurant={item} />
                ))}
              </Section>
            )}
            {totalResults === 0 && <NoResults />}
          </>
        )}

        {activeTab === "activities" && (
          <Grid>
            {activities.map((item) => (
              <ActivityCard key={item.id} activity={item} />
            ))}
            {activities.length === 0 && <NoResults />}
          </Grid>
        )}

        {activeTab === "stays" && (
          <Grid>
            {stays.map((item) => (
              <StayCard key={item.id} stay={item} />
            ))}
            {stays.length === 0 && <NoResults />}
          </Grid>
        )}

        {activeTab === "dining" && (
          <Grid>
            {restaurants.map((item) => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))}
            {restaurants.length === 0 && <NoResults />}
          </Grid>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="link" asChild>
          <Link href={link}>View All</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function NoResults() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      No results found. Try a different keyword.
    </div>
  );
}
