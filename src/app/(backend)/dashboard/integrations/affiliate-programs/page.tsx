"use client";

import IntegrationList from "@/components/dashboard/integrations/IntegrationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/Badge";
import { Building, Utensils, Mountain, Bus, ShoppingBag, Search } from "lucide-react";

const affiliateTypes = [
  { value: "ALL", label: "All Programs", icon: Search },
  { value: "ACCOMMODATION", label: "Accommodation", icon: Building },
  { value: "FOOD_DELIVERY", label: "Food Delivery", icon: Utensils },
  { value: "TOURS", label: "Tours & Activities", icon: Mountain },
  { value: "TRANSPORT", label: "Transport", icon: Bus },
  { value: "GEAR", label: "Gear & Shop", icon: ShoppingBag },
  { value: "META_SEARCH", label: "Meta Search", icon: Search },
];

export default function AffiliatesProgramsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Programs</h1>
        <p className="text-muted-foreground">
          Manage your affiliate partnerships for accommodations, tours, food delivery, and more.
          Configure affiliate IDs, deep link patterns, and track performance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accommodation Affiliates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">6</span>
            </div>
            <p className="text-xs text-muted-foreground">Booking, Agoda, Expedia...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Food Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-xs text-muted-foreground">Foodpanda, GrabFood, ShopeeFood</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tours & Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mountain className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">4</span>
            </div>
            <p className="text-xs text-muted-foreground">Viator, Klook, GetYourGuide...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meta Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-500" />
              <span className="text-2xl font-bold">3</span>
            </div>
            <p className="text-xs text-muted-foreground">TripAdvisor, Kayak, Skyscanner</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Affiliates Are Used</CardTitle>
          <CardDescription>
            Each affiliate type connects to specific frontend modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4" /> Where to Stay
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Uses ACCOMMODATION type affiliates (Booking.com, Agoda, Expedia)
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary">BOOKING_COM</Badge>
                <Badge variant="secondary">AGODA</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
              <h4 className="font-medium flex items-center gap-2">
                <Utensils className="h-4 w-4" /> What to Eat
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Uses FOOD_DELIVERY type affiliates for order redirects
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary">FOODPANDA</Badge>
                <Badge variant="secondary">GRABFOOD</Badge>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium flex items-center gap-2">
                <Mountain className="h-4 w-4" /> Things to Do
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Uses TOURS type affiliates for activity bookings
              </p>
              <div className="flex gap-1 mt-2">
                <Badge variant="secondary">VIATOR</Badge>
                <Badge variant="secondary">KLOOK</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate List by Type */}
      <Tabs defaultValue="ALL" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2">
          {affiliateTypes.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className="flex items-center gap-1"
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="ALL">
          <IntegrationList
            category="AFFILIATE"
            title="All Affiliate Programs"
            description="Manage all affiliate partnerships across accommodation, tours, food delivery, and more."
          />
        </TabsContent>

        {affiliateTypes.slice(1).map((type) => (
          <TabsContent key={type.value} value={type.value}>
            <AffiliateTypeList type={type.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Component to filter affiliates by type
function AffiliateTypeList({ type }: { type: string }) {
  return (
    <IntegrationList
      category="AFFILIATE"
      title={`${type.replace("_", " ")} Affiliates`}
      description={`Affiliate programs of type ${type}`}
    />
  );
}

