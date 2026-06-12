"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Utensils,
  Mountain,
  Map,
  Instagram,
  Link2,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface IntegrationConfig {
  id: string;
  category: string;
  provider: string;
  displayName: string;
  type: string;
  isActive: boolean;
  lastStatus: string;
  lastErrorMessage: string | null;
  lastCheckedAt: string | null;
}

interface IntegrationStats {
  total: number;
  active: number;
  withErrors: number;
  byCategory: Record<string, number>;
  activeByCategory: Record<string, number>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  AFFILIATE: <Link2 className="h-4 w-4" />,
  ACCOMMODATION: <Building className="h-4 w-4" />,
  ACTIVITIES: <Mountain className="h-4 w-4" />,
  DINING: <Utensils className="h-4 w-4" />,
  MAPS_TRANSPORT: <Map className="h-4 w-4" />,
  SOCIAL_MEDIA: <Instagram className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  AFFILIATE: "Affiliates",
  ACCOMMODATION: "Accommodation",
  ACTIVITIES: "Activities",
  DINING: "Dining",
  MAPS_TRANSPORT: "Maps",
  SOCIAL_MEDIA: "Social",
};

export default function IntegrationsHealthWidget() {
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [errorIntegrations, setErrorIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/config");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        // Find integrations with errors
        const errors = data.data.filter(
          (i: IntegrationConfig) => i.lastStatus === "ERROR" && i.isActive
        );
        setErrorIntegrations(errors.slice(0, 5)); // Show max 5
      }
    } catch (error) {
      console.error("Failed to fetch integration stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const testAllIntegrations = async () => {
    setTesting(true);
    try {
      await fetch("/api/integrations/config/test-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({}),
      });
      await fetchData();
    } catch (error) {
      console.error("Failed to test integrations:", error);
    } finally {
      setTesting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integrations Health</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Integrations Health</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Failed to load integration data</p>
        </CardContent>
      </Card>
    );
  }

  const hasErrors = stats.withErrors > 0;
  const hasWarnings =
    stats.activeByCategory.ACCOMMODATION === 0 ||
    stats.activeByCategory.MAPS_TRANSPORT === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Integrations Health
              {hasErrors ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : hasWarnings ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </CardTitle>
            <CardDescription>
              {stats.active} of {stats.total} integrations active
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={testAllIntegrations}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Test All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Summary */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div
              key={key}
              className="p-2 rounded-lg bg-muted/50 text-center"
            >
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                {categoryIcons[key]}
                <span className="text-xs">{label}</span>
              </div>
              <div className="text-lg font-bold mt-1">
                {stats.activeByCategory[key] || 0}
                <span className="text-xs text-muted-foreground font-normal">
                  /{stats.byCategory[key] || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Error Status */}
        {hasErrors && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium text-sm">
              <XCircle className="h-4 w-4" />
              {stats.withErrors} integration{stats.withErrors > 1 ? "s" : ""} with errors
            </div>
            <div className="mt-2 space-y-2">
              {errorIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="text-sm p-2 rounded bg-white dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{integration.displayName}</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabels[integration.category]}
                    </Badge>
                  </div>
                  {integration.lastErrorMessage && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                      {integration.lastErrorMessage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Checked: {formatDate(integration.lastCheckedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {!hasErrors && hasWarnings && (
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium text-sm">
              <AlertCircle className="h-4 w-4" />
              Configuration Warnings
            </div>
            <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              {stats.activeByCategory.ACCOMMODATION === 0 && (
                <li>• No accommodation APIs active (stays won&apos;t sync)</li>
              )}
              {stats.activeByCategory.MAPS_TRANSPORT === 0 && (
                <li>• No maps integration active (map features limited)</li>
              )}
              {stats.activeByCategory.AFFILIATE === 0 && (
                <li>• No affiliate programs active (booking links disabled)</li>
              )}
            </ul>
          </div>
        )}

        {/* All Good */}
        {!hasErrors && !hasWarnings && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
              <CheckCircle className="h-4 w-4" />
              All integrations healthy
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              All active integrations are working correctly
            </p>
          </div>
        )}

        {/* Quick Link */}
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <a href="/dashboard/integrations/affiliate-programs">
              Manage Integrations
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

