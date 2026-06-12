'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, MapPin, Utensils, BedDouble, CheckCircle, AlertCircle } from 'lucide-react';

export default function SerpApiPage() {
    const [loading, setLoading] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<Record<string, any> | null>(null);
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Search queries
    const [foodQuery, setFoodQuery] = useState('restaurants in Kuala Kubu Bharu');
    const [stayQuery, setStayQuery] = useState('hotels in Kuala Kubu Bharu');
    const [mapQuery, setMapQuery] = useState('tourist attractions in Kuala Kubu Bharu');

    const handleSync = async (type: 'food' | 'stays' | 'map', query: string) => {
        setLoading(type);
        setResults(null);

        try {
            const endpoint = type === 'food'
                ? '/api/admin/serpapi/sync-food'
                : type === 'stays'
                    ? '/api/admin/serpapi/sync-stays'
                    : '/api/admin/serpapi/sync-map';

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer admin-token',
                },
                body: JSON.stringify({ query }),
            });

            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error('Sync failed:', error);
            setResults({ success: false, error: 'Network error occurred' });
        } finally {
            setLoading(null);
        }
    };

    const handleTestConnection = async () => {
        setTestLoading(true);
        setTestResult(null);

        try {
            const res = await fetch('/api/admin/serpapi/sync-food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer admin-token',
                },
                body: JSON.stringify({ query: 'test restaurant Kuala Kubu Bharu' }),
            });

            const data = await res.json();

            if (data.success) {
                setTestResult({
                    success: true,
                    message: `✅ Connection successful! Found ${data.data.totalFetched} results.`
                });
            } else {
                setTestResult({
                    success: false,
                    message: `❌ Connection failed: ${data.error}`
                });
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setTestResult({
                success: false,
                message: `❌ Network error: ${errorMessage}`
            });
        } finally {
            setTestLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SerpAPI Integration</h1>
                <p className="text-muted-foreground mt-2">
                    Sync data from Google Maps via SerpAPI. Requires a valid SERPAPI_KEY in API Keys.
                </p>
            </div>

            {/* Test Connection Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Test API Connection</CardTitle>
                    <CardDescription>
                        Verify that your SerpAPI key is configured correctly before running a full sync.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleTestConnection}
                            disabled={testLoading}
                            variant="outline"
                        >
                            {testLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Test Connection
                        </Button>
                        <Link href="/dashboard/integrations/api-keys">
                            <Button variant="outline">
                                Manage API Keys
                            </Button>
                        </Link>
                    </div>

                    {testResult && (
                        <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="text-sm font-medium">{testResult.message}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {results && (
                <Card className={`border-l-4 ${results.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            {results.success ? (
                                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-red-500 mt-1" />
                            )}
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {results.success ? 'Sync Completed Successfully' : 'Sync Failed'}
                                </h3>
                                <p className="text-muted-foreground mb-2">
                                    {results.message || results.error}
                                </p>

                                {results.data && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                        <div className="bg-slate-100 p-3 rounded-md">
                                            <span className="block text-muted-foreground">Total Fetched</span>
                                            <span className="font-bold text-lg">{results.data.totalFetched}</span>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-md text-green-800">
                                            <span className="block opacity-70">Created</span>
                                            <span className="font-bold text-lg">{results.data.created}</span>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-md text-blue-800">
                                            <span className="block opacity-70">Updated</span>
                                            <span className="font-bold text-lg">{results.data.updated}</span>
                                        </div>
                                        <div className="bg-red-100 p-3 rounded-md text-red-800">
                                            <span className="block opacity-70">Failed</span>
                                            <span className="font-bold text-lg">{results.data.failed}</span>
                                        </div>
                                    </div>
                                )}

                                {results.data?.errors && results.data.errors.length > 0 && (
                                    <div className="mt-4 bg-red-50 p-3 rounded-md text-sm text-red-800">
                                        <p className="font-semibold mb-1">Errors:</p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {results.data.errors.map((err: string, i: number) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="food" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="food">
                        <Utensils className="h-4 w-4 mr-2" />
                        Restaurants
                    </TabsTrigger>
                    <TabsTrigger value="stays">
                        <BedDouble className="h-4 w-4 mr-2" />
                        Stays
                    </TabsTrigger>
                    <TabsTrigger value="map">
                        <MapPin className="h-4 w-4 mr-2" />
                        Map Pins
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="food">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Restaurants</CardTitle>
                            <CardDescription>
                                Fetch restaurant listings from Google Maps via SerpAPI.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Search Query</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={foodQuery}
                                        onChange={(e) => setFoodQuery(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleSync('food', foodQuery)}
                                        disabled={loading === 'food'}
                                    >
                                        {loading === 'food' ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                        )}
                                        Sync Now
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Default: &quot;restaurants in Kuala Kubu Bharu&quot;
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stays">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Stays</CardTitle>
                            <CardDescription>
                                Fetch hotels, homestays, and resorts from Google Maps via SerpAPI.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Search Query</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={stayQuery}
                                        onChange={(e) => setStayQuery(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleSync('stays', stayQuery)}
                                        disabled={loading === 'stays'}
                                    >
                                        {loading === 'stays' ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                        )}
                                        Sync Now
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Default: &quot;hotels in Kuala Kubu Bharu&quot;
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="map">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Map Pins</CardTitle>
                            <CardDescription>
                                Fetch tourist attractions and POIs for the main map.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Search Query</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={mapQuery}
                                        onChange={(e) => setMapQuery(e.target.value)}
                                    />
                                    <Button
                                        onClick={() => handleSync('map', mapQuery)}
                                        disabled={loading === 'map'}
                                    >
                                        {loading === 'map' ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                        )}
                                        Sync Now
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Default: &quot;tourist attractions in Kuala Kubu Bharu&quot;
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
