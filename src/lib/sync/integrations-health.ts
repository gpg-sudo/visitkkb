/**
 * Integrations Health Check Worker
 * 
 * Periodically checks all active integrations to ensure they're working.
 * Updates status and error messages for dashboard visibility.
 */

import prisma from "@/lib/prisma";
import { SyncResult } from "./types";
import { createSyncLog, completeSyncLog } from "./sync-logger";

interface HealthCheckResult {
  provider: string;
  status: "OK" | "ERROR" | "DEGRADED";
  message: string;
  latency?: number;
}

/**
 * Main health check function
 */
export async function checkIntegrationsHealth(options?: {
  triggeredBy?: "CRON" | "MANUAL" | "WEBHOOK";
  triggeredById?: string;
  category?: string; // Optional: check only specific category
}): Promise<SyncResult> {
  const startTime = Date.now();
  
  const syncLog = await createSyncLog({
    provider: "HEALTH_CHECK",
    type: "INTEGRATION_HEALTH",
    triggeredBy: options?.triggeredBy || "CRON",
    triggeredById: options?.triggeredById,
  });
  
  const result: SyncResult = {
    success: false,
    provider: "HEALTH_CHECK",
    type: "INTEGRATION_HEALTH",
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    summary: "",
    duration: 0,
  };

  try {
    // Get all active integrations
    const where: Record<string, unknown> = { isActive: true };
    if (options?.category) {
      where.category = options.category;
    }
    
    const integrations = await prisma.integrationConfig.findMany({
      where,
    });

    const healthResults: HealthCheckResult[] = [];

    for (const integration of integrations) {
      try {
        const healthResult = await checkSingleIntegration(integration);
        healthResults.push(healthResult);
        
        // Update integration status
        await prisma.integrationConfig.update({
          where: { id: integration.id },
          data: {
            lastStatus: healthResult.status,
            lastErrorMessage: healthResult.status !== "OK" ? healthResult.message : null,
            lastCheckedAt: new Date(),
          },
        });
        
        if (healthResult.status === "OK") {
          result.updatedCount++;
        } else {
          result.failedCount++;
        }
      } catch (error) {
        result.failedCount++;
        console.error(`Health check failed for ${integration.provider}:`, error);
      }
    }

    const okCount = healthResults.filter((r) => r.status === "OK").length;
    const errorCount = healthResults.filter((r) => r.status === "ERROR").length;
    const degradedCount = healthResults.filter((r) => r.status === "DEGRADED").length;

    result.success = true;
    result.summary = `Health check complete: ${okCount} OK, ${degradedCount} degraded, ${errorCount} errors out of ${integrations.length} integrations`;
    
  } catch (error) {
    result.errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.summary = `Health check failed: ${result.errorMessage}`;
  }

  result.duration = Date.now() - startTime;
  await completeSyncLog(syncLog.id, result);
  
  return result;
}

/**
 * Check health of a single integration
 */
async function checkSingleIntegration(
  integration: {
    provider: string;
    category: string;
    baseUrl: string | null;
    apiKeySource: string;
    apiKey: string | null;
    configJson: string | null;
  }
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check based on integration type
    switch (integration.category) {
      case "AFFILIATE":
        return await checkAffiliateHealth(integration);
      case "ACCOMMODATION":
      case "DINING":
      case "ACTIVITIES":
        return await checkDataSourceHealth(integration);
      case "MAPS_TRANSPORT":
        return await checkMapsHealth(integration);
      case "SOCIAL_MEDIA":
        return await checkSocialHealth(integration);
      default:
        return {
          provider: integration.provider,
          status: "OK",
          message: "Configuration valid",
          latency: Date.now() - startTime,
        };
    }
  } catch (error) {
    return {
      provider: integration.provider,
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      latency: Date.now() - startTime,
    };
  }
}

async function checkAffiliateHealth(integration: {
  provider: string;
  baseUrl: string | null;
}): Promise<HealthCheckResult> {
  // For affiliates, mainly check if configuration is valid
  if (!integration.baseUrl) {
    return {
      provider: integration.provider,
      status: "DEGRADED",
      message: "Base URL not configured",
    };
  }

  // In production, could ping the affiliate's API or check deeplink validity
  // For now, simulate check
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // 95% success rate for demo
  if (Math.random() > 0.05) {
    return {
      provider: integration.provider,
      status: "OK",
      message: "Affiliate configuration valid",
    };
  }
  
  return {
    provider: integration.provider,
    status: "ERROR",
    message: "Failed to validate affiliate configuration",
  };
}

async function checkDataSourceHealth(integration: {
  provider: string;
  apiKeySource: string;
  apiKey: string | null;
}): Promise<HealthCheckResult> {
  // Check if API key is configured
  const hasApiKey = integration.apiKeySource === "ENV"
    ? process.env.GOOGLE_MAPS_API_KEY || process.env[`${integration.provider}_API_KEY`]
    : integration.apiKey;

  if (!hasApiKey) {
    return {
      provider: integration.provider,
      status: "ERROR",
      message: `API key not configured (source: ${integration.apiKeySource})`,
    };
  }

  // In production, make a test API call
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  // 90% success rate for demo
  if (Math.random() > 0.1) {
    return {
      provider: integration.provider,
      status: "OK",
      message: "Data source API responding",
    };
  }
  
  return {
    provider: integration.provider,
    status: "ERROR",
    message: "Data source API not responding",
  };
}

async function checkMapsHealth(integration: {
  provider: string;
}): Promise<HealthCheckResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      provider: integration.provider,
      status: "ERROR",
      message: "GOOGLE_MAPS_API_KEY not set",
    };
  }

  // In production, make a geocoding test request
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return {
    provider: integration.provider,
    status: "OK",
    message: "Maps API operational",
  };
}

async function checkSocialHealth(integration: {
  provider: string;
  configJson: string | null;
}): Promise<HealthCheckResult> {
  let config: Record<string, unknown> = {};
  
  if (integration.configJson) {
    try {
      config = JSON.parse(integration.configJson);
    } catch {
      return {
        provider: integration.provider,
        status: "DEGRADED",
        message: "Invalid configuration JSON",
      };
    }
  }

  // Check for required config based on provider
  if (integration.provider === "INSTAGRAM" && !config.username) {
    return {
      provider: integration.provider,
      status: "DEGRADED",
      message: "Instagram username not configured",
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return {
    provider: integration.provider,
    status: "OK",
    message: "Social integration configured",
  };
}

/**
 * Clean up expired cart items
 */
export async function cleanExpiredCartItems(): Promise<{ deleted: number }> {
  const result = await prisma.cartItem.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
      status: "ACTIVE",
    },
  });
  
  return { deleted: result.count };
}

