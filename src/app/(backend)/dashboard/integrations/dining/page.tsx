"use client";

import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Utensils, Coffee, Store, TrendingUp } from "lucide-react";

export default function DiningAPIsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dining APIs</h1>
        <p className="text-muted-foreground">
          Configure data sources for restaurants, cafes, and food establishments.
          These APIs power the What to Eat section with venue data, ratings, and reviews.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Utensils className="h-4 w-4 text-orange-500" />
              Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">18</p>
            <p className="text-sm text-muted-foreground">Family dining, warung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coffee className="h-4 w-4 text-brown-500" />
              Cafes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Coffee shops & cafes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4 text-green-500" />
              Street Food
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-sm text-muted-foreground">Local hawkers & stalls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Halal Certified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">25</p>
            <p className="text-sm text-muted-foreground">Halal-friendly options</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Source Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Google Places Integration</CardTitle>
          <CardDescription>
            Primary data source for dining establishments in Kuala Kubu Bharu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border">
            <h4 className="font-medium">What Gets Synced</h4>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">From Google</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• Name, address, coordinates</li>
                  <li>• Rating & review count</li>
                  <li>• Price level ($ to $$$$)</li>
                  <li>• Opening hours</li>
                  <li>• Photos</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preserved (Manual)</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• Custom descriptions</li>
                  <li>• Halal status (isHalal)</li>
                  <li>• Cuisine tags</li>
                  <li>• Affiliate settings</li>
                  <li>• Featured flag</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium">Place Types Searched</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge>restaurant</Badge>
              <Badge>cafe</Badge>
              <Badge>food</Badge>
              <Badge>bakery</Badge>
              <Badge>meal_takeaway</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Note */}
      <Card className="border-orange-200 dark:border-orange-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Food Delivery Affiliates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Food delivery affiliate programs (Foodpanda, GrabFood, ShopeeFood) are configured
            under{" "}
            <a href="/dashboard/integrations/affiliate-programs" className="text-primary underline">
              Affiliate Programs
            </a>
            . They are used when users click &quot;Order via Delivery&quot; on dining listings.
          </p>
        </CardContent>
      </Card>

      {/* Integration List */}
      <IntegrationList
        category="DINING"
        title="Dining Data Sources"
        description="APIs used to fetch restaurant and cafe listings. Click 'Sync' to pull latest data from Google Places."
        showSyncButton
      />
    </div>
  );
}
