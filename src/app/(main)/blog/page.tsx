import { BlogCard } from "@/components/blog/BlogCard";
import prisma from "@/lib/prisma";
import { BlogPost } from "@/lib/data/blogs";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const dbPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  const posts: BlogPost[] = dbPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    author: post.authorName || "VisitKKB Team",
    date: post.publishedAt ? post.publishedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : "",
    image: post.coverImage || "/images/placeholder.jpg",
    category: (post.category === "Nature" || post.category === "History" || post.category === "Food" || post.category === "Guide") ? post.category : "Guide",
    readTime: post.readTime || "5 min read",
  }));

  return (
    <div className="min-h-screen bg-muted/10 pb-20">
      {/* Header */}
      <div className="bg-primary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            KKB Stories
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Guides, histories, and tales from the heart of Kuala Kubu Bharu.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No blog posts yet</p>
            <p className="text-muted-foreground">Check back soon for stories from Kuala Kubu Bharu!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
