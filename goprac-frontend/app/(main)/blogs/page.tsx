"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Calendar, Filter, Sparkles, ArrowRight, Eye } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { logActivity } from "@/lib/activityLogger";

// Types
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

interface Domain {
  id: number;
  name: string;
  active: string;
  blog_count?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BlogPage() {
  const router = useRouter();
  
  const pracIsLoggedin = useUserStore((state) => state.pracIsLoggedin);
  const userId = useUserStore((state) => state.userId);

  const [recommendedBlogs, setRecommendedBlogs] = useState<Blog[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        let candidateId = userId;
        
        if (!candidateId && typeof window !== "undefined") {
          const cookieMatch = document.cookie.match(/pracUser=([^;]+)/);
          candidateId = cookieMatch ? cookieMatch[1] : null;
        }

        const isLoggedIn = pracIsLoggedin !== null && pracIsLoggedin !== "";

        const response = await fetch(`${API_URL}/index.php?getBlogPageData`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateId: candidateId,
            includeRecommendations: isLoggedIn,
          }),
          cache: "no-store",
        });

        const data = await response.json();

        if (data.status === 1 && data.data) {
          setDomains(data.data.domains || []);
          setAllBlogs(data.data.allBlogs || []);
          setFilteredBlogs(data.data.allBlogs || []);

          if (isLoggedIn && data.data.recommendedBlogs) {
            setRecommendedBlogs(data.data.recommendedBlogs || []);
          }
        }
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [pracIsLoggedin, userId]);

  const handleDomainFilter = (value: string) => {
    setSelectedDomain(value);
    if (value === "all") {
      setFilteredBlogs(allBlogs);
    } else {
      const filtered = allBlogs.filter(
        (blog) => blog.role_id.toString() === value
      );
      setFilteredBlogs(filtered);
    }
  };

  const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


  // Strip HTML tags and get plain text
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Truncate plain text content
  const truncateContent = (content: string, maxLength: number = 150) => {
    const plainText = stripHtml(content);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  const handleReadMore = (blogId: number) => {
    logActivity("READ_BLOG", `User Clicked on blog ID: ${blogId}`);
    router.push(`/blogs/${blogId}`);
  };

  const isUserLoggedIn = pracIsLoggedin !== null && pracIsLoggedin !== "";

  // Blog Card Component
  const BlogCard = ({ blog, variant = "default" }: { blog: Blog; variant?: "default" | "recommended" }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </CardTitle>
        </div>
        <Badge variant={variant === "recommended" ? "secondary" : "outline"} className="w-fit">
          {blog.domain_name}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed line-clamp-3">
          {truncateContent(blog.content)}
        </CardDescription>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(blog.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatViews(blog.views)}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReadMore(blog.id)}
            className="text-primary hover:text-primary/80 group-hover:gap-2 transition-all cursor-pointer"
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl pb-2 font-bold tracking-tight leading-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
           Blogs
          </h1>
          {/* <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
           Where ideas meet reasoning — mastering the art of thinking in a tech-driven world.
          </p> */}
        </div>

        {isUserLoggedIn && recommendedBlogs.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Recommended For You</h2>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedBlogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} variant="recommended" />
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold">All Blogs</h2>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedDomain} onValueChange={handleDomainFilter}>
                <SelectTrigger className="w-full md:w-[240px]">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id.toString()}>
                      {domain.name} {domain.blog_count && `(${domain.blog_count})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new content
              </p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
