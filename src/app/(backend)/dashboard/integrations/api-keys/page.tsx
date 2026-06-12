'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Loader2, Plus, Trash2, Key, Save } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/Dialog";

interface ApiKey {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/admin/api-keys', {
                headers: { Authorization: 'Bearer admin-token' },
            });
            const data = await res.json();
            if (data.success) {
                setKeys(data.data);
            }
        } catch (error) {
            console.error('Error fetching keys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveKey = async () => {
        if (!newName || !newValue) {
            alert('Name and Value are required');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer admin-token',
                },
                body: JSON.stringify({
                    name: newName,
                    value: newValue,
                    description: newDescription,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert('API Key saved successfully');
                setIsDialogOpen(false);
                setNewName('');
                setNewValue('');
                setNewDescription('');
                fetchKeys();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error saving key:', error);
            alert('Failed to save API key');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteKey = async (name: string) => {
        if (!confirm(`Are you sure you want to delete the key "${name}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/api-keys/${name}`, {
                method: 'DELETE',
                headers: { Authorization: 'Bearer admin-token' },
            });

            const data = await res.json();
            if (data.success) {
                fetchKeys();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting key:', error);
            alert('Failed to delete API key');
        }
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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Private API Keys</h1>
                    <p className="text-muted-foreground mt-2">
                        Securely manage API keys for integrations. Keys are encrypted at rest.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add API Key</DialogTitle>
                            <DialogDescription>
                                Store a new API key securely. The value will be encrypted.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Key Name (e.g., SERPAPI_KEY)</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                    placeholder="MY_API_KEY"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">API Key Value</Label>
                                <div className="relative">
                                    <Input
                                        id="value"
                                        type="password"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        placeholder="Paste your API key here"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="What is this key used for?"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveKey} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {keys.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Key className="h-8 w-8 mb-2 opacity-50" />
                            <p>No API keys found. Add one to get started.</p>
                        </CardContent>
                    </Card>
                ) : (
                    keys.map((key) => (
                        <Card key={key.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                                        <Key className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{key.name}</h3>
                                        {key.description && (
                                            <p className="text-sm text-muted-foreground">{key.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <span className={`px-2 py-0.5 rounded-full ${key.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {key.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span>Updated: {new Date(key.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteKey(key.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
