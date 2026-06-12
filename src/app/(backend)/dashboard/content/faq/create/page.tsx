"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateFAQPage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-primary">
                        Add New FAQ
                    </h1>
                    <p className="text-muted-foreground">
                        Create a new question and answer pair.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">FAQ Details</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Input placeholder="e.g. General, Safety, Booking" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Question</label>
                        <Input placeholder="Enter the question" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Answer</label>
                        <textarea
                            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter the answer..."
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button>
                            <Save className="w-4 h-4 mr-2" />
                            Save FAQ
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
