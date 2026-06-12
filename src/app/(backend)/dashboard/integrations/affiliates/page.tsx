"use client";

import { useState, useEffect } from "react";
import {
  Link2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Settings,
  ExternalLink,
  Search,
  TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface AffiliateProgram {
  id: string;
  code: string;
  name: string;
  type: string;
  affiliateId: string | null;
  baseUrl: string | null;
  deepLinkPattern: string | null;
  active: boolean;
  priority: number;
  lastStatus: string;
  lastErrorMessage: string | null;
  lastCheckedAt: string | null;
  description: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
}

interface Stats {
  total: number;
  active: number;
  withErrors: number;
  byType: Record<string, number>;
}

const TYPE_COLORS: Record<string, string> = {
  ACCOMMODATION: "bg-blue-100 text-blue-700",
  TOURS: "bg-green-100 text-green-700",
  TRANSPORT: "bg-purple-100 text-purple-700",
  GEAR: "bg-amber-100 text-amber-700",
  META_SEARCH: "bg-cyan-100 text-cyan-700",
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  OK: { color: "text-green-600 bg-green-50", icon: <Check className="h-4 w-4" /> },
  ERROR: { color: "text-red-600 bg-red-50", icon: <X className="h-4 w-4" /> },
  DEGRADED: { color: "text-yellow-600 bg-yellow-50", icon: <AlertTriangle className="h-4 w-4" /> },
  UNKNOWN: { color: "text-gray-600 bg-gray-50", icon: <RefreshCw className="h-4 w-4" /> },
};

export default function AffiliatesPage() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<AffiliateProgram | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/affiliates");
      const data = await res.json();
      if (data.success) {
        setPrograms(data.data);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (program: AffiliateProgram) => {
    setIsTesting(program.code);
    try {
      const res = await fetch(`/api/affiliates/${program.code}/test`, {
        method: "POST",
        headers: {
          Authorization: "Bearer admin-token",
        },
      });
      const data = await res.json();

      // Update the program in state with new status
      setPrograms((prev) =>
        prev.map((p) =>
          p.code === program.code
            ? {
                ...p,
                lastStatus: data.data?.status || p.lastStatus,
                lastErrorMessage: data.data?.error || null,
                lastCheckedAt: new Date().toISOString(),
              }
            : p
        )
      );

      if (selectedProgram?.code === program.code) {
        setSelectedProgram((prev) =>
          prev
            ? {
                ...prev,
                lastStatus: data.data?.status || prev.lastStatus,
                lastErrorMessage: data.data?.error || null,
                lastCheckedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Test failed:", error);
    } finally {
      setIsTesting(null);
    }
  };

  const handleSaveProgram = async () => {
    if (!selectedProgram) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/affiliates/${selectedProgram.code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify({
          affiliateId: selectedProgram.affiliateId,
          baseUrl: selectedProgram.baseUrl,
          deepLinkPattern: selectedProgram.deepLinkPattern,
          active: selectedProgram.active,
          priority: selectedProgram.priority,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrograms((prev) =>
          prev.map((p) => (p.code === selectedProgram.code ? selectedProgram : p))
        );
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrograms = programs.filter((p) => {
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Programs</h1>
          <p className="text-muted-foreground mt-1">
            Manage affiliate partnerships and tracking configurations.
          </p>
        </div>
        <Button onClick={fetchPrograms} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.withErrors}</div>
              <p className="text-sm text-muted-foreground">With Errors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {stats.byType.ACCOMMODATION || 0}
              </div>
              <p className="text-sm text-muted-foreground">Accommodation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {stats.byType.TOURS || 0}
              </div>
              <p className="text-sm text-muted-foreground">Tours & Activities</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="ALL">All Types</option>
          <option value="ACCOMMODATION">Accommodation</option>
          <option value="TOURS">Tours & Activities</option>
          <option value="TRANSPORT">Transport</option>
          <option value="GEAR">Gear & Equipment</option>
          <option value="META_SEARCH">Meta Search</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Programs List */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            filteredPrograms.map((program) => {
              const statusConfig = STATUS_CONFIG[program.lastStatus] || STATUS_CONFIG.UNKNOWN;

              return (
                <div
                  key={program.code}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedProgram?.code === program.code ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedProgram(program)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{program.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              TYPE_COLORS[program.type] || "bg-gray-100"
                            }`}
                          >
                            {program.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">{program.code}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {program.lastStatus}
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          program.active ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                  {program.lastErrorMessage && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      {program.lastErrorMessage}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Program Details */}
        <div className="lg:col-span-1">
          {selectedProgram ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedProgram.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProgram(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>{selectedProgram.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Enable this affiliate</p>
                  </div>
                  <button
                    onClick={() =>
                      setSelectedProgram((prev) =>
                        prev ? { ...prev, active: !prev.active } : null
                      )
                    }
                    className={`px-3 py-1 rounded font-medium text-sm ${
                      selectedProgram.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedProgram.active ? "ON" : "OFF"}
                  </button>
                </div>

                {/* Affiliate ID */}
                <div>
                  <Label>Affiliate / Partner ID</Label>
                  <Input
                    value={selectedProgram.affiliateId || ""}
                    onChange={(e) =>
                      setSelectedProgram((prev) =>
                        prev ? { ...prev, affiliateId: e.target.value } : null
                      )
                    }
                    placeholder="Enter your affiliate ID"
                  />
                </div>

                {/* Base URL */}
                <div>
                  <Label>Base URL</Label>
                  <Input
                    value={selectedProgram.baseUrl || ""}
                    onChange={(e) =>
                      setSelectedProgram((prev) =>
                        prev ? { ...prev, baseUrl: e.target.value } : null
                      )
                    }
                    placeholder="https://..."
                  />
                </div>

                {/* Deep Link Pattern */}
                <div>
                  <Label>Deep Link Pattern</Label>
                  <textarea
                    value={selectedProgram.deepLinkPattern || ""}
                    onChange={(e) =>
                      setSelectedProgram((prev) =>
                        prev ? { ...prev, deepLinkPattern: e.target.value } : null
                      )
                    }
                    placeholder="URL pattern with {propertyName}, {affiliateId}, etc."
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm min-h-[80px] font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Placeholders: {"{propertyName}"}, {"{affiliateId}"}, {"{location}"},{" "}
                    {"{checkIn}"}, {"{checkOut}"}
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <Label>Priority (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedProgram.priority}
                    onChange={(e) =>
                      setSelectedProgram((prev) =>
                        prev ? { ...prev, priority: parseInt(e.target.value) || 0 } : null
                      )
                    }
                  />
                </div>

                {/* Status Info */}
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                      className={
                        STATUS_CONFIG[selectedProgram.lastStatus]?.color || "text-gray-600"
                      }
                    >
                      {selectedProgram.lastStatus}
                    </span>
                  </div>
                  {selectedProgram.lastCheckedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Checked</span>
                      <span>
                        {new Date(selectedProgram.lastCheckedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleTestConnection(selectedProgram)}
                    disabled={isTesting === selectedProgram.code}
                  >
                    {isTesting === selectedProgram.code ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                  <Button className="flex-1" onClick={handleSaveProgram} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                {selectedProgram.websiteUrl && (
                  <a
                    href={selectedProgram.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Partner Portal
                  </a>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an affiliate program to configure</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

