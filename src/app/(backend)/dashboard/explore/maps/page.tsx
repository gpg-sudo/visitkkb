"use client";

import { useState, useEffect } from "react";
import { Save, MapPin, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import Link from "next/link";

interface MapSettings {
  id: string;
  provider: string;
  defaultCenterLat: number;
  defaultCenterLng: number;
  defaultZoom: number;
  mapStyleJson: string | null;
  showOnNavbar: boolean;
  hasApiKey?: boolean;
}

export default function MapSettingsPage() {
  const [settings, setSettings] = useState<MapSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/map/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/map/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token", // TODO: Use real auth token
        },
        body: JSON.stringify({
          provider: settings.provider,
          defaultCenterLat: settings.defaultCenterLat,
          defaultCenterLng: settings.defaultCenterLng,
          defaultZoom: settings.defaultZoom,
          mapStyleJson: settings.mapStyleJson,
          showOnNavbar: settings.showOnNavbar,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setSettings(data.data);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Map Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure the Explore KKB map behavior and navbar visibility.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/explore/map-pins">
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Manage Pins
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Google Maps API key status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium">Google Maps API Key</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.hasApiKey
                    ? "API key is configured via environment variable"
                    : "No API key found. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in .env"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  settings?.hasApiKey
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {settings?.hasApiKey ? "Active" : "Missing"}
              </div>
            </div>

            <div>
              <Label htmlFor="provider">Map Provider</Label>
              <select
                id="provider"
                value={settings?.provider || "google"}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, provider: e.target.value } : null))
                }
                className="w-full mt-1.5 px-3 py-2 border rounded-md bg-background"
              >
                <option value="google">Google Maps</option>
                <option value="mapbox" disabled>
                  Mapbox (Coming Soon)
                </option>
                <option value="leaflet" disabled>
                  Leaflet/OpenStreetMap (Coming Soon)
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Navbar Display */}
        <Card>
          <CardHeader>
            <CardTitle>Display Settings</CardTitle>
            <CardDescription>Control map visibility in the navbar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Show Map Button in Navbar</p>
                <p className="text-sm text-muted-foreground">
                  Toggle the map icon visibility in the main navigation
                </p>
              </div>
              <button
                onClick={() =>
                  setSettings((prev) =>
                    prev ? { ...prev, showOnNavbar: !prev.showOnNavbar } : null
                  )
                }
                className={`p-2 rounded-lg transition-colors ${
                  settings?.showOnNavbar
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {settings?.showOnNavbar ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Default Center */}
        <Card>
          <CardHeader>
            <CardTitle>Default Map Center</CardTitle>
            <CardDescription>Set the initial center point when the map opens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={settings?.defaultCenterLat || 3.5728}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, defaultCenterLat: parseFloat(e.target.value) } : null
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={settings?.defaultCenterLng || 101.6411}
                  onChange={(e) =>
                    setSettings((prev) =>
                      prev ? { ...prev, defaultCenterLng: parseFloat(e.target.value) } : null
                    )
                  }
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Default: 3.5728, 101.6411 (Kuala Kubu Bharu town center)
            </p>
          </CardContent>
        </Card>

        {/* Default Zoom */}
        <Card>
          <CardHeader>
            <CardTitle>Default Zoom Level</CardTitle>
            <CardDescription>Set the initial zoom when the map opens (1-20)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="zoom">Zoom Level</Label>
              <Input
                id="zoom"
                type="number"
                min="1"
                max="20"
                value={settings?.defaultZoom || 13}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, defaultZoom: parseInt(e.target.value) } : null
                  )
                }
              />
            </div>
            <div className="flex gap-2">
              {[10, 12, 13, 14, 15].map((zoom) => (
                <button
                  key={zoom}
                  onClick={() => setSettings((prev) => (prev ? { ...prev, defaultZoom: zoom } : null))}
                  className={`px-3 py-1 rounded text-sm ${
                    settings?.defaultZoom === zoom
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {zoom}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 13 for town overview, 15 for detailed view
            </p>
          </CardContent>
        </Card>

        {/* Custom Style JSON */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Custom Map Style (Optional)</CardTitle>
            <CardDescription>
              Paste custom Google Maps style JSON for a branded look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={settings?.mapStyleJson || ""}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, mapStyleJson: e.target.value || null } : null
                )
              }
              placeholder='[{"featureType": "water", "stylers": [{"color": "#46bcec"}]}]'
              className="w-full h-32 px-3 py-2 border rounded-md bg-background font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Generate custom styles at{" "}
              <a
                href="https://mapstyle.withgoogle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapstyle.withgoogle.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
