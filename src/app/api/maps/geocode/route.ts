import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LRUCache } from 'lru-cache';

// Cache geocoding results for 24 hours
const cache = new LRUCache<string, object>({
    max: 500,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { q, lat, lng } = body;

        if (!q && (!lat || !lng)) {
            return NextResponse.json(
                { success: false, error: 'Either query (q) or coordinates (lat, lng) required' },
                { status: 400 }
            );
        }

        // Create cache key
        const cacheKey = JSON.stringify({ q, lat, lng });

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
        const provider = mapSettings?.geocodeProvider || 'nominatim';
        const apiKey = mapSettings?.geocodeApiKey;

        let url: string;
        const headers: Record<string, string> = {
            'User-Agent': 'VisitKKB/1.0 (Tourism Platform)',
        };

        if (provider === 'nominatim') {
            if (q) {
                url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
            } else {
                url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
            }
        } else if (provider === 'locationiq') {
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: 'LocationIQ API key not configured' },
                    { status: 500 }
                );
            }
            if (q) {
                url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
            } else {
                url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
            }
        } else if (provider === 'geocode.earth') {
            if (!apiKey) {
                return NextResponse.json(
                    { success: false, error: 'Geocode.earth API key not configured' },
                    { status: 500 }
                );
            }
            if (q) {
                url = `https://api.geocode.earth/v1/search?api_key=${apiKey}&text=${encodeURIComponent(q)}`;
            } else {
                url = `https://api.geocode.earth/v1/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}`;
            }
        } else {
            return NextResponse.json(
                { success: false, error: `Unknown geocode provider: ${provider}` },
                { status: 500 }
            );
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        // Cache the result
        cache.set(cacheKey, data);

        return NextResponse.json({
            success: true,
            data,
            cached: false,
        });
    } catch (error: unknown) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
