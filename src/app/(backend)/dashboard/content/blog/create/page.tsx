"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentEditorLayout from "@/components/content/ContentEditorLayout";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { X } from "lucide-react";

const CATEGORIES = [
    "general",
    "travel-tips",
    "local-culture",
    "adventure",
    "food",
    "history",
    "nature",
    "events",
];

export default function CreateBlogPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [saving, setSaving] = useState(false);

    // Form fields
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [category, setCategory] = useState("general");
    const [tags, setTags] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [images] = useState<string[]>([]);

    const handleSave = async (publish: boolean = false) => {
        if (!title.trim() || !content.trim()) {
            alert("Title and content are required");
            return;
        }

        try {
            setSaving(true);
            const finalStatus = publish ? "PUBLISHED" : status;

            const response = await fetch("/api/blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    excerpt: excerpt.trim() || null,
                    content,
                    coverImage: coverImage.trim() || null,
                    category,
                    tags: tags.trim() || null,
                    authorName: authorName.trim() || "Admin",
                    metaTitle: metaTitle.trim() || null,
                    metaDescription: metaDescription.trim() || null,
                    metaKeywords: metaKeywords.trim() || null,
                    status: finalStatus,
                    images: images.length > 0 ? images : null,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                router.push("/dashboard/content/blog");
            } else {
                alert(`Failed to save: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error saving blog post:", error);
            alert("Failed to save blog post. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, convert to base64. In production, upload to server/cloud storage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setCoverImage(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <ContentEditorLayout
            title="Create New Blog Post"
            subtitle="Write and publish a new article."
            onSave={() => handleSave(false)}
            onPublish={() => handleSave(true)}
        >
            <Card>
                <CardContent className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-lg font-semibold">Post Title *</label>
                        <Input
                            placeholder="Enter post title"
                            className="text-lg font-medium py-6"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Excerpt</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Brief summary of the article..."
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                        />
                    </div>

                    {/* Category and Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Author Name</label>
                            <Input
                                placeholder="Author name"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <Input
                            placeholder="Comma-separated tags (e.g., hiking, nature, adventure)"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cover Image URL</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://example.com/image.jpg"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="cover-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("cover-upload")?.click()}
                            >
                                Upload
                            </Button>
                        </div>
                        {coverImage && (
                            <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={coverImage}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6"
                                    onClick={() => setCoverImage("")}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Content *</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Write your amazing article here..."
                        />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* SEO Settings */}
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold">SEO Settings (Optional)</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Meta Title</label>
                            <Input
                                placeholder="SEO title (leave empty to use post title)"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-right">{metaTitle.length}/60</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Meta Description</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                placeholder="Brief description for search engines..."
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-right">{metaDescription.length}/160</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Meta Keywords</label>
                            <Input
                                placeholder="Comma-separated keywords"
                                value={metaKeywords}
                                onChange={(e) => setMetaKeywords(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </ContentEditorLayout>
    );
}
