"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Image from "next/image";
import { ArrowLeft, Save, Eye, Calendar, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContentEditorLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onSave?: () => void;
    onPublish?: () => void;
}

export default function ContentEditorLayout({
    title,
    subtitle,
    children,
    onSave,
    onPublish,
}: ContentEditorLayoutProps) {
    const router = useRouter();
    const [coverImage, setCoverImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock upload - in real app, upload to server/cloud
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur z-20 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-primary">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-muted-foreground text-sm">{subtitle}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                    </Button>
                    <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                    <Button onClick={onPublish}>
                        Publish
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {children}
                </div>

                {/* Sidebar Panels */}
                <div className="space-y-6">
                    {/* Status & Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Publishing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Status</span>
                                <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                                    Draft
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Schedule Publish</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input type="datetime-local" className="pl-9" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cover Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cover Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {coverImage ? (
                                <div className="relative aspect-video rounded-md overflow-hidden border">
                                    <Image
                                        src={coverImage}
                                        alt="Cover"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => setCoverImage(null)}
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/5 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-muted-foreground">
                                        Upload Cover Image
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">SEO Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meta Title</label>
                                <Input placeholder="SEO Title" />
                                <p className="text-xs text-muted-foreground text-right">0/60</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meta Description</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Brief description for search engines..."
                                />
                                <p className="text-xs text-muted-foreground text-right">0/160</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL Slug</label>
                                <Input placeholder="url-slug" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
