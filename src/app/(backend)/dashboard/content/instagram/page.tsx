"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Instagram, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface InstagramPost {
    id: string;
    username: string;
    caption: string;
    image: string;
    likes: string;
    postUrl?: string;
    hashtags?: string;
    isVisible: boolean;
    isFeatured: boolean;
    displayOrder: number;
}

export default function InstagramManagementPage() {
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        caption: "",
        image: "",
        likes: "",
        postUrl: "",
        hashtags: "",
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch("/api/instagram/posts");
            if (!response.ok) throw new Error("Failed to fetch posts");
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/instagram/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to create post");

            setFormData({
                username: "",
                caption: "",
                image: "",
                likes: "",
                postUrl: "",
                hashtags: "",
            });
            setShowAddForm(false);
            fetchPosts();
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post");
        }
    };

    const toggleVisibility = async (id: string, currentVisibility: boolean) => {
        try {
            const response = await fetch(`/api/instagram/posts/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVisible: !currentVisibility }),
            });

            if (!response.ok) throw new Error("Failed to update post");
            fetchPosts();
        } catch (error) {
            console.error("Error updating post:", error);
            alert("Failed to update post");
        }
    };

    const deletePost = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const response = await fetch(`/api/instagram/posts/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete post");
            fetchPosts();
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post");
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Instagram className="h-8 w-8" />
                        Instagram Posts
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage Instagram posts displayed on the homepage
                    </p>
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Post
                </Button>
            </div>

            {showAddForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Add New Instagram Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        placeholder="visitkkb"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="likes">Likes</Label>
                                    <Input
                                        id="likes"
                                        value={formData.likes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, likes: e.target.value })
                                        }
                                        placeholder="1.2k"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="image">Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) =>
                                        setFormData({ ...formData, image: e.target.value })
                                    }
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="caption">Caption</Label>
                                <Textarea
                                    id="caption"
                                    value={formData.caption}
                                    onChange={(e) =>
                                        setFormData({ ...formData, caption: e.target.value })
                                    }
                                    placeholder="Amazing views! #visitkkb"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="postUrl">Post URL (optional)</Label>
                                <Input
                                    id="postUrl"
                                    value={formData.postUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, postUrl: e.target.value })
                                    }
                                    placeholder="https://instagram.com/p/..."
                                />
                            </div>

                            <div>
                                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                                <Input
                                    id="hashtags"
                                    value={formData.hashtags}
                                    onChange={(e) =>
                                        setFormData({ ...formData, hashtags: e.target.value })
                                    }
                                    placeholder="visitkkb,nature,adventure"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Create Post</Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Card key={post.id}>
                        <CardContent className="p-4">
                            <div className="relative aspect-[9/16] mb-4">
                                <Image
                                    src={post.image}
                                    alt={post.caption}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">@{post.username}</p>
                                    <span className="text-sm text-muted-foreground">
                                        ❤️ {post.likes}
                                    </span>
                                </div>
                                <p className="text-sm line-clamp-2">{post.caption}</p>
                                {post.hashtags && (
                                    <p className="text-xs text-muted-foreground">
                                        #{post.hashtags.split(",").join(" #")}
                                    </p>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleVisibility(post.id, post.isVisible)}
                                    >
                                        {post.isVisible ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <EyeOff className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deletePost(post.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-12">
                    <Instagram className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                        No Instagram posts yet. Click &quot;Add Post&quot; to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
