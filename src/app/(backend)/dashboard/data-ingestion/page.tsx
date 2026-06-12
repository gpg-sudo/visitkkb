'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Database,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    PlayCircle,
    RefreshCw,
} from 'lucide-react';

interface IngestionJob {
    id: string;
    type: string;
    status: string;
    totalItems: number;
    processedItems: number;
    successCount: number;
    errorCount: number;
    resultSummary: string | null;
    errors: Record<string, unknown> | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
}

export default function DataIngestionPage() {
    const [jobs, setJobs] = useState<IngestionJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState<Record<string, boolean>>({});

    // Fetch jobs on mount and refresh
    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/ingestion/trigger?limit=10');
            const data = await response.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // Auto-refresh every 5 seconds if there are running jobs
        const interval = setInterval(() => {
            const hasRunningJobs = jobs.some(job => job.status === 'RUNNING' || job.status === 'PENDING');
            if (hasRunningJobs) {
                fetchJobs();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [jobs]);

    const triggerScraping = async (type: string) => {
        setScraping(prev => ({ ...prev, [type]: true }));

        try {
            const response = await fetch('/api/ingestion/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dummy-token', // TODO: Use real auth
                },
                body: JSON.stringify({
                    type,
                    triggeredBy: 'admin-dashboard',
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Refresh jobs list
                await fetchJobs();
                alert(`Scraping started! Job ID: ${data.data.id}`);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error triggering scraping:', error);
            alert('Failed to start scraping');
        } finally {
            setScraping(prev => ({ ...prev, [type]: false }));
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            PENDING: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
            RUNNING: { variant: 'default' as const, icon: Loader2, label: 'Running' },
            COMPLETED: { variant: 'default' as const, icon: CheckCircle2, label: 'Completed' },
            FAILED: { variant: 'destructive' as const, icon: XCircle, label: 'Failed' },
        };

        const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.PENDING;

        return (
            <Badge variant={variant} className="flex items-center gap-1 w-fit">
                <Icon className={`w-3 h-3 ${status === 'RUNNING' ? 'animate-spin' : ''}`} />
                {label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getDuration = (startedAt: string | null, completedAt: string | null) => {
        if (!startedAt) return 'N/A';
        const start = new Date(startedAt).getTime();
        const end = completedAt ? new Date(completedAt).getTime() : Date.now();
        const duration = Math.round((end - start) / 1000);
        return `${duration}s`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Data Ingestion</h1>
                <p className="text-muted-foreground">
                    Scrape places from Google Places API and import into your database
                </p>
            </div>

            {/* Trigger Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {/* Dining Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Scrape Dining
                        </CardTitle>
                        <CardDescription>
                            Restaurants, cafes, and bakeries
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => triggerScraping('GOOGLE_PLACES_DINING')}
                            disabled={scraping.GOOGLE_PLACES_DINING}
                            className="w-full"
                        >
                            {scraping.GOOGLE_PLACES_DINING ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start Scraping
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Search radius: 5km around KKB
                        </p>
                    </CardContent>
                </Card>

                {/* Stays Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Scrape Stays
                        </CardTitle>
                        <CardDescription>
                            Hotels, homestays, and lodging
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => triggerScraping('GOOGLE_PLACES_STAYS')}
                            disabled={scraping.GOOGLE_PLACES_STAYS}
                            className="w-full"
                        >
                            {scraping.GOOGLE_PLACES_STAYS ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start Scraping
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Search radius: 10km around KKB
                        </p>
                    </CardContent>
                </Card>

                {/* All Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Scrape All
                        </CardTitle>
                        <CardDescription>
                            Dining + Stays combined
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => triggerScraping('GOOGLE_PLACES_ALL')}
                            disabled={scraping.GOOGLE_PLACES_ALL}
                            className="w-full"
                            variant="default"
                        >
                            {scraping.GOOGLE_PLACES_ALL ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Start Scraping
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Runs both dining and stays
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Jobs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Ingestion Jobs</CardTitle>
                        <CardDescription>
                            View status and results of scraping jobs
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchJobs}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No ingestion jobs yet. Start by clicking one of the buttons above.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="border rounded-lg p-4 space-y-3"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-medium">
                                                {job.type.replace('GOOGLE_PLACES_', '').replace('_', ' ')}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(job.createdAt)}
                                            </div>
                                        </div>
                                        {getStatusBadge(job.status)}
                                    </div>

                                    {/* Stats */}
                                    {job.status !== 'PENDING' ? (
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground text-xs">Total</div>
                                                <div className="font-medium">{job.totalItems}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Success</div>
                                                <div className="font-medium text-green-600">{job.successCount}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Errors</div>
                                                <div className="font-medium text-red-600">{job.errorCount}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground text-xs">Duration</div>
                                                <div className="font-medium">{getDuration(job.startedAt, job.completedAt)}</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Summary */}
                                    {job.resultSummary && (
                                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                            {job.resultSummary}
                                        </div>
                                    )}

                                    {/* Errors */}
                                    {job.errors && job.errorCount > 0 && (
                                        <details className="text-sm">
                                            <summary className="cursor-pointer text-red-600 font-medium">
                                                View {job.errorCount} error(s)
                                            </summary>
                                            <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(job.errors, null, 2)}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">ℹ️ How it Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-900 space-y-2">
                    <p>
                        <strong>1. Scrape:</strong> Data is fetched from Google Places API and stored in the ScrapedItem table with status &quot;NEW&quot;
                    </p>
                    <p>
                        <strong>2. Review:</strong> Go to &quot;Scraped Content&quot; to review and edit the scraped data
                    </p>
                    <p>
                        <strong>3. Import:</strong> Click &quot;Import&quot; to move approved items into the Restaurant or Stay tables
                    </p>
                    <p>
                        <strong>4. Publish:</strong> Set status to &quot;PUBLISHED&quot; to show on the frontend
                    </p>
                    <p className="pt-2 border-t border-blue-200">
                        <strong>Note:</strong> Scraping uses your Google Places API quota. Be mindful of rate limits.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
