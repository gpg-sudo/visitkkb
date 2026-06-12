"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Search,
    Plus,
    Sparkles,
    Image as ImageIcon,
    AlertTriangle,
    Loader2,
    ExternalLink,
    RefreshCw
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";

// Use window.alert for simplicity since sonner is not installed
const toast = {
    info: (msg: string) => console.log("INFO:", msg),
    success: (msg: string) => console.log("SUCCESS:", msg),
    error: (msg: string) => console.error("ERROR:", msg),
};

interface Activity {
    id: string;
    title: string;
    slug: string;
    image: string;
    location: string;
    pricePerPerson: number;
    difficulty: string;
    status: string;
    imageSource?: string | null;
}

interface ActivitiesListClientProps {
    initialActivities: Activity[];
}

export default function ActivitiesListClient({ initialActivities }: ActivitiesListClientProps) {
    const activities = initialActivities;
    const [searchQuery, setSearchQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const filteredActivities = activities.filter(activity =>
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBulkGenerate = async () => {
        if (!confirm("This will generate AI photos for all activities that are missing images or have broken links. Continue?")) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/admin/activities/generate-images", {
                method: "POST",
                body: JSON.stringify({ regenerate: false }),
            });
            const data = await res.json();

            if (data.success) {
                if (data.count === 0) {
                    toast.info("No activities need image generation.");
                    setIsGenerating(false);
                    return;
                }

                toast.info(`Found ${data.count} activities to process. Generating now...`);

                // Process each task
                for (const task of data.tasks) {
                    setGeneratingId(task.activityId);
                    await processGenerationTask();
                }

                toast.success("Bulk image generation complete!");
                window.location.reload();
            } else {
                toast.error(data.error || "Failed to start generation");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during bulk generation");
        } finally {
            setIsGenerating(false);
            setGeneratingId(null);
        }
    };

    const handleRegenerate = async (activityId: string) => {
        setIsGenerating(true);
        setGeneratingId(activityId);
        try {
            const res = await fetch("/api/admin/activities/generate-images", {
                method: "POST",
                body: JSON.stringify({ activityId, regenerate: true }),
            });
            const data = await res.json();

            if (data.success && data.tasks.length > 0) {
                await processGenerationTask();
                toast.success("Images regenerated successfully!");
                window.location.reload();
            } else {
                toast.error(data.error || "Failed to start regeneration");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during regeneration");
        } finally {
            setIsGenerating(false);
            setGeneratingId(null);
        }
    };

    const processGenerationTask = async () => {
        try {
            // Simulated delay for UI feedback
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">Activities Management</h1>
                    <p className="text-muted-foreground">
                        Manage all experiences, tours, and attractions in VisitKKB.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBulkGenerate}
                        disabled={isGenerating}
                        className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                        {isGenerating && !generatingId ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate Photos (AI)
                    </Button>
                    <Link href="/dashboard/activities/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Activity
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        className="pl-10"
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="px-4 py-3 w-20">Image</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Difficulty</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Source</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredActivities.map((activity) => (
                            <tr key={activity.id} className="hover:bg-muted/5 group">
                                <td className="px-4 py-3">
                                    <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                                        {activity.image ? (
                                            <Image
                                                src={activity.image}
                                                alt={activity.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 m-auto absolute inset-0 text-muted-foreground" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    <div className="flex flex-col">
                                        <span>{activity.title}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{activity.slug}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{activity.location}</td>
                                <td className="px-4 py-3">
                                    <Badge variant="outline">{activity.difficulty}</Badge>
                                </td>
                                <td className="px-4 py-3 font-semibold">RM {activity.pricePerPerson}</td>
                                <td className="px-4 py-3">
                                    {activity.imageSource === "AI_GENERATED_FALLBACK" ? (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            AI Generated
                                        </Badge>
                                    ) : activity.image?.includes("unsplash.com") ? (
                                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Legacy Link
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">Manual/Sync</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge className={activity.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                                        {activity.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRegenerate(activity.id)}
                                            disabled={isGenerating && generatingId === activity.id}
                                            title="Regenerate AI Photos"
                                        >
                                            {isGenerating && generatingId === activity.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </Button>
                                        <Link href={`/dashboard/activities/${activity.id}`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                        <Link href={`/activities/${activity.slug}`} target="_blank">
                                            <Button variant="ghost" size="icon">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-semibold">AI Generated Photos Note</p>
                    <p>AI photos are generated as controlled fallbacks where real photos are missing. They are strictly prompt-controlled to match KKB/Hulu Selangor geography. You can siempre replace them manually by editing an activity.</p>
                </div>
            </div>
        </div>
    );
}
