"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UploadMediaPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-primary">
                        Upload Media
                    </h1>
                    <p className="text-muted-foreground">
                        Add new images or videos to the library.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Upload Files</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-muted/5 transition-colors cursor-pointer">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Drag and drop files here</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Support for JPG, PNG, and MP4 files.
                        </p>
                        <Button variant="outline">Select Files</Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Upload Settings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title (Optional)</label>
                                <Input placeholder="Image title" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Alt Text</label>
                                <Input placeholder="Description for accessibility" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Upload to Library
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
