'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { blogsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate, generateAvatarUrl } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import {
  PenSquare, Eye, Heart, Trash2, Edit, BookOpen,
  FileText, TrendingUp, Clock, Plus, Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-blogs', page, statusFilter],
    queryFn: () => blogsApi.getMyBlogs({ page, limit: 8, status: statusFilter || undefined }) as any,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id) as any,
    onSuccess: () => {
      toast.success('Blog deleted');
      queryClient.invalidateQueries({ queryKey: ['my-blogs'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;

  const stats = {
    total: pagination?.total || 0,
    published: blogs.filter((b: any) => b.status === 'published').length,
    draft: blogs.filter((b: any) => b.status === 'draft').length,
    totalViews: blogs.reduce((s: number, b: any) => s + (b.views || 0), 0),
    totalLikes: blogs.reduce((s: number, b: any) => s + (b.likes?.length || 0), 0),
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || generateAvatarUrl(user?.name || '')}
              alt={user?.name}
              className="w-14 h-14 rounded-full border-2"
              style={{ borderColor: 'var(--accent)' }}
            />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>Welcome back, {user?.name}</p>
            </div>
          </div>
          <Link
            href="/blog/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            <Plus size={15} /> New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<FileText size={18} />} label="Total Posts" value={pagination?.total || 0} color="#6366f1" />
          <StatCard icon={<TrendingUp size={18} />} label="Published" value={stats.published} color="#22c55e" />
          <StatCard icon={<Eye size={18} />} label="Total Views" value={stats.totalViews.toLocaleString()} color="#3b82f6" />
          <StatCard icon={<Heart size={18} />} label="Total Likes" value={stats.totalLikes} color="#ef4444" />
        </div>

        {/* Quick nav */}
        <div className="flex gap-3 mb-6">
          <Link href="/dashboard/saved"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <BookOpen size={15} /> Saved Blogs
          </Link>
          <Link href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
            <PenSquare size={15} /> Edit Profile
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-semibold mr-2" style={{ color: 'var(--text)' }}>My Posts</h2>
          {['', 'published', 'draft', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all"
              style={{
                background: statusFilter === s ? 'var(--accent)' : 'var(--surface)',
                color: statusFilter === s ? '#fff' : 'var(--text-2)',
                borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {/* Blog table */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
        ) : blogs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left px-5 py-3 font-semibold" style={{ color: 'var(--text-2)' }}>Title</th>
                    <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell" style={{ color: 'var(--text-2)' }}>Category</th>
                    <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--text-2)' }}>Status</th>
                    <th className="text-left px-4 py-3 font-semibold hidden md:table-cell" style={{ color: 'var(--text-2)' }}>Date</th>
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-2)' }}>Stats</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog: any, i: number) => (
                    <tr
                      key={blog._id}
                      className="transition-colors hover:bg-gray-50"
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                        background: 'var(--surface)',
                      }}
                    >
                      <td className="px-5 py-4 max-w-xs">
                        <Link href={`/blog/${blog.slug}`} className="font-medium hover:text-blue-600 line-clamp-2" style={{ color: 'var(--text)' }}>
                          {blog.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${blog.category?.color}18`, color: blog.category?.color }}>
                          {blog.category?.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <StatusBadge status={blog.status} />
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-xs" style={{ color: 'var(--text-3)' }}>
                        {formatDate(blog.createdAt, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
                          <span className="flex items-center gap-1"><Eye size={12} />{blog.views}</span>
                          <span className="flex items-center gap-1"><Heart size={12} />{blog.likes?.length || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/blog/edit/${blog._id}`}
                            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            style={{ color: 'var(--accent)' }}>
                            <Edit size={14} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Delete this blog?')) deleteMutation.mutate(blog._id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {pagination && (
          <div className="mt-6">
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: any; color: string }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    published: { bg: '#dcfce7', text: '#16a34a' },
    draft: { bg: '#fef9c3', text: '#ca8a04' },
    archived: { bg: '#f3f4f6', text: '#6b7280' },
  };
  const c = colors[status] || colors.draft;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: c.bg, color: c.text }}>{status}</span>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <p className="text-4xl mb-3">✍️</p>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>No posts yet</h3>
      <p className="text-sm mb-5" style={{ color: 'var(--text-2)' }}>Start writing your first blog post today</p>
      <Link href="/blog/create" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
        Write your first post
      </Link>
    </div>
  );
}
