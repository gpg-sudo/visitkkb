"use client";

import ContentEditorLayout from "@/components/content/ContentEditorLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function CreateHistoryPage() {
    const [content, setContent] = useState("");

    return (
        <ContentEditorLayout
            title="Add History & Culture Entry"
            subtitle="Document a historical site or cultural element."
        >
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-lg font-semibold">Title</label>
                        <Input
                            placeholder="Name of site or cultural element"
                            className="text-lg font-medium py-6"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Input placeholder="e.g. Landmark, Tradition, Building" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input placeholder="Address or coordinates" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Historical Significance</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Describe the history and significance..."
                        />
                    </div>
                </CardContent>
            </Card>
        </ContentEditorLayout>
    );
}
