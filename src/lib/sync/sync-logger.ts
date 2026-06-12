import prisma from "@/lib/prisma";
import { SyncResult } from "./types";

export interface CreateSyncLogParams {
  provider: string;
  type: "STAY" | "DINING" | "ACTIVITY" | "INTEGRATION_HEALTH";
  triggeredBy: "CRON" | "MANUAL" | "WEBHOOK";
  triggeredById?: string;
}

export async function createSyncLog(params: CreateSyncLogParams) {
  return prisma.syncLog.create({
    data: {
      provider: params.provider,
      type: params.type,
      triggeredBy: params.triggeredBy,
      triggeredById: params.triggeredById,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
}

export async function completeSyncLog(
  logId: string,
  result: SyncResult
) {
  const finishedAt = new Date();
  
  return prisma.syncLog.update({
    where: { id: logId },
    data: {
      status: result.success ? "SUCCESS" : "FAILED",
      finishedAt,
      duration: result.duration,
      createdCount: result.createdCount,
      updatedCount: result.updatedCount,
      skippedCount: result.skippedCount,
      failedCount: result.failedCount,
      errorMessage: result.errorMessage,
      errorDetails: result.errorDetails,
      summary: result.summary,
    },
  });
}

export async function logUserAction(params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: "SUCCESS" | "FAILED";
  errorMessage?: string;
}) {
  return prisma.userLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
      newValue: params.newValue ? JSON.stringify(params.newValue) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      status: params.status || "SUCCESS",
      errorMessage: params.errorMessage,
    },
  });
}

