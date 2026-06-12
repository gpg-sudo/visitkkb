'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Loader2, Save, TestTube, Map, Palette, Layers, Settings2 } from 'lucide-react';

interface MarkerStyle {
    color: string;
    size: number;
    icon: string;
}

interface MapConfig {
    provider: string;
    centerLat: number;
    centerLng: number;
    zoom: number;
    tileProvider: string;
    tileUrl: string;
    attribution: string;
    geocodeProvider: string;
    geocodeApiKey: string;
    routingProvider: string;
    routingApiKey: string;
    // New fields
    enableClustering: boolean;
    clusterRadius: number;
    showActivities: boolean;
    showStays: boolean;
    showDining: boolean;
    showPOI: boolean;
    markerStyles: Record<string, MarkerStyle>;
}

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

const CATEGORY_LABELS: Record<string, string> = {
    ACTIVITY: 'Activities',
    DINING: 'Dining',
    STAY: 'Accommodation',
    POI: 'Points of Interest',
    HOT_SPRING: 'Hot Springs',
    WATERFALL: 'Waterfalls',
    HIKING: 'Hiking',
    TOWN: 'Town & History',
};

export default function MapConfigPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [config, setConfig] = useState<MapConfig>({
        provider: 'osm',
        centerLat: 3.5410,
        centerLng: 101.6900,
        zoom: 13,
        tileProvider: 'OSM',
        tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        geocodeProvider: 'nominatim',
        geocodeApiKey: '',
        routingProvider: 'osrm',
        routingApiKey: '',
        enableClustering: true,
        clusterRadius: 50,
        showActivities: true,
        showStays: true,
        showDining: true,
        showPOI: true,
        markerStyles: DEFAULT_MARKER_STYLES,
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/maps/config');
            const data = await res.json();
            if (data.success) {
                setConfig({
                    provider: data.data.provider,
                    centerLat: data.data.center.lat,
                    centerLng: data.data.center.lng,
                    zoom: data.data.zoom,
                    tileProvider: data.data.tileProvider,
                    tileUrl: data.data.tileUrl,
                    attribution: data.data.attribution,
                    geocodeProvider: 'nominatim',
                    geocodeApiKey: '',
                    routingProvider: 'osrm',
                    routingApiKey: '',
                    enableClustering: data.data.enableClustering ?? true,
                    clusterRadius: data.data.clusterRadius ?? 50,
                    showActivities: data.data.layerVisibility?.activities ?? true,
                    showStays: data.data.layerVisibility?.stays ?? true,
                    showDining: data.data.layerVisibility?.dining ?? true,
                    showPOI: data.data.layerVisibility?.poi ?? true,
                    markerStyles: data.data.markerStyles || DEFAULT_MARKER_STYLES,
                });
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/maps/config', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer admin-token', // TODO: Replace with real auth
                },
                body: JSON.stringify(config),
            });

            const data = await res.json();
            if (data.success) {
                alert('Map configuration saved successfully!');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleTestGeocode = async () => {
        setTesting(true);
        try {
            const res = await fetch('/api/maps/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: 'Kuala Kubu Bharu' }),
            });

            const data = await res.json();
            if (data.success) {
                alert(`Geocoding test successful!\n\nFound ${data.data.length || 1} results.\nCached: ${data.cached}`);
            } else {
                alert(`Geocoding test failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error testing geocode:', error);
            alert('Geocoding test failed');
        } finally {
            setTesting(false);
        }
    };

    const handleTestRoute = async () => {
        setTesting(true);
        try {
            const res = await fetch('/api/maps/route', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: { lat: 3.5410, lng: 101.6900 },
                    end: { lat: 3.5500, lng: 101.7000 },
                    mode: 'driving',
                }),
            });

            const data = await res.json();
            if (data.success) {
                const distanceKm = (data.data.distance / 1000).toFixed(2);
                const durationMin = (data.data.duration / 60).toFixed(0);
                alert(`Routing test successful!\n\nDistance: ${distanceKm} km\nDuration: ${durationMin} min\nCached: ${data.cached}`);
            } else {
                alert(`Routing test failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error testing route:', error);
            alert('Routing test failed');
        } finally {
            setTesting(false);
        }
    };

    const updateMarkerStyle = (category: string, field: keyof MarkerStyle, value: string | number) => {
        setConfig(prev => ({
            ...prev,
            markerStyles: {
                ...prev.markerStyles,
                [category]: {
                    ...prev.markerStyles[category],
                    [field]: value,
                },
            },
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Map className="h-8 w-8" />
                    Map Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                    Configure map display, markers, layers, and geocoding services
                </p>
            </div>

            {/* Map Display Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Map Display Settings
                    </CardTitle>
                    <CardDescription>
                        Configure the default map view and tile provider
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="centerLat">Default Center Latitude</Label>
                            <Input
                                id="centerLat"
                                type="number"
                                step="0.0001"
                                value={config.centerLat}
                                onChange={(e) => setConfig({ ...config, centerLat: parseFloat(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">KKB: 3.5410</p>
                        </div>
                        <div>
                            <Label htmlFor="centerLng">Default Center Longitude</Label>
                            <Input
                                id="centerLng"
                                type="number"
                                step="0.0001"
                                value={config.centerLng}
                                onChange={(e) => setConfig({ ...config, centerLng: parseFloat(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">KKB: 101.6900</p>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="zoom">Default Zoom Level (1-18)</Label>
                        <Input
                            id="zoom"
                            type="number"
                            min="1"
                            max="18"
                            value={config.zoom}
                            onChange={(e) => setConfig({ ...config, zoom: parseInt(e.target.value) })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="tileProvider">Tile Provider</Label>
                        <Select
                            value={config.tileProvider}
                            onValueChange={(value) => setConfig({ ...config, tileProvider: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OSM">OpenStreetMap (Free)</SelectItem>
                                <SelectItem value="MapTiler">MapTiler</SelectItem>
                                <SelectItem value="Carto">Carto</SelectItem>
                                <SelectItem value="Stadia">Stadia Maps</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Clustering & Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Clustering & Layers
                    </CardTitle>
                    <CardDescription>
                        Configure marker clustering and layer visibility
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Clustering Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Enable Marker Clustering</Label>
                            <p className="text-sm text-muted-foreground">
                                Group nearby markers together when zoomed out
                            </p>
                        </div>
                        <Switch
                            checked={config.enableClustering}
                            onCheckedChange={(checked) => setConfig({ ...config, enableClustering: checked })}
                        />
                    </div>

                    {config.enableClustering && (
                        <div>
                            <Label htmlFor="clusterRadius">Cluster Radius (pixels)</Label>
                            <Input
                                id="clusterRadius"
                                type="number"
                                min="20"
                                max="200"
                                value={config.clusterRadius}
                                onChange={(e) => setConfig({ ...config, clusterRadius: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Increase to group more markers together (default: 50)
                            </p>
                        </div>
                    )}

                    {/* Layer Visibility */}
                    <div className="border-t pt-4">
                        <Label className="text-base mb-3 block">Layer Visibility</Label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">🎯 Activities</span>
                                <Switch
                                    checked={config.showActivities}
                                    onCheckedChange={(checked) => setConfig({ ...config, showActivities: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">🏨 Stays / Accommodation</span>
                                <Switch
                                    checked={config.showStays}
                                    onCheckedChange={(checked) => setConfig({ ...config, showStays: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">🍽️ Dining / Restaurants</span>
                                <Switch
                                    checked={config.showDining}
                                    onCheckedChange={(checked) => setConfig({ ...config, showDining: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">📍 Points of Interest</span>
                                <Switch
                                    checked={config.showPOI}
                                    onCheckedChange={(checked) => setConfig({ ...config, showPOI: checked })}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Marker Styles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Marker Styles
                    </CardTitle>
                    <CardDescription>
                        Customize marker appearance per category
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(config.markerStyles).map(([category, style]) => (
                            <div key={category} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                        style={{ backgroundColor: style.color }}
                                    >
                                        {style.icon}
                                    </span>
                                    <span className="font-medium">{CATEGORY_LABELS[category] || category}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">Color</Label>
                                        <Input
                                            type="color"
                                            value={style.color}
                                            onChange={(e) => updateMarkerStyle(category, 'color', e.target.value)}
                                            className="h-8 p-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Size (px)</Label>
                                        <Input
                                            type="number"
                                            min="16"
                                            max="64"
                                            value={style.size}
                                            onChange={(e) => updateMarkerStyle(category, 'size', parseInt(e.target.value))}
                                            className="h-8"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Icon</Label>
                                        <Input
                                            type="text"
                                            maxLength={2}
                                            value={style.icon}
                                            onChange={(e) => updateMarkerStyle(category, 'icon', e.target.value)}
                                            className="h-8 text-center"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Geocoding Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Geocoding Configuration</CardTitle>
                    <CardDescription>
                        Configure address search and reverse geocoding
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="geocodeProvider">Geocoding Provider</Label>
                        <Select
                            value={config.geocodeProvider}
                            onValueChange={(value) => setConfig({ ...config, geocodeProvider: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nominatim">Nominatim (Free, rate-limited)</SelectItem>
                                <SelectItem value="locationiq">LocationIQ</SelectItem>
                                <SelectItem value="geocode.earth">Geocode.earth</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {config.geocodeProvider !== 'nominatim' && (
                        <div>
                            <Label htmlFor="geocodeApiKey">API Key</Label>
                            <Input
                                id="geocodeApiKey"
                                type="password"
                                value={config.geocodeApiKey}
                                onChange={(e) => setConfig({ ...config, geocodeApiKey: e.target.value })}
                                placeholder="Enter API key"
                            />
                        </div>
                    )}

                    <Button onClick={handleTestGeocode} disabled={testing} variant="outline">
                        {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                        Test Geocoding
                    </Button>
                </CardContent>
            </Card>

            {/* Routing Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Routing Configuration</CardTitle>
                    <CardDescription>
                        Configure route calculation for driving, cycling, and walking
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="routingProvider">Routing Provider</Label>
                        <Select
                            value={config.routingProvider}
                            onValueChange={(value) => setConfig({ ...config, routingProvider: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="osrm">OSRM (Free)</SelectItem>
                                <SelectItem value="graphhopper">GraphHopper</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {config.routingProvider === 'graphhopper' && (
                        <div>
                            <Label htmlFor="routingApiKey">API Key</Label>
                            <Input
                                id="routingApiKey"
                                type="password"
                                value={config.routingApiKey}
                                onChange={(e) => setConfig({ ...config, routingApiKey: e.target.value })}
                                placeholder="Enter API key"
                            />
                        </div>
                    )}

                    <Button onClick={handleTestRoute} disabled={testing} variant="outline">
                        {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                        Test Routing
                    </Button>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save All Settings
                </Button>
            </div>
        </div>
    );
}
