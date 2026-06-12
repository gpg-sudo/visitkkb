"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Link2,
  RefreshCw,
  Truck,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AffiliateProgram {
  code: string;
  name: string;
  type: string;
  active: boolean;
  lastStatus: string;
  lastErrorMessage: string | null;
  lastCheckedAt: string | null;
}

interface Stats {
  total: number;
  active: number;
  withErrors: number;
  byType: {
    ACCOMMODATION: number;
    FOOD_DELIVERY: number;
    TOURS: number;
    [key: string]: number;
  };
}

interface SyncStatus {
  sourceType: string;
  lastStatus: string;
  lastSyncAt: string | null;
  lastErrorMessage: string | null;
}

export function AffiliateHealthWidget() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [staySyncStatus, setStaySyncStatus] = useState<SyncStatus | null>(null);
  const [diningSyncStatus, setDiningSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch affiliate programs
      const affiliatesRes = await fetch("/api/affiliates");
      const affiliatesData = await affiliatesRes.json();

      if (affiliatesData.success) {
        setPrograms(affiliatesData.data);
        setStats(affiliatesData.stats);
      }

      // Fetch stay sync status
      try {
        const staySyncRes = await fetch("/api/stays/sync-google");
        const staySyncData = await staySyncRes.json();
        if (staySyncData.success) {
          setStaySyncStatus(staySyncData.data);
        }
      } catch {
        // Sync status may not exist yet
      }

      // Fetch dining sync status
      try {
        const diningSyncRes = await fetch("/api/dining/sync-google");
        const diningSyncData = await diningSyncRes.json();
        if (diningSyncData.success) {
          setDiningSyncStatus(diningSyncData.data);
        }
      } catch {
        // Sync status may not exist yet
      }
    } catch (error) {
      console.error("Failed to fetch affiliate health data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const errorPrograms = programs.filter((p) => p.lastStatus === "ERROR");
  const accommodationPrograms = programs.filter(
    (p) => p.type === "ACCOMMODATION" && p.active
  );
  const foodDeliveryPrograms = programs.filter(
    (p) => p.type === "FOOD_DELIVERY" && p.active
  );
  const foodDeliveryErrors = programs.filter(
    (p) => p.type === "FOOD_DELIVERY" && p.lastStatus === "ERROR"
  );

  const hasWarnings =
    errorPrograms.length > 0 ||
    accommodationPrograms.length === 0 ||
    foodDeliveryPrograms.length === 0 ||
    staySyncStatus?.lastStatus === "FAILED" ||
    diningSyncStatus?.lastStatus === "FAILED";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Affiliate & API Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={hasWarnings ? "border-yellow-300" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          Affiliate & API Health
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold text-green-600">
              {stats?.active || 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Active</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-lg font-bold text-red-600">
              {stats?.withErrors || 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Errors</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-blue-50">
            <div className="text-lg font-bold text-blue-600">
              {stats?.byType?.ACCOMMODATION || 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Stays</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-pink-50">
            <div className="text-lg font-bold text-pink-600">
              {stats?.byType?.FOOD_DELIVERY || 0}
            </div>
            <div className="text-[10px] text-muted-foreground">Food</div>
          </div>
        </div>

        {/* Warnings */}
        {accommodationPrograms.length === 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">No Accommodation Affiliates</p>
              <p className="text-xs">
                Where to Stay won&apos;t have booking links.
              </p>
            </div>
          </div>
        )}

        {foodDeliveryPrograms.length === 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Truck className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">No Food Delivery Affiliates</p>
              <p className="text-xs">
                What to Eat won&apos;t have delivery links.
              </p>
            </div>
          </div>
        )}

        {foodDeliveryErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Food Delivery Issues</p>
              <p className="text-xs">
                {foodDeliveryErrors.map((p) => p.name).join(", ")} have errors
              </p>
            </div>
          </div>
        )}

        {(staySyncStatus?.lastStatus === "FAILED" ||
          diningSyncStatus?.lastStatus === "FAILED") && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Google Sync Failed</p>
                <p className="text-xs">
                  {staySyncStatus?.lastStatus === "FAILED" && "Stays sync failed. "}
                  {diningSyncStatus?.lastStatus === "FAILED" && "Dining sync failed."}
                </p>
              </div>
            </div>
          )}

        {/* Error Programs List */}
        {errorPrograms.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">Programs with Errors:</p>
            {errorPrograms.slice(0, 3).map((program) => (
              <div
                key={program.code}
                className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100"
              >
                <div>
                  <p className="text-sm font-medium">{program.name}</p>
                  <p className="text-xs text-red-600 truncate max-w-[200px]">
                    {program.lastErrorMessage || "Unknown error"}
                  </p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100">
                  {program.type.replace("_", " ")}
                </span>
              </div>
            ))}
            {errorPrograms.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{errorPrograms.length - 3} more with errors
              </p>
            )}
          </div>
        )}

        {/* All Good State */}
        {!hasWarnings && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">
            <Check className="h-4 w-4" />
            <p className="text-sm">All affiliate programs are healthy</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t flex gap-2">
          <Link href="/dashboard/integrations/affiliates" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Building className="h-3 w-3 mr-1" />
              Stays
            </Button>
          </Link>
          <Link href="/dashboard/integrations/affiliates?type=FOOD_DELIVERY" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Truck className="h-3 w-3 mr-1" />
              Food
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
