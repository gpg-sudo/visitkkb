import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Default marker styles per category
const DEFAULT_MARKER_STYLES = {
    ACTIVITY: { color: '#0ea5e9', size: 32, icon: '🎯' },
    DINING: { color: '#f59e0b', size: 32, icon: '🍽️' },
    STAY: { color: '#ec4899', size: 32, icon: '🏨' },
    POI: { color: '#8b5cf6', size: 32, icon: '📍' },
    HOT_SPRING: { color: '#f97316', size: 32, icon: '♨️' },
    WATERFALL: { color: '#3b82f6', size: 32, icon: '💧' },
    HIKING: { color: '#22c55e', size: 32, icon: '🥾' },
    TOWN: { color: '#a855f7', size: 32, icon: '🏛️' },
};

export async function GET() {
    try {
        // Get or create default map settings
        let mapSettings = await prisma.mapSettings.findFirst();

        if (!mapSettings) {
            // Create default settings for KKB
            mapSettings = await prisma.mapSettings.create({
                data: {
                    provider: 'osm',
                    defaultCenterLat: 3.5410,
                    defaultCenterLng: 101.6900,
                    defaultZoom: 13,
                    tileProvider: 'OSM',
                    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© OpenStreetMap contributors',
                    geocodeProvider: 'nominatim',
                    routingProvider: 'osrm',
                    showOnNavbar: true,
                    enableClustering: true,
                    clusterRadius: 50,
                    showActivities: true,
                    showStays: true,
                    showDining: true,
                    showPOI: true,
                    markerStyles: JSON.stringify(DEFAULT_MARKER_STYLES),
                },
            });
        }

        // Parse marker styles
        let markerStyles = DEFAULT_MARKER_STYLES;
        try {
            const parsed = JSON.parse(mapSettings.markerStyles || '{}');
            markerStyles = { ...DEFAULT_MARKER_STYLES, ...parsed };
        } catch {
            // Use defaults if parsing fails
        }

        return NextResponse.json({
            success: true,
            data: {
                provider: mapSettings.provider,
                center: {
                    lat: mapSettings.defaultCenterLat,
                    lng: mapSettings.defaultCenterLng,
                },
                zoom: mapSettings.defaultZoom,
                tileProvider: mapSettings.tileProvider,
                tileUrl: mapSettings.tileUrl,
                attribution: mapSettings.attribution,
                showOnNavbar: mapSettings.showOnNavbar,
                // New fields
                enableClustering: mapSettings.enableClustering,
                clusterRadius: mapSettings.clusterRadius,
                layerVisibility: {
                    activities: mapSettings.showActivities,
                    stays: mapSettings.showStays,
                    dining: mapSettings.showDining,
                    poi: mapSettings.showPOI,
                },
                markerStyles,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching map config:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // TODO: Add admin authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            provider,
            centerLat,
            centerLng,
            zoom,
            tileProvider,
            tileUrl,
            attribution,
            geocodeProvider,
            geocodeApiKey,
            routingProvider,
            routingApiKey,
            // New fields
            enableClustering,
            clusterRadius,
            showActivities,
            showStays,
            showDining,
            showPOI,
            markerStyles,
        } = body;

        let mapSettings = await prisma.mapSettings.findFirst();

        const updateData: Prisma.MapSettingsUpdateInput = {};
        if (provider !== undefined) updateData.provider = provider;
        if (centerLat !== undefined) updateData.defaultCenterLat = centerLat;
        if (centerLng !== undefined) updateData.defaultCenterLng = centerLng;
        if (zoom !== undefined) updateData.defaultZoom = zoom;
        if (tileProvider !== undefined) updateData.tileProvider = tileProvider;
        if (tileUrl !== undefined) updateData.tileUrl = tileUrl;
        if (attribution !== undefined) updateData.attribution = attribution;
        if (geocodeProvider !== undefined) updateData.geocodeProvider = geocodeProvider;
        if (geocodeApiKey !== undefined) updateData.geocodeApiKey = geocodeApiKey;
        if (routingProvider !== undefined) updateData.routingProvider = routingProvider;
        if (routingApiKey !== undefined) updateData.routingApiKey = routingApiKey;
        // New fields
        if (enableClustering !== undefined) updateData.enableClustering = enableClustering;
        if (clusterRadius !== undefined) updateData.clusterRadius = clusterRadius;
        if (showActivities !== undefined) updateData.showActivities = showActivities;
        if (showStays !== undefined) updateData.showStays = showStays;
        if (showDining !== undefined) updateData.showDining = showDining;
        if (showPOI !== undefined) updateData.showPOI = showPOI;
        if (markerStyles !== undefined) {
            updateData.markerStyles = typeof markerStyles === 'string'
                ? markerStyles
                : JSON.stringify(markerStyles);
        }

        if (mapSettings) {
            mapSettings = await prisma.mapSettings.update({
                where: { id: mapSettings.id },
                data: updateData,
            });
        } else {
            mapSettings = await prisma.mapSettings.create({
                data: {
                    provider: provider || 'osm',
                    defaultCenterLat: centerLat || 3.5410,
                    defaultCenterLng: centerLng || 101.6900,
                    defaultZoom: zoom || 13,
                    tileProvider: tileProvider || 'OSM',
                    tileUrl: tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: attribution || '© OpenStreetMap contributors',
                    geocodeProvider: geocodeProvider || 'nominatim',
                    geocodeApiKey,
                    routingProvider: routingProvider || 'osrm',
                    routingApiKey,
                    enableClustering: enableClustering ?? true,
                    clusterRadius: clusterRadius ?? 50,
                    showActivities: showActivities ?? true,
                    showStays: showStays ?? true,
                    showDining: showDining ?? true,
                    showPOI: showPOI ?? true,
                    markerStyles: markerStyles ? JSON.stringify(markerStyles) : JSON.stringify(DEFAULT_MARKER_STYLES),
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: mapSettings,
            message: 'Map configuration saved successfully',
        });
    } catch (error: unknown) {
        console.error('Error updating map config:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

