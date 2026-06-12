import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "VisitKKB Backend API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth (POST - login/register)",
      search: "/api/search (GET - search activities/stays/restaurants)",
      bookings: "/api/bookings (GET/POST - manage bookings)",
      reviews: "/api/reviews (GET/POST - manage reviews)",
      analytics: "/api/analytics (GET/POST - track events)",
    },
    timestamp: new Date().toISOString(),
  });
}
