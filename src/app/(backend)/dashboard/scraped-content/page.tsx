'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    CheckCircle2,
    XCircle,
    Eye,
    MapPin,
    Star,
    DollarSign,
    Loader2,
    Filter,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/Select';

interface ScrapedItem {
    id: string;
    category: string;
    externalId: string;
    externalUrl: string;
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metaJson: Record<string, any> | null;
    status: string;
    createdAt: string;
    source: {
        name: string;
    };
}

export default function ScrapedContentPage() {
    const [items, setItems] = useState<ScrapedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('NEW');
    const [importing, setImporting] = useState<Record<string, boolean>>({});
    const [selectedItem, setSelectedItem] = useState<ScrapedItem | null>(null);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
            if (statusFilter !== 'ALL') params.append('status', statusFilter);
            params.append('limit', '50');

            const response = await fetch(`/api/scraped-items?${params}`);
            const data = await response.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching scraped items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryFilter, statusFilter]);

    const importItem = async (item: ScrapedItem) => {
        setImporting(prev => ({ ...prev, [item.id]: true }));

        try {
            const endpoint = item.category === 'DINING'
                ? '/api/scraped-items/import-dining'
                : '/api/scraped-items/import-stay';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dummy-token', // TODO: Use real auth
                },
                body: JSON.stringify({
                    scrapedItemId: item.id,
                    status: 'DRAFT', // Import as draft first
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(`Imported "${item.title}" successfully!`);
                fetchItems(); // Refresh list
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error importing item:', error);
            alert('Failed to import item');
        } finally {
            setImporting(prev => ({ ...prev, [item.id]: false }));
        }
    };

    const ignoreItem = async (itemId: string) => {
        try {
            const response = await fetch('/api/scraped-items', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer dummy-token',
                },
                body: JSON.stringify({
                    id: itemId,
                    status: 'IGNORED',
                }),
            });

            if (response.ok) {
                fetchItems();
            }
        } catch (error) {
            console.error('Error ignoring item:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            NEW: { variant: 'secondary' as const, label: 'New' },
            REVIEWED: { variant: 'default' as const, label: 'Reviewed' },
            IMPORTED: { variant: 'default' as const, label: 'Imported' },
            IGNORED: { variant: 'outline' as const, label: 'Ignored' },
        };
        const { variant, label } = config[status as keyof typeof config] || config.NEW;
        return <Badge variant={variant}>{label}</Badge>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Scraped Content</h1>
                <p className="text-muted-foreground">
                    Review and import scraped data from external sources
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Categories</SelectItem>
                                    <SelectItem value="DINING">Dining</SelectItem>
                                    <SelectItem value="STAY">Stays</SelectItem>
                                    <SelectItem value="ACTIVITY">Activities</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                                    <SelectItem value="IMPORTED">Imported</SelectItem>
                                    <SelectItem value="IGNORED">Ignored</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Items List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Scraped Items ({items.length})
                    </CardTitle>
                    <CardDescription>
                        Click &quot;View Details&quot; to see full data, then import or ignore each item
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No items found. Try adjusting your filters or run a scraping job.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{item.title}</h3>
                                                {getStatusBadge(item.status)}
                                                <Badge variant="outline">{item.category}</Badge>
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                {item.metaJson?.rating && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        {item.metaJson.rating} ({item.metaJson.userRatingsTotal || 0} reviews)
                                                    </div>
                                                )}
                                                {item.metaJson?.address && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.metaJson.address}
                                                    </div>
                                                )}
                                                {item.metaJson?.priceLevel && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" />
                                                        {'$'.repeat(item.metaJson.priceLevel || 1)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Source: {item.source.name} • {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Details
                                            </Button>

                                            {item.status === 'NEW' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => importItem(item)}
                                                        disabled={importing[item.id]}
                                                    >
                                                        {importing[item.id] ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                                Importing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                Import
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => ignoreItem(item.id)}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Ignore
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{selectedItem.title}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    ✕
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                {selectedItem.source.name} • {selectedItem.category}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* External Link */}
                            <div>
                                <a
                                    href={selectedItem.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View on Google Maps →
                                </a>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h4 className="font-semibold mb-2">Extracted Metadata</h4>
                                <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                                    {JSON.stringify(selectedItem.metaJson, null, 2)}
                                </pre>
                            </div>

                            {/* Actions */}
                            {selectedItem.status === 'NEW' && (
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        className="flex-1"
                                        onClick={() => {
                                            importItem(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                        disabled={importing[selectedItem.id]}
                                    >
                                        {importing[selectedItem.id] ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Importing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Import to {selectedItem.category === 'DINING' ? 'Restaurant' : 'Stay'} Table
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            ignoreItem(selectedItem.id);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Ignore
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
