"use client";

import Link from "next/link";
import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Map, Navigation, Bus, Car, MapPin, Globe } from "lucide-react";

export default function MapsTransportPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Maps & Transport</h1>
        <p className="text-muted-foreground">
          Configure map providers, directions APIs, and transport data sources.
          Powers the Explore Map, location features, and route planning.
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Map className="h-4 w-4 text-blue-500" />
              Maps API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Google Maps</p>
            <p className="text-sm text-muted-foreground">Primary map provider</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Navigation className="h-4 w-4 text-green-500" />
              Directions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Enabled</p>
            <p className="text-sm text-muted-foreground">Route planning active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              Geocoding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Active</p>
            <p className="text-sm text-muted-foreground">Address lookups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              Map Pins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">45</p>
            <p className="text-sm text-muted-foreground">Active markers</p>
          </CardContent>
        </Card>
      </div>

      {/* Google Maps Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5" />
            Google Maps Platform Services
          </CardTitle>
          <CardDescription>
            APIs and services available through Google Maps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Maps JavaScript API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive maps for Explore Map, location pages, and embedded maps.
              </p>
              <Badge className="mt-2" variant="outline">
                Required
              </Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Places API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Location search, autocomplete, and place details.
              </p>
              <Badge className="mt-2" variant="outline">
                Required
              </Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Directions API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Route planning and navigation directions.
              </p>
              <Badge className="mt-2" variant="secondary">
                Optional
              </Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Geocoding API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Convert addresses to coordinates and vice versa.
              </p>
              <Badge className="mt-2" variant="secondary">
                Optional
              </Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Distance Matrix API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Calculate travel time and distance between points.
              </p>
              <Badge className="mt-2" variant="secondary">
                Optional
              </Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium">Static Maps API</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Generate map images for sharing and exports.
              </p>
              <Badge className="mt-2" variant="secondary">
                Optional
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transport Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Transport Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Public Transport</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Bus routes and schedules to/from Kuala Kubu Bharu.
                Currently using static data. Future: integrate transit API.
              </p>
              <Badge className="mt-2">Static Data</Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Driving Directions</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Google Maps Directions API provides driving routes from
                KL, Rawang, and other starting points.
              </p>
              <Badge className="mt-2" variant="outline">
                Google Maps
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Configuration Note */}
      <Card className="border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-lg">Map Settings & Pins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To configure default map center, zoom level, and manage map pins, visit the{" "}
            <Link href="/dashboard/explore/maps" className="text-primary underline">
              Map Settings
            </Link>{" "}
            and{" "}
            <Link href="/dashboard/explore/map-pins" className="text-primary underline">
              Map Pins
            </Link>{" "}
            pages under Discover & Explore.
          </p>
        </CardContent>
      </Card>

      {/* Integration List */}
      <IntegrationList
        category="MAPS_TRANSPORT"
        title="Maps & Transport Integrations"
        description="Configure map providers and transport APIs. Test connectivity to ensure maps work correctly."
      />
    </div>
  );
}

