'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { blogsApi, categoriesApi } from '@/lib/api';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/ui/Pagination';
import { TrendingUp, Zap, PenSquare } from 'lucide-react';

interface HomeClientProps {
  initialFeatured: any[];
  initialBlogs: any[];
  initialPagination: any;
  initialCategories: any[];
}

export default function HomeClient({ initialFeatured, initialBlogs, initialPagination, initialCategories }: HomeClientProps) {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs', page, activeCategory, sort],
    queryFn: () =>
      blogsApi.getAll({ page, limit: 9, category: activeCategory || undefined, sort }) as any,
    placeholderData: { blogs: initialBlogs, pagination: initialPagination },
  });

  const blogs = blogsData?.blogs || initialBlogs;
  const pagination = blogsData?.pagination || initialPagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-14 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5 border"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent-light)' }}>
          <Zap size={12} />
          Ideas worth reading
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Where great ideas<br />
          <span style={{ color: 'var(--accent)' }}>find their voice</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-2)' }}>
          Discover insightful articles on technology, design, programming, and beyond.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/search" className="px-6 py-2.5 rounded-xl font-medium transition-colors border hover:bg-gray-50 text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
            Explore
          </Link>
          <Link href="/auth/register" className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}>
            <PenSquare size={15} />
            Start Writing
          </Link>
        </div>
      </section>

      {/* Featured blogs */}
      {initialFeatured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Featured</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialFeatured.slice(0, 3).map((blog, i) => (
              <BlogCard key={blog._id} blog={blog} featured={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            label="All"
            active={activeCategory === ''}
            onClick={() => { setActiveCategory(''); setPage(1); }}
          />
          {initialCategories.map((cat) => (
            <FilterChip
              key={cat._id}
              label={`${cat.icon} ${cat.name}`}
              active={activeCategory === cat._id}
              onClick={() => { setActiveCategory(cat._id); setPage(1); }}
            />
          ))}
        </div>
        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="text-sm px-3 py-2 rounded-lg border outline-none"
            style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }}
          >
            <option value="-createdAt">Latest</option>
            <option value="-views">Most Viewed</option>
            <option value="-likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Blog grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => <BlogSkeleton key={i} />)}
        </div>
      ) : blogs.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {blogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-2)',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
      }}
    >
      {label}
    </button>
  );
}

function BlogSkeleton() {
  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="skeleton h-40 w-full rounded-xl" />
      <div className="skeleton h-3 w-16 rounded" />
      <div className="skeleton h-5 w-full rounded" />
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">📭</p>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>No blogs yet</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-2)' }}>Be the first to share your story!</p>
      <Link href="/blog/create" className="px-5 py-2 rounded-lg text-sm text-white font-medium" style={{ background: 'var(--accent)' }}>
        Write a Post
      </Link>
    </div>
  );
}
