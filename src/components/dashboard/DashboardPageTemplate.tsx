import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, Plus } from "lucide-react";

interface DashboardPageTemplateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    children?: React.ReactNode;
}

export default function DashboardPageTemplate({
    title,
    description,
    actionLabel,
    onAction,
    children,
}: DashboardPageTemplateProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-primary">
                        {title}
                    </h1>
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                </div>
                {actionLabel && (
                    <Button className="w-full sm:w-auto" onClick={onAction}>
                        <Plus className="w-4 h-4 mr-2" />
                        {actionLabel}
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder={`Search ${title.toLowerCase()}...`} className="pl-9" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {children || (
                        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md border-dashed bg-muted/20">
                            <p className="text-muted-foreground mb-2">No {title.toLowerCase()} found.</p>
                            <p className="text-xs text-muted-foreground">Get started by creating a new one.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
