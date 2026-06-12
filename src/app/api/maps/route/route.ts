import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LRUCache } from 'lru-cache';

interface RouteData {
    distance: number;
    duration: number;
    geometry: unknown;
    steps?: unknown[];
    instructions?: unknown[];
}

// Cache routing results for 1 hour
const cache = new LRUCache<string, RouteData>({
    max: 200,
    ttl: 1000 * 60 * 60, // 1 hour
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { start, end, mode = 'driving' } = body;

        if (!start || !end || !start.lat || !start.lng || !end.lat || !end.lng) {
            return NextResponse.json(
                { success: false, error: 'Start and end coordinates required (lat, lng)' },
                { status: 400 }
            );
        }

        // Create cache key
        const cacheKey = JSON.stringify({ start, end, mode });

        // Check cache first
        if (cache.has(cacheKey)) {
            return NextResponse.json({
                success: true,
                data: cache.get(cacheKey),
                cached: true,
            });
        }

        // Get map settings to determine provider
        const mapSettings = await prisma.mapSettings.findFirst();
        const provider = mapSettings?.routingProvider || 'osrm';
        const apiKey = mapSettings?.routingApiKey;

        let routeData: RouteData;

        if (provider === 'osrm') {
            // Map mode to OSRM profile
            const profileMap: Record<string, string> = {
                driving: 'car',
                cycling: 'bike',
                walking: 'foot',
            };
            const profile = profileMap[mode] || 'car';

            const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'No route found' },
                    { status: 404 }
                );
            }

            const route = data.routes[0];
            routeData = {
                distance: route.distance, // meters
                duration: route.duration, // seconds
                geometry: route.geometry, // GeoJSON
                steps: route.legs[0]?.steps || [],
            };
        } else if (provider === 'graphhopper') {
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: 'GraphHopper API key not configured' },
                    { status: 500 }
                );
            }

            const url = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lng}&point=${end.lat},${end.lng}&vehicle=${mode === 'driving' ? 'car' : mode}&key=${apiKey}&points_encoded=false`;

            const response = await fetch(url);
            const data = await response.json();

            if (!data.paths || data.paths.length === 0) {
                return NextResponse.json(
                    { success: false, error: 'No route found' },
                    { status: 404 }
                );
            }

            const path = data.paths[0];
            routeData = {
                distance: path.distance, // meters
                duration: path.time / 1000, // convert ms to seconds
                geometry: path.points, // GeoJSON
                instructions: path.instructions || [],
            };
        } else {
            return NextResponse.json(
                { success: false, error: `Unknown routing provider: ${provider}` },
                { status: 500 }
            );
        }

        // Cache the result
        cache.set(cacheKey, routeData);

        return NextResponse.json({
            success: true,
            data: routeData,
            cached: false,
        });
    } catch (error: unknown) {
        console.error('Routing error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
