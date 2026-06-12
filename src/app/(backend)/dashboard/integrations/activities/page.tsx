"use client";

import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mountain, MapPin, Star, RefreshCw } from "lucide-react";

export default function ActivitiesAPIsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities & Attractions APIs</h1>
        <p className="text-muted-foreground">
          Configure data sources for activities, points of interest, and attractions.
          These APIs power the Things to Do section and Explore Map features.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mountain className="h-4 w-4 text-green-500" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">15</p>
            <p className="text-sm text-muted-foreground">Hiking, rafting, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              POIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">32</p>
            <p className="text-sm text-muted-foreground">Points of interest</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Top Rated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">4.5+ star attractions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" />
              Last Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Today</p>
            <p className="text-sm text-muted-foreground">All sources OK</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Data Sources</CardTitle>
          <CardDescription>
            APIs that provide activity and attraction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Google Places (Activities)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Fetches tourist attractions, parks, and natural features from Google Maps.
                Great for discovering local POIs and outdoor activities.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">tourist_attraction</Badge>
                <Badge variant="outline">park</Badge>
                <Badge variant="outline">natural_feature</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">TripAdvisor Content API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Access attraction reviews, ratings, and rankings from TripAdvisor.
                Useful for enriching activities with user-generated content.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">Reviews</Badge>
                <Badge variant="outline">Rankings</Badge>
                <Badge variant="outline">Photos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Frontend Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 rounded border bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-sm">Things to Do</h4>
              <p className="text-xs text-muted-foreground">/activities</p>
            </div>
            <div className="p-3 rounded border bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-sm">Explore Map</h4>
              <p className="text-xs text-muted-foreground">/explore, Map markers</p>
            </div>
            <div className="p-3 rounded border bg-purple-50 dark:bg-purple-950/20">
              <h4 className="font-medium text-sm">Activity Detail Pages</h4>
              <p className="text-xs text-muted-foreground">/activities/[slug]</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration List */}
      <IntegrationList
        category="ACTIVITIES"
        title="Activities & Attractions Data Sources"
        description="APIs used to fetch activities, POIs, and attraction data. Use 'Sync' to import latest data."
        showSyncButton
      />
    </div>
  );
}
