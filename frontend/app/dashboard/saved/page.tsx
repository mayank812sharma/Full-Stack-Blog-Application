'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { blogsApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/ui/Pagination';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function SavedBlogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['saved-blogs', page],
    queryFn: () => blogsApi.getSaved({ page, limit: 9 }) as any,
  });

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg border hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Saved Posts
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔖</p>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>No saved posts</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>Bookmark posts to read them later</p>
            <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
              Explore Posts
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {blogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
            {pagination && (
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
