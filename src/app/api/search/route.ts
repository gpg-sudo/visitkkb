import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema validation
const searchSchema = z.object({
  type: z.enum(["activities", "stays", "restaurants", "all"]),
  query: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  participants: z.number().optional(),
  tags: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const params = {
      type: searchParams.get("type") || "all",
      query: searchParams.get("query") || undefined,
      location: searchParams.get("location") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      participants: searchParams.get("participants")
        ? Number(searchParams.get("participants"))
        : undefined,
      tags: searchParams.get("tags")
        ? searchParams.get("tags")!.split(",")
        : undefined,
      amenities: searchParams.get("amenities")
        ? searchParams.get("amenities")!.split(",")
        : undefined,
      cuisine: searchParams.get("cuisine") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      offset: searchParams.get("offset")
        ? Number(searchParams.get("offset"))
        : 0,
    };

    const validated = searchSchema.parse(params);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = {};

    // Search Activities
    if (validated.type === "activities" || validated.type === "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activityWhere: any = {
        status: "ACTIVE",
      };

      if (validated.query) {
        activityWhere.OR = [
          { title: { contains: validated.query, mode: "insensitive" } },
          { description: { contains: validated.query, mode: "insensitive" } },
        ];
      }

      if (validated.location) {
        activityWhere.location = {
          contains: validated.location,
          mode: "insensitive",
        };
      }

      if (validated.minPrice || validated.maxPrice) {
        activityWhere.pricePerPerson = {};
        if (validated.minPrice)
          activityWhere.pricePerPerson.gte = validated.minPrice;
        if (validated.maxPrice)
          activityWhere.pricePerPerson.lte = validated.maxPrice;
      }

      if (validated.tags && validated.tags.length > 0) {
        activityWhere.tags = { hasSome: validated.tags };
      }

      if (validated.difficulty) {
        activityWhere.difficulty = validated.difficulty;
      }

      results.activities = await prisma.activity.findMany({
        where: activityWhere,
        include: {
          operator: { select: { name: true, verified: true } },
          _count: { select: { reviews: true, bookings: true } },
        },
        take: validated.limit,
        skip: validated.offset,
      });
    }

    // Search Stays
    if (validated.type === "stays" || validated.type === "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stayWhere: any = {
        status: "PUBLISHED",
      };

      if (validated.query) {
        stayWhere.OR = [
          { title: { contains: validated.query, mode: "insensitive" } },
          { description: { contains: validated.query, mode: "insensitive" } },
        ];
      }

      if (validated.location) {
        stayWhere.location = {
          contains: validated.location,
          mode: "insensitive",
        };
      }

      if (validated.minPrice || validated.maxPrice) {
        stayWhere.pricePerNight = {};
        if (validated.minPrice)
          stayWhere.pricePerNight.gte = validated.minPrice;
        if (validated.maxPrice)
          stayWhere.pricePerNight.lte = validated.maxPrice;
      }

      if (validated.amenities && validated.amenities.length > 0) {
        stayWhere.amenities = { hasSome: validated.amenities };
      }

      if (validated.participants) {
        stayWhere.maxGuests = { gte: validated.participants };
      }

      results.stays = await prisma.stay.findMany({
        where: stayWhere,
        include: {
          operator: { select: { name: true, verified: true } },
          _count: { select: { reviews: true, bookings: true } },
        },
        take: validated.limit,
        skip: validated.offset,
      });
    }

    // Search Restaurants
    if (validated.type === "restaurants" || validated.type === "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const restaurantWhere: any = {
        status: "PUBLISHED",
      };

      if (validated.query) {
        restaurantWhere.OR = [
          { name: { contains: validated.query, mode: "insensitive" } },
          { description: { contains: validated.query, mode: "insensitive" } },
        ];
      }

      if (validated.location) {
        restaurantWhere.location = {
          contains: validated.location,
          mode: "insensitive",
        };
      }

      if (validated.cuisine) {
        restaurantWhere.cuisine = validated.cuisine;
      }

      results.restaurants = await prisma.restaurant.findMany({
        where: restaurantWhere,
        include: {
          operator: { select: { name: true, verified: true } },
          _count: { select: { reviews: true } },
        },
        take: validated.limit,
        skip: validated.offset,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        query: validated.query,
        filters: validated,
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid search parameters",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 },
    );
  }
}
