import prisma from "@/lib/prisma";

export type IntegrationHealth = {
  key: string;
  label: string;
  lastSyncedAt: string | null;
  status: "HEALTHY" | "FAILED" | "NEVER" | "UNKNOWN";
  lastErrorMessage: string | null;
};

export async function getIntegrationsHealth(): Promise<IntegrationHealth[]> {
  const providers = [
    { key: "serpapi", label: "SerpAPI", sourceType: "SERPAPI" },
    { key: "bookingCom", label: "Booking.com", sourceType: "BOOKING_COM" },
    { key: "googleMaps", label: "Google Maps / Places", sourceType: "GOOGLE_PLACES" },
    { key: "diningApi", label: "Dining API", sourceType: "GOOGLE_PLACES_DINING" },
  ];

  const statuses = await prisma.dataSyncStatus.findMany({
    where: {
      sourceType: { in: providers.map((p) => p.sourceType) },
    },
  });

  return providers.map((p) => {
    const status = statuses.find((s) => s.sourceType === p.sourceType);
    if (!status) {
      return {
        key: p.key,
        label: p.label,
        lastSyncedAt: null,
        status: "NEVER" as const,
        lastErrorMessage: null,
      };
    }
    let normalized: IntegrationHealth["status"] = "UNKNOWN";
    if (status.lastStatus === "SUCCESS") normalized = "HEALTHY";
    else if (status.lastStatus === "FAILED") normalized = "FAILED";
    else if (status.lastStatus === "NEVER") normalized = "NEVER";
    else normalized = "UNKNOWN";

    return {
      key: p.key,
      label: p.label,
      lastSyncedAt: status.lastSyncAt ? status.lastSyncAt.toISOString() : null,
      status: normalized,
      lastErrorMessage: status.lastErrorMessage || null,
    };
  });
}


