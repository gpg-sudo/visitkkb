"use client";

import ContentEditorLayout from "@/components/content/ContentEditorLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function CreateEventPage() {
    const [description, setDescription] = useState("");

    return (
        <ContentEditorLayout
            title="Create New Event"
            subtitle="Add a new event to the calendar."
        >
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-lg font-semibold">Event Name</label>
                        <Input
                            placeholder="Enter event name"
                            className="text-lg font-medium py-6"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input type="date" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input type="date" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input placeholder="Event venue or location" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe the event details..."
                        />
                    </div>
                </CardContent>
            </Card>
        </ContentEditorLayout>
    );
}
