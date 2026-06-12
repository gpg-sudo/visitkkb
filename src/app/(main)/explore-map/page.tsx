"use client";

/**
 * Explore KKB Map Page
 * 
 * Split layout with list of pins on the left and interactive map on the right
 * Uses MapLibre GL JS with OpenStreetMap tiles
 */

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MapPinResponse } from '@/lib/mapPins';
import { Loader2, MapPin as MapPinIcon, AlertCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// Lazy load map component to avoid SSR issues
const MapLibreMap = dynamic(
    () => import('@/components/map/MapLibreMap').then(mod => ({ default: mod.MapLibreMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading map...</p>
                </div>
            </div>
        ),
    }
);

export default function ExploreMapPage() {
    const [pins, setPins] = useState<MapPinResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedPin, setSelectedPin] = useState<MapPinResponse | null>(null);

    // Fetch pins
    useEffect(() => {
        fetchPins();
    }, []);

    const fetchPins = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/map/pins');
            const data = await response.json();

            if (data.success) {
                console.log('✅ Fetched pins:', data.data.length, data.data.slice(0, 3));
                setPins(data.data);
            } else {
                throw new Error(data.error || 'Failed to fetch pins');
            }
        } catch (err: unknown) {
            console.error('Error fetching pins:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter pins by category
    const filteredPins = selectedCategory === 'all'
        ? pins
        : pins.filter(pin => pin.category === selectedCategory);

    // Get unique categories
    const categories = Array.from(new Set(pins.map(p => p.category)));

    // Category configuration
    const categoryConfig: Record<string, { label: string; color: string; bgColor: string }> = {
        ACTIVITY: { label: 'Activities', color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
        DINING: { label: 'Dining', color: 'text-amber-600', bgColor: 'bg-amber-100' },
        STAY: { label: 'Accommodation', color: 'text-pink-600', bgColor: 'bg-pink-100' },
        POI: { label: 'Points of Interest', color: 'text-violet-600', bgColor: 'bg-violet-100' },
        HOT_SPRING: { label: 'Hot Springs', color: 'text-orange-600', bgColor: 'bg-orange-100' },
        WATERFALL: { label: 'Waterfalls', color: 'text-blue-600', bgColor: 'bg-blue-100' },
        HIKING: { label: 'Hiking', color: 'text-green-600', bgColor: 'bg-green-100' },
    };

    const getPinLink = (pin: MapPinResponse): string | null => {
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
        return null;
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="bg-white border-b shadow-sm z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
                                <MapPinIcon className="h-6 w-6" />
                                Explore KKB Map
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {isLoading
                                    ? 'Loading...'
                                    : `${filteredPins.length} ${selectedCategory === 'all' ? 'locations' : categoryConfig[selectedCategory]?.label.toLowerCase() || 'locations'} in Kuala Kubu Bharu`}
                            </p>
                        </div>
                    </div>
                    
                    {/* Mobile Category Dropdown */}
                    <div className="md:hidden mt-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="all">All Categories ({pins.length})</option>
                            {categories.map((cat) => {
                                const config = categoryConfig[cat] || { label: cat, color: 'text-gray-600', bgColor: 'bg-gray-100' };
                                return (
                                    <option key={cat} value={cat}>
                                        {config.label} ({pins.filter(p => p.category === cat).length})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content - Split Layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar - Pin List */}
                <div className="w-80 border-r bg-background overflow-y-auto hidden md:block">
                    <div className="p-4 border-b sticky top-0 bg-background z-10">
                        <h2 className="font-serif font-bold text-lg text-primary">Points of Interest</h2>
                        <p className="text-sm text-muted-foreground mb-3">
                            {filteredPins.length} locations
                        </p>

                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                            <option value="all">All Categories ({pins.length})</option>
                            {categories.map((cat) => {
                                const config = categoryConfig[cat] || { label: cat, color: 'text-gray-600', bgColor: 'bg-gray-100' };
                                return (
                                    <option key={cat} value={cat}>
                                        {config.label} ({pins.filter(p => p.category === cat).length})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Pin List */}
                    <div className="divide-y">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mt-2">Loading pins...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <Button onClick={fetchPins} size="sm" className="mt-4">
                                    Retry
                                </Button>
                            </div>
                        ) : filteredPins.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <MapPinIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No pins found</p>
                            </div>
                        ) : (
                            filteredPins.map((pin) => {
                                const config = categoryConfig[pin.category] || { label: pin.category, color: 'text-gray-600', bgColor: 'bg-gray-100' };
                                const link = getPinLink(pin);

                                return (
                                    <div
                                        key={pin.id}
                                        className={cn(
                                            "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                                            selectedPin?.id === pin.id && "bg-muted"
                                        )}
                                        onClick={() => setSelectedPin(pin)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                                    config.bgColor
                                                )}
                                            >
                                                <MapPinIcon className={cn("h-4 w-4", config.color)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate">{pin.name}</h3>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {pin.shortDescription || config.label}
                                                </p>
                                            </div>
                                            {link && (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-muted">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-muted-foreground">Loading map data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center max-w-md mx-auto p-6">
                                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                                <h2 className="text-xl font-bold mb-2">Failed to Load Map</h2>
                                <p className="text-muted-foreground mb-4">{error}</p>
                                <Button onClick={fetchPins}>
                                    Retry
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <MapLibreMap 
                                pins={filteredPins} 
                                onPinClick={(pin) => setSelectedPin(pin)}
                                activePinId={selectedPin?.id}
                            />
                            
                            {/* Selected Pin Detail - Mobile Bottom Sheet */}
                            {selectedPin && (
                                <div className="absolute bottom-0 left-0 right-0 md:left-0 bg-white border-t shadow-lg p-4 z-20 max-h-[40vh] overflow-y-auto">
                                    <div className="flex items-start gap-4">
                                        {selectedPin.thumbnail && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={selectedPin.thumbnail}
                                                alt={selectedPin.name}
                                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{selectedPin.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {categoryConfig[selectedPin.category]?.label || selectedPin.category}
                                            </p>
                                            {selectedPin.shortDescription && (
                                                <p className="text-sm mt-1">{selectedPin.shortDescription}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                📍 {selectedPin.lat.toFixed(6)}, {selectedPin.lng.toFixed(6)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {getPinLink(selectedPin) && (
                                                <Link
                                                    href={getPinLink(selectedPin)!}
                                                    target={selectedPin.linkType === 'external' ? '_blank' : undefined}
                                                >
                                                    <Button size="sm">
                                                        View Details
                                                        {selectedPin.linkType === 'external' && (
                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                        )}
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedPin(null)}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Footer Info */}
            <footer className="bg-white border-t py-2 px-4 text-xs text-muted-foreground text-center">
                <p>
                    Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap contributors</a>
                    {process.env.NEXT_PUBLIC_MAPTILER_KEY && (
                        <> • Tiles © <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer" className="underline">MapTiler</a></>
                    )}
                </p>
            </footer>
        </div>
    );
}
