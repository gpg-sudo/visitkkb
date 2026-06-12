"use client";

import ContentEditorLayout from "@/components/content/ContentEditorLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function CreateActivityPage() {
    const [description, setDescription] = useState("");

    return (
        <ContentEditorLayout
            title="Create New Activity"
            subtitle="Add a new activity or tour package."
        >
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-lg font-semibold">Activity Name</label>
                        <Input
                            placeholder="Enter activity name"
                            className="text-lg font-medium py-6"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price (RM)</label>
                            <Input type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration</label>
                            <Input placeholder="e.g. 2 hours, Full Day" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Description</label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Detailed itinerary and description..."
                        />
                    </div>
                </CardContent>
            </Card>
        </ContentEditorLayout>
    );
}
