"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, BookOpen, Eye } from "lucide-react";

interface Blog {
  id: number;
  title: string;
  role_id: number;
  sequence: number;
  content: string;
  views: number;
  created_at: string;
  domain_name?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Props {
  blogId: string;
}

export default function BlogDetailClient({ blogId }: Props) {
  // const params = useParams();
  // const blogId = params.id as string;
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/index.php?getBlogById`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blogId: blogId,
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (data.status === 1 && data.data) {
          setBlog(data.data);
          
          fetch(`${API_URL}/index.php?incrementBlogView`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              blogId: blogId,
            }),
          }).catch(err => console.error("Failed to increment view:", err));
          
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching blog detail:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlogDetail();
    }
  }, [blogId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateReadingTime = (text: string) => {
    const words = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button variant="ghost" onClick={() => router.push("/blogs")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-12 w-3/4 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button variant="ghost" onClick={() => router.push("/blogs")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
          
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Blog not found</h3>
            <p className="text-muted-foreground mb-6">
              The blog you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/blogs")}>Browse All Blogs</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/blogs")}
          className="mb-8 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Button>

        <article>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-6 pb-8">
              <Badge variant="secondary" className="w-fit">
                {blog.domain_name}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                {blog.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(blog.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{calculateReadingTime(blog.content)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(blog.views)} views</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Enhanced HTML rendering with comprehensive styling */}
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </CardContent>
          </Card>
        </article>

        <div className="mt-12 text-center">
          <Button onClick={() => router.push("/blogs")} size="lg" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to All Blogs
          </Button>
        </div>
      </div>
    </div>
  );
}
