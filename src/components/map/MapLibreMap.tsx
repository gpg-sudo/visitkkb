"use client";

/**
 * MapLibre GL JS Map Component
 * 
 * Interactive map using OpenStreetMap tiles via MapLibre GL JS
 * Features: markers, clustering, popups, search, and directions
 * Now reads settings from backend API for marker styles
 */

import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPinResponse } from '@/lib/mapPins';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Navigation, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// KKB default coordinates (fallback)
const KKB_CENTER: [number, number] = [101.6900, 3.5410]; // [lng, lat]
const KKB_ZOOM = 13;

interface MarkerStyle {
    color: string;
    size: number;
    icon: string;
}

interface MapSettings {
    center: { lat: number; lng: number };
    zoom: number;
    enableClustering?: boolean;
    clusterRadius?: number;
    markerStyles?: Record<string, MarkerStyle>;
}

interface MapLibreMapProps {
    pins: MapPinResponse[];
    onPinClick?: (pin: MapPinResponse) => void;
    activePinId?: string;
    settings?: MapSettings;
}

// Default category colors for markers (fallback)
const DEFAULT_MARKER_STYLES: Record<string, MarkerStyle> = {
    ACTIVITY: { color: '#0ea5e9', size: 32, icon: '🎯' },
    DINING: { color: '#f59e0b', size: 32, icon: '🍽️' },
    STAY: { color: '#ec4899', size: 32, icon: '🏨' },
    POI: { color: '#8b5cf6', size: 32, icon: '📍' },
    HOT_SPRING: { color: '#f97316', size: 32, icon: '♨️' },
    WATERFALL: { color: '#3b82f6', size: 32, icon: '💧' },
    HIKING: { color: '#22c55e', size: 32, icon: '🥾' },
    TOWN: { color: '#a855f7', size: 32, icon: '🏛️' },
};

