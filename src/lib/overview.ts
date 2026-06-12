import prisma from "@/lib/prisma";
import { getCache, setCache } from "./overview-cache";

export type OverviewSummary = {
  totalBookings: number;
  revenueToday: number;
  revenueMonth: number;
  activeListingsCount: number;
  pendingApprovals: number;
  last24hBookings: number;
  topActivities: { id: string; title: string; bookings: number }[];
  topOperators: { id: string; name: string; bookings: number; revenue: number }[];
  newUsersCount: number;
  avgRating: number;
};

export async function getOverviewSummary(): Promise<OverviewSummary> {
  const cacheKey = "overview:summary:v1";
  const cached = getCache<OverviewSummary>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    totalBookings,
    paymentsTodayAgg,
    paymentsMonthAgg,
    activityCount,
    stayCount,
    restaurantCount,
    pendingActivities,
    pendingStays,
    pendingRestaurants,
    pendingBlog,
    pendingEvents,
    last24hBookings,
    newUsersCount,
    ratingAgg,
    bookingsByActivity,
    operatorsWithBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: startOfToday },
      },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.activity.count({
      where: { status: { in: ["ACTIVE", "PUBLISHED"] } },
    }),
    prisma.stay.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.restaurant.count({
      where: { status: "PUBLISHED" },
    }),
    prisma.activity.count({
      where: { status: "PENDING" },
    }),
    prisma.stay.count({
      where: { status: "DRAFT" },
    }),
    prisma.restaurant.count({
      where: { status: "DRAFT" },
    }),
    prisma.blogPost.count({
      where: { status: "PENDING" },
    }).catch(() => 0),
    prisma.event.count({
      where: { status: "PENDING" },
    }).catch(() => 0),
    prisma.booking.count({
      where: { createdAt: { gte: last24h } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.review.aggregate({
      _avg: { rating: true },
    }),
    prisma.booking.groupBy({
      by: ["activityId"],
      _count: { _all: true },
      where: { activityId: { not: null } },
    }).then(results => results.sort((a, b) => b._count._all - a._count._all).slice(0, 5)),
    prisma.booking.groupBy({
      by: ["activityId"],
      _count: { _all: true },
      where: { activityId: { not: null } },
    }),
  ]);

  const revenueToday = paymentsTodayAgg._sum.amount || 0;
  const revenueMonth = paymentsMonthAgg._sum.amount || 0;
  const activeListingsCount = activityCount + stayCount + restaurantCount;
  const pendingApprovals =
    pendingActivities +
    pendingStays +
    pendingRestaurants +
    pendingBlog +
    pendingEvents;

  const topActivities = await Promise.all(
    bookingsByActivity
      .filter((b) => b.activityId)
      .map(async (b) => {
        const activity = await prisma.activity.findUnique({
          where: { id: b.activityId! },
          select: { id: true, title: true },
        });
        if (!activity) return null;
        return {
          id: activity.id,
          title: activity.title,
          bookings: b._count._all,
        };
      })
  ).then((items) => items.filter((i): i is { id: string; title: string; bookings: number } => !!i));

  // Compute operator performance from bookings tied to activities
  const activityIds = Array.from(
    new Set(operatorsWithBookings.map((b) => b.activityId).filter((id): id is string => !!id))
  );

  const activities = await prisma.activity.findMany({
    where: { 
      id: { in: activityIds }
    },
    select: { id: true, operatorId: true },
  }).then(results => results.filter(a => a.operatorId !== null));
  const operatorIds = Array.from(
    new Set(activities.map((a) => a.operatorId).filter((id): id is string => id !== null && id !== undefined))
  );
  const operators = await prisma.operator.findMany({
    where: { id: { in: operatorIds } },
    select: { id: true, name: true },
  });

  const operatorBookingsMap = new Map<string, { bookings: number; revenue: number }>();
  for (const b of operatorsWithBookings) {
    if (!b.activityId) continue;
    const activity = activities.find((a) => a.id === b.activityId);
    if (!activity?.operatorId) continue;
    const key = activity.operatorId;
    const current = operatorBookingsMap.get(key) || { bookings: 0, revenue: 0 };
    current.bookings += b._count._all;
    // For now, revenue per booking approximated by totalAmount
    current.revenue += 0;
    operatorBookingsMap.set(key, current);
  }

  const topOperators = operators
    .map((op) => {
      const stats = operatorBookingsMap.get(op.id) || { bookings: 0, revenue: 0 };
      return { id: op.id, name: op.name, bookings: stats.bookings, revenue: stats.revenue };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  const summary: OverviewSummary = {
    totalBookings,
    revenueToday,
    revenueMonth,
    activeListingsCount,
    pendingApprovals,
    last24hBookings,
    topActivities,
    topOperators,
    newUsersCount,
    avgRating: ratingAgg._avg.rating || 0,
  };

  setCache(cacheKey, summary, 60); // cache for 60 seconds
  return summary;
}

export type BookingsTrendPoint = {
  date: string;
  bookings: number;
  revenue: number;
};

export async function getBookingsTrend(from: Date, to: Date): Promise<BookingsTrendPoint[]> {
  const key = `overview:bookings-trend:v1:${from.toISOString()}:${to.toISOString()}`;
  const cached = getCache<BookingsTrendPoint[]>(key);
  if (cached) return cached;

  const payments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: from, lte: to },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
    select: { createdAt: true },
  });

  const bucket: Record<string, { bookings: number; revenue: number }> = {};

  for (const b of bookings) {
    const d = b.createdAt.toISOString().slice(0, 10);
    if (!bucket[d]) bucket[d] = { bookings: 0, revenue: 0 };
    bucket[d].bookings += 1;
  }

  for (const p of payments) {
    const d = p.createdAt.toISOString().slice(0, 10);
    if (!bucket[d]) bucket[d] = { bookings: 0, revenue: 0 };
    bucket[d].revenue += p.amount;
  }

  const dates = Object.keys(bucket).sort();
  const result: BookingsTrendPoint[] = dates.map((d) => ({
    date: d,
    bookings: bucket[d].bookings,
    revenue: bucket[d].revenue,
  }));

  setCache(key, result, 300); // cache for 5 minutes
  return result;
}

export type ActivityPopularity = {
  id: string;
  title: string;
  bookings: number;
};

export async function getActivityPopularity(rangeDays: number): Promise<ActivityPopularity[]> {
  const now = new Date();
  const from = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const key = `overview:activity-popularity:v1:${rangeDays}`;
  const cached = getCache<ActivityPopularity[]>(key);
  if (cached) return cached;

  const grouped = await prisma.booking.groupBy({
    by: ["activityId"],
    _count: { _all: true },
    where: {
      activityId: { not: null },
      createdAt: { gte: from, lte: now },
    },
  }).then(results => results.sort((a, b) => b._count._all - a._count._all).slice(0, 10));

  const activityIds = grouped
    .map((g) => g.activityId)
    .filter((id): id is string => !!id);

  const activities = await prisma.activity.findMany({
    where: { id: { in: activityIds } },
    select: { id: true, title: true },
  });

  const result: ActivityPopularity[] = grouped
    .map((g) => {
      if (!g.activityId) return null;
      const a = activities.find((x) => x.id === g.activityId);
      if (!a) return null;
      return { id: a.id, title: a.title, bookings: g._count._all };
    })
    .filter((x): x is ActivityPopularity => !!x);

  setCache(key, result, 300);
  return result;
}


