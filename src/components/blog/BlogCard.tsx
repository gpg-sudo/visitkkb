import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";
import { BlogPost } from "@/lib/data/blogs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full group border-none shadow-md hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-foreground shadow-sm">
            {post.category}
          </div>
        </div>
      </Link>
      <CardHeader className="pb-2 pt-4 px-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{post.readTime}</span>
          </div>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <CardTitle className="text-xl font-serif font-bold leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-6">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="bg-muted h-6 w-6 rounded-full flex items-center justify-center">
            <User className="h-3 w-3" />
          </div>
          {post.author}
        </div>
        <Link href={`/blog/${post.slug}`}>
          <Button
            variant="link"
            className="p-0 h-auto text-primary font-medium hover:no-underline group/btn"
          >
            Read More{" "}
            <span className="ml-1 transition-transform group-hover/btn:translate-x-1">
              →
            </span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
