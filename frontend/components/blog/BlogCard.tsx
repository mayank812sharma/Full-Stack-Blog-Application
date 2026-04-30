import Link from 'next/link';
import { Heart, Bookmark, Clock, Eye } from 'lucide-react';
import { formatDate, generateAvatarUrl, truncate } from '@/lib/utils';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: { name: string; username: string; avatar?: string };
  category: { name: string; slug: string; color: string; icon: string };
  tags: string[];
  likes: string[];
  views: number;
  readTime: number;
  createdAt: string;
  isFeatured?: boolean;
}

export default function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
  return (
    <article
      className={`group rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${featured ? 'md:col-span-2 md:flex' : ''}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Cover image */}
      {blog.coverImage && (
        <Link
          href={`/blog/${blog.slug}`}
          className={`block overflow-hidden ${featured ? 'md:w-1/2' : 'h-44'}`}
          style={featured ? { minHeight: '220px' } : {}}
        >
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={!featured ? { height: '176px' } : { height: '100%' }}
          />
        </Link>
      )}

      {/* Content */}
      <div className={`p-5 flex flex-col ${featured ? 'md:w-1/2' : ''}`}>
        {/* Category + badge */}
        <div className="flex items-center gap-2 mb-3">
          <Link
            href={`/search?category=${blog.category._id}`}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
            style={{ background: `${blog.category.color}18`, color: blog.category.color }}
          >
            <span>{blog.category.icon}</span>
            {blog.category.name}
          </Link>
          {blog.isFeatured && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-yellow-700 bg-yellow-100">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/blog/${blog.slug}`} className="block mb-2">
          <h2
            className={`font-bold leading-snug transition-colors group-hover:text-blue-600 ${featured ? 'text-xl' : 'text-base'}`}
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            {blog.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-sm mb-4 flex-1" style={{ color: 'var(--text-2)' }}>
          {truncate(blog.excerpt, featured ? 160 : 100)}
        </p>

        {/* Author + meta */}
        <div className="flex items-center justify-between mt-auto">
          <Link href={`/user/${blog.author.username}`} className="flex items-center gap-2 hover:opacity-80">
            <img
              src={blog.author.avatar || generateAvatarUrl(blog.author.name)}
              alt={blog.author.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{blog.author.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(blog.createdAt, 'MMM dd')}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
              <Clock size={12} />
              {blog.readTime}m
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
              <Heart size={12} />
              {blog.likes?.length || 0}
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
              <Eye size={12} />
              {blog.views}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
