// app/blog/[id]/page.tsx
import BlogDetailClient from "../_components/BlogDetailClient";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php?getBlogById`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blogId: params.id }),
    cache: "no-store",
  });

  const data = await res.json();

  if (data.status === 1 && data.data) {
    return {
      title: data.data.title,
      description: data.data.meta || "",
    };
  }

  return {
    title: "Blog Not Found",
    description: "The requested blog post could not be found.",
  };
}

export default function BlogDetailPage({ params }: Props) {
  return <BlogDetailClient blogId={params.id} />;
}
