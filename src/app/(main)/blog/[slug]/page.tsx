import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
        where: {
            slug: slug,
            status: "PUBLISHED",
        },
    });

    if (!post) {
        notFound();
    }

    // Increment view count
    await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
    });

    const formattedDate = post.publishedAt
        ? post.publishedAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full">
                {post.coverImage && (
                    <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute inset-0 flex items-end">
                    <div className="container mx-auto px-4 pb-12">
                        <Link href="/blog">
                            <Button variant="ghost" className="text-white hover:text-white/80 mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Button>
                        </Link>

                        <div className="max-w-4xl">
                            <div className="inline-block bg-primary/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-primary-foreground mb-4">
                                {post.category}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                {post.authorName && (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 h-8 w-8 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium">{post.authorName}</span>
                                    </div>
                                )}

                                {formattedDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formattedDate}</span>
                                    </div>
                                )}

                                {post.readTime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{post.readTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {post.excerpt && (
                        <div className="text-xl text-muted-foreground mb-8 pb-8 border-b italic">
                            {post.excerpt}
                        </div>
                    )}

                    <div 
                        className="prose prose-lg max-w-none 
                            prose-headings:font-serif prose-headings:font-bold 
                            prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pt-4
                            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:pt-2
                            prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
                            prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base
                            prose-ul:mb-6 prose-ul:space-y-2 prose-ul:pl-6
                            prose-ol:mb-6 prose-ol:space-y-2 prose-ol:pl-6
                            prose-li:text-foreground prose-li:mb-2 prose-li:leading-relaxed
                            prose-strong:text-foreground prose-strong:font-bold
                            prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline
                            prose-img:rounded-lg prose-img:shadow-md prose-img:my-8 prose-img:w-full prose-img:h-auto
                            prose-hr:my-8 prose-hr:border-border
                            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
                            prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    {post.tags && (
                        <div className="mt-12 pt-8 border-t">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.split(',').map((tag) => (
                                    <span
                                        key={tag.trim()}
                                        className="bg-muted px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
}
