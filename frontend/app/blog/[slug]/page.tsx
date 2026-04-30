import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

interface Props {
  params: { slug: string };
}

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    const data = await res.json();
    return data.blog;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: 'Blog Not Found' };

  return {
    title: blog.meta?.title || blog.title,
    description: blog.meta?.description || blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      authors: [blog.author?.name],
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  return <BlogDetailClient initialBlog={blog} />;
}
