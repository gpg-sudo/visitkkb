"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import {
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Play,
  TestTube,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import IntegrationEditDrawer from "./IntegrationEditDrawer";

interface IntegrationConfig {
  id: string;
  category: string;
  provider: string;
  displayName: string;
  type: string;
  isActive: boolean;
  apiKeySource: string;
  affiliateId: string | null;
  baseUrl: string | null;
  deepLinkPattern: string | null;
  configJson: string | null;
  lastStatus: string;
  lastErrorMessage: string | null;
  lastCheckedAt: string | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  recordsSynced: number;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  documentationUrl: string | null;
  usedBy: string | null;
  priority: number;
}

interface IntegrationListProps {
  category: string;
  title: string;
  description: string;
  showSyncButton?: boolean;
}

const statusColors: Record<string, string> = {
  OK: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  DEGRADED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  UNKNOWN: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "OK":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "ERROR":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "DEGRADED":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
  }
};

export default function IntegrationList({
  category,
  title,
  description,
  showSyncButton = false,
}: IntegrationListProps) {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchIntegrations = useCallback(async () => {
    try {
      const res = await fetch(`/api/integrations/config?category=${category}`);
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const toggleActive = async (provider: string, isActive: boolean) => {
    try {
      await fetch(`/api/integrations/config/${provider}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({ isActive }),
      });
      setIntegrations((prev) =>
        prev.map((i) => (i.provider === provider ? { ...i, isActive } : i))
      );
    } catch (error) {
      console.error("Failed to toggle integration:", error);
    }
  };

  const testIntegration = async (provider: string) => {
    setTesting(provider);
    try {
      const res = await fetch(`/api/integrations/config/${provider}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
      });
      const data = await res.json();
      if (data.success) {
        setIntegrations((prev) =>
          prev.map((i) =>
            i.provider === provider
              ? {
                ...i,
                lastStatus: data.data.testPassed ? "OK" : "ERROR",
                lastErrorMessage: data.data.testPassed ? null : data.data.message,
                lastCheckedAt: data.data.checkedAt,
              }
              : i
          )
        );
      }
    } catch (error) {
      console.error("Failed to test integration:", error);
    } finally {
      setTesting(null);
    }
  };

  const syncIntegration = async (provider: string, dryRun = false) => {
    setSyncing(provider);
    try {
      const res = await fetch(`/api/integrations/config/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token",
        },
        body: JSON.stringify({ provider, dryRun }),
      });
      const data = await res.json();
      if (data.success && !dryRun) {
        await fetchIntegrations();
      }
      alert(data.data.message);
    } catch (error) {
      console.error("Failed to sync integration:", error);
    } finally {
      setSyncing(null);
    }
  };

  const openEditDrawer = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setDrawerOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  const parseUsedBy = (usedBy: string | null): string[] => {
    if (!usedBy) return [];
    try {
      return JSON.parse(usedBy);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchIntegrations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No integrations found for this category.
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.logoUrl ? (
                      <Image
                        src={integration.logoUrl}
                        alt={integration.displayName}
                        width={32}
                        height={32}
                        className="rounded object-contain bg-white p-1"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                        {integration.provider.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {integration.displayName}
                        <StatusIcon status={integration.lastStatus} />
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={(checked) =>
                          toggleActive(integration.provider, checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status & Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[integration.lastStatus]}>
                        {integration.lastStatus}
                      </Badge>
                      <Badge variant="outline">{integration.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Last checked: {formatDate(integration.lastCheckedAt)}</p>
                      {integration.lastErrorMessage && (
                        <p className="text-red-600 mt-1 text-xs">
                          Error: {integration.lastErrorMessage}
                        </p>
                      )}
                    </div>
                    {parseUsedBy(integration.usedBy).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted-foreground">Used by:</span>
                        {parseUsedBy(integration.usedBy).map((module) => (
                          <Badge key={module} variant="secondary" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Configuration */}
                  <div className="space-y-1 text-sm">
                    {integration.affiliateId && (
                      <p>
                        <span className="text-muted-foreground">Affiliate ID:</span>{" "}
                        {integration.affiliateId}
                      </p>
                    )}
                    {integration.baseUrl && (
                      <p className="truncate">
                        <span className="text-muted-foreground">Base URL:</span>{" "}
                        {integration.baseUrl}
                      </p>
                    )}
                    <p>
                      <span className="text-muted-foreground">API Key:</span>{" "}
                      {integration.apiKeySource === "ENV" ? "From ENV" : "Configured"}
                    </p>
                    {showSyncButton && integration.lastSyncAt && (
                      <p>
                        <span className="text-muted-foreground">Last sync:</span>{" "}
                        {formatDate(integration.lastSyncAt)} ({integration.recordsSynced} records)
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testIntegration(integration.provider)}
                      disabled={testing === integration.provider}
                    >
                      {testing === integration.provider ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-1" />
                      )}
                      Test
                    </Button>
                    {showSyncButton && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncIntegration(integration.provider)}
                        disabled={syncing === integration.provider || !integration.isActive}
                      >
                        {syncing === integration.provider ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Play className="h-4 w-4 mr-1" />
                        )}
                        Sync
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDrawer(integration)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    {integration.websiteUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={integration.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedIntegration && (
        <IntegrationEditDrawer
          integration={selectedIntegration}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSave={() => {
            fetchIntegrations();
            setDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}