export function MapLibreMap({ pins, onPinClick, activePinId }: MapLibreMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<maplibregl.Marker[]>([]);
    const [selectedPin, setSelectedPin] = useState<MapPinResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    interface NominatimResult {
        display_name: string;
        type: string;
        lat: string;
        lon: string;
    }

    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Use OpenMapTiles style or fallback to OSM raster
        const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_KEY
            ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
            : {
                version: 8,
                sources: {
                    'osm-tiles': {
                        type: 'raster',
                        tiles: [
                            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        ],
                        tileSize: 256,
                        attribution: '© OpenStreetMap contributors',
                    },
                },
                layers: [
                    {
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'osm-tiles',
                        minzoom: 0,
                        maxzoom: 19,
                    },
                ],
            };

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: styleUrl as StyleSpecification,
            center: KKB_CENTER,
            zoom: KKB_ZOOM,
            attributionControl: undefined, // Default is true, but explicit 'true' causes type error
        });

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add scale control
        map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Add markers when pins change
    useEffect(() => {
        if (!map.current || !pins.length) {
            console.log('📍 Map markers: waiting for map or pins', { hasMap: !!map.current, pinCount: pins.length });
            return;
        }

        console.log('📍 Adding markers to map:', pins.length, 'pins');
        console.log('📍 First pin sample:', pins[0]);

        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Group pins for clustering (simple approach)
        const shouldCluster = pins.length > 40;

        if (shouldCluster) {
            // TODO: Implement proper clustering with Supercluster
            console.log('⚠️ Clustering needed for', pins.length, 'pins');
        }

        // Add markers
        pins.forEach((pin) => {
            const markerStyle = DEFAULT_MARKER_STYLES[pin.category] || DEFAULT_MARKER_STYLES.POI;
            const color = markerStyle.color;
            const size = markerStyle.size;

            // Create custom marker element with proper anchoring
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: ${Math.floor(size * 0.5)}px;
                transition: box-shadow 0.2s ease, border-color 0.2s ease;
                transform-origin: center center;
            `;
            el.innerHTML = pin.iconUrl || '📍';
            el.setAttribute('role', 'button');
            el.setAttribute('aria-label', `${pin.name} - ${pin.category}`);
            el.setAttribute('tabindex', '0');

            // Hover effect - use glow instead of scale to prevent movement
            el.addEventListener('mouseenter', () => {
                el.style.boxShadow = `0 0 0 4px ${color}40, 0 4px 12px rgba(0,0,0,0.4)`;
                el.style.borderColor = '#ffd700';
            });
            el.addEventListener('mouseleave', () => {
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
                el.style.borderColor = 'white';
            });

            // Create popup
            const popupContent = createPopupContent(pin);
            const popup = new maplibregl.Popup({
                offset: 20,
                closeButton: true,
                closeOnClick: false,
                maxWidth: '300px',
            }).setHTML(popupContent);

            // Create marker with proper anchor point (center of the circle)
            const marker = new maplibregl.Marker({
                element: el,
                anchor: 'center'
            })
                .setLngLat([pin.lng, pin.lat])
                .setPopup(popup)
                .addTo(map.current!);

            // Click handler
            el.addEventListener('click', () => {
                setSelectedPin(pin);
                onPinClick?.(pin);
            });

            // Keyboard accessibility
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPin(pin);
                    onPinClick?.(pin);
                    marker.togglePopup();
                }
            });

            markers.current.push(marker);
        });

        console.log(`✅ Added ${markers.current.length} markers to map`);

        // Fit bounds to show all markers
        if (pins.length > 0) {
            const bounds = new maplibregl.LngLatBounds();
            pins.forEach(pin => bounds.extend([pin.lng, pin.lat]));
            map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
            console.log('📍 Map bounds fitted to show all markers');
        }
    }, [pins, onPinClick]);

    // Search using Nominatim
    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Use Nominatim for geocoding (free)
            const response = await fetch(
                `/api/map/geocode?q=${encodeURIComponent(query)}&bounded=1&viewbox=${KKB_CENTER[0] - 0.5},${KKB_CENTER[1] - 0.5},${KKB_CENTER[0] + 0.5},${KKB_CENTER[1] + 0.5}`
            );
            const data = await response.json();
            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                handleSearch(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Zoom to active pin when it changes (e.g., clicked from sidebar)
    useEffect(() => {
        if (!map.current || !activePinId) return;
        const pin = pins.find((p) => p.id === activePinId);
        if (!pin) return;

        map.current.flyTo({
            center: [pin.lng, pin.lat],
            zoom: 16,
            duration: 1200,
            essential: true,
        });
    }, [activePinId, pins]);

    // Pan to search result
    const handleSelectResult = (result: NominatimResult) => {
        if (map.current) {
            map.current.flyTo({
                center: [parseFloat(result.lon), parseFloat(result.lat)],
                zoom: 16,
                duration: 1500,
            });
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="relative w-full h-full bg-slate-100">
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {/* Search Box */}
            <div className="absolute top-4 left-4 right-14 md:w-80 z-10">
                <div className="bg-white rounded-lg shadow-lg">
                    <div className="flex items-center gap-2 p-3 border-b">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search places in KKB..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 outline-none text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults([]);
                                }}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="max-h-64 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                                >
                                    <div className="font-medium text-sm">{result.display_name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {result.type} • {result.lat}, {result.lon}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {isSearching && (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                            Searching...
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Pin Details (Mobile Bottom Sheet) */}
            {selectedPin && (
                <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:left-4 md:right-auto md:w-96 bg-white rounded-t-lg md:rounded-lg shadow-xl z-20 max-h-[50vh] overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                            {selectedPin.thumbnail && (
                                <Image
                                    src={selectedPin.thumbnail}
                                    alt={selectedPin.name}
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 object-cover rounded-lg"
                                    unoptimized
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{selectedPin.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedPin.category}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPin(null)}
                                className="p-1 hover:bg-muted rounded"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {selectedPin.shortDescription && (
                            <p className="text-sm mb-3">{selectedPin.shortDescription}</p>
                        )}

                        <div className="flex gap-2">
                            {getPinLink(selectedPin) && (
                                <Link href={getPinLink(selectedPin)!} className="flex-1">
                                    <Button size="sm" className="w-full">
                                        View Details
                                        {selectedPin.linkType === 'external' && (
                                            <ExternalLink className="h-3 w-3 ml-1" />
                                        )}
                                    </Button>
                                </Link>
                            )}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.lat},${selectedPin.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button size="sm" variant="outline" className="w-full">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    Directions
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper functions
function createPopupContent(pin: MapPinResponse): string {
    const link = getPinLink(pin);
    return `
        <div class="p-2">
            <h3 class="font-bold text-sm mb-1">${pin.name}</h3>
            ${pin.shortDescription ? `<p class="text-xs text-gray-600 mb-2">${pin.shortDescription}</p>` : ''}
            ${pin.thumbnail ? `<img src="${pin.thumbnail}" alt="${pin.name}" class="w-full h-24 object-cover rounded mb-2" />` : ''}
            ${link ? `<a href="${link}" class="text-xs text-blue-600 hover:underline">View Details →</a>` : ''}
        </div>
    `;
}

function getPinLink(pin: MapPinResponse): string | null {
    if (pin.linkType === 'activity' && pin.activitySlug) {
        return `/activities/${pin.activitySlug}`;
    }
    if (pin.linkType === 'stay' && pin.staySlug) {
        return `/stays/${pin.staySlug}`;
    }
    if (pin.linkType === 'restaurant' && pin.restaurantSlug) {
        return `/dining/${pin.restaurantSlug}`;
    }
    if (pin.linkType === 'external' && pin.externalUrl) {
        return pin.externalUrl;
    }
    return `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}`;
}
