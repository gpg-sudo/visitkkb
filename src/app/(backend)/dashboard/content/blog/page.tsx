"use client";

import { useEffect, useState } from "react";
import DashboardPageTemplate from "@/components/dashboard/DashboardPageTemplate";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Edit, Trash2, Eye, Plus, Archive, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string;
    status: string;
    publishedAt: string | null;
    authorName: string | null;
    viewCount: number;
    readTime: string | null;
    coverImage: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function BlogPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const url = statusFilter !== "all" 
                ? `/api/blog?status=${statusFilter}`
                : "/api/blog";
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setPosts(data);
            } else {
                console.error("Unexpected response format:", data);
                setPosts([]);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

        try {
            setActionLoading(id);
            const response = await fetch(`/api/blog/${id}`, { 
                method: "DELETE" 
            });
            
            if (response.ok) {
                fetchPosts();
            } else {
                const error = await response.json();
                alert(`Failed to delete: ${error.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Failed to delete post. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleArchive = async (id: string) => {
        try {
            setActionLoading(id);
            const response = await fetch(`/api/blog/${id}?archive=true`, { 
                method: "DELETE" 
            });
            
            if (response.ok) {
                fetchPosts();
            } else {
                const error = await response.json();
                alert(`Failed to archive: ${error.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to archive post:", error);
            alert("Failed to archive post. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePublishToggle = async (id: string, currentStatus: string) => {
        try {
            setActionLoading(id);
            const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
            const response = await fetch(`/api/blog/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });
            
            if (response.ok) {
                fetchPosts();
            } else {
                const error = await response.json();
                alert(`Failed to update status: ${error.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Failed to toggle publish status:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Published</Badge>;
            case "DRAFT":
                return <Badge variant="secondary">Draft</Badge>;
            case "ARCHIVED":
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archived</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <DashboardPageTemplate
            title="Blog & Articles"
            description="Manage blog posts and travel articles."
            actionLabel="New Post"
            onAction={() => router.push("/dashboard/content/blog/create")}
        >
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading posts...</p>
                </div>
            ) : !Array.isArray(posts) || posts.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground mb-4">No blog posts found</p>
                        <Button onClick={() => router.push("/dashboard/content/blog/create")}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Post
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <Card key={post.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-lg font-semibold truncate">{post.title}</h3>
                                            {getStatusBadge(post.status)}
                                        </div>

                                        {post.excerpt && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {post.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                            <span className="bg-muted px-2 py-1 rounded">{post.category}</span>
                                            {post.authorName && <span>By {post.authorName}</span>}
                                            {post.publishedAt && (
                                                <span>
                                                    Published: {new Date(post.publishedAt).toLocaleDateString()}
                                                </span>
                                            )}
                                            {post.readTime && <span>{post.readTime}</span>}
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {post.viewCount} views
                                            </span>
                                            <span className="text-muted-foreground/60">
                                                Created: {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                                            disabled={post.status !== "PUBLISHED"}
                                            title={post.status !== "PUBLISHED" ? "Post must be published to view" : "View post"}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handlePublishToggle(post.id, post.status)}
                                            disabled={actionLoading === post.id}
                                            title={post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                                        >
                                            {actionLoading === post.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : post.status === "PUBLISHED" ? (
                                                <XCircle className="h-4 w-4 text-orange-600" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => router.push(`/dashboard/content/blog/${post.id}/edit`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleArchive(post.id)}
                                            disabled={actionLoading === post.id}
                                            title="Archive"
                                        >
                                            {actionLoading === post.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Archive className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(post.id, post.title)}
                                            disabled={actionLoading === post.id}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            {actionLoading === post.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardPageTemplate>
    );
}
