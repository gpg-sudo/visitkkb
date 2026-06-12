"use client";

import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Building, Database, RefreshCw, AlertCircle } from "lucide-react";

export default function AccommodationAPIsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accommodation APIs</h1>
        <p className="text-muted-foreground">
          Configure data sources used to fetch and sync accommodation listings for the Where to Stay section.
          These APIs provide property information, ratings, and availability data.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-muted-foreground">
              Google Places, Booking.com API
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-green-500" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">OK</p>
            <p className="text-sm text-muted-foreground">
              Last sync: Today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-500" />
              Stays Imported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">
              Hotels, homestays, resorts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How These APIs Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Google Places (Accommodation)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Fetches hotel and lodging data from Google Maps. Provides ratings,
                reviews, photos, and location data. Used to populate initial listing data.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge>Ratings</Badge>
                <Badge>Photos</Badge>
                <Badge>Location</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Booking.com Content API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Access property details, availability, and pricing from Booking.com.
                Requires partner API access. Used for richer accommodation data.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge>Pricing</Badge>
                <Badge>Availability</Badge>
                <Badge>Amenities</Badge>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium">Data Flow</h4>
            <p className="text-sm text-muted-foreground mt-1">
              1. APIs fetch accommodation data for Kuala Kubu Bharu area<br />
              2. Data is upserted into <code className="bg-background px-1 rounded">StayListing</code> table<br />
              3. Manual descriptions and affiliate settings are preserved during sync<br />
              4. Frontend displays combined API + manual data on /stays pages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Integration List */}
      <IntegrationList
        category="ACCOMMODATION"
        title="Accommodation Data Sources"
        description="APIs used to fetch and sync stay/hotel listings. Click 'Sync' to pull latest data."
        showSyncButton
      />
    </div>
  );
}
