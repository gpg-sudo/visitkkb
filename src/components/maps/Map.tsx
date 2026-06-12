'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import '@/styles/leaflet.css';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);

const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

const Polyline = dynamic(
    () => import('react-leaflet').then((mod) => mod.Polyline),
    { ssr: false }
);

interface MapConfig {
    center: { lat: number; lng: number };
    zoom: number;
    tileUrl: string;
    attribution: string;
}

interface MapPin {
    id: string;
    title: string;
    lat: number;
    lng: number;
    description?: string | null;
    category?: string | null;
}

interface RouteGeometry {
    geometry?: {
        coordinates: number[][];
    };
    [key: string]: unknown;
}

interface MapProps {
    pins?: MapPin[] | null;
    routes?: RouteGeometry[];
    height?: string | null;
    onPinClick?: (pin: MapPin) => void;
    onMapClick?: (lat: number, lng: number) => void;
    center?: { lat: number; lng: number };
    zoom?: number;
}

export default function Map({
    pins = [],
    routes = [],
    height = '500px',
    onPinClick,
    center: customCenter,
    zoom: customZoom,
}: MapProps) {
    const safePins = pins || [];
    const safeHeight = height || '500px';
    const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsClient(true), 0);
        return () => clearTimeout(timer);

        // Fetch map configuration
        fetch('/api/maps/config')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setMapConfig(data.data);
                }
            })
            .catch((error) => {
                console.error('Error loading map config:', error);
                // Fallback to default OSM config
                setMapConfig({
                    center: { lat: 3.5410, lng: 101.6900 },
                    zoom: 13,
                    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '© OpenStreetMap contributors',
                });
            });
    }, []);

    if (!isClient || !mapConfig) {
        return (
            <div
                style={{ height: safeHeight, width: '100%' }}
                className="bg-muted rounded-lg flex items-center justify-center"
            >
                <p className="text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    const center = customCenter || mapConfig.center;
    const zoom = customZoom || mapConfig.zoom;

    return (
        <div style={{ height: safeHeight, width: '100%' }} className="rounded-lg overflow-hidden">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution={mapConfig.attribution}
                    url={mapConfig.tileUrl}
                />

                {/* Render pins */}
                {safePins.map((pin) => (
                    <Marker
                        key={pin.id}
                        position={[pin.lat, pin.lng]}
                        eventHandlers={{
                            click: () => onPinClick?.(pin),
                        }}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-sm">{pin.title}</h3>
                                {pin.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {pin.description}
                                    </p>
                                )}
                                {pin.category && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                        {pin.category}
                                    </span>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render routes */}
                {routes.map((route, idx) => {
                    if (route.geometry && route.geometry.coordinates) {
                        const positions = route.geometry.coordinates.map((coord: number[]): [number, number] => [
                            coord[1],
                            coord[0],
                        ]);
                        return (
                            <Polyline
                                key={idx}
                                positions={positions}
                                pathOptions={{ color: '#3b82f6', weight: 4 }}
                            />
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
}
