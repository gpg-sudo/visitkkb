"use client";

import ContentEditorLayout from "@/components/content/ContentEditorLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

export default function CreatePOIPage() {
    const [description, setDescription] = useState("");

    return (
        <ContentEditorLayout
            title="Add Point of Interest"
            subtitle="Add a new tourist attraction or landmark."
        >
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-lg font-semibold">POI Name</label>
                        <Input
                            placeholder="Enter POI name"
                            className="text-lg font-medium py-6"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input placeholder="e.g. Nature, Museum, Park" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location / Coordinates</label>
                            <Input placeholder="Google Maps Link or Coords" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                            content={description}
                            onChange={setDescription}
                            placeholder="Describe the attraction..."
                        />
                    </div>
                </CardContent>
            </Card>
        </ContentEditorLayout>
    );
}
