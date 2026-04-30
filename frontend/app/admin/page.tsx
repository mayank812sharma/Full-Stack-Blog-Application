'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { formatDate, generateAvatarUrl } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import {
  Users, FileText, MessageCircle, Tag, TrendingUp,
  Eye, Trash2, ShieldCheck, ShieldOff, Star, StarOff,
  Loader2, Search
} from 'lucide-react';

export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'blogs'>('overview');

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Manage users, content and platform settings</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <ShieldCheck size={13} /> Admin
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-8" style={{ background: 'var(--surface-2)' }}>
          {(['overview', 'users', 'blogs'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text-2)',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
              }}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'blogs' && <BlogsTab />}
      </div>
    </ProtectedRoute>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────────── */
function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats() as any,
  });

  if (isLoading) return <Spinner />;
  const { stats, recentUsers, recentBlogs } = data || {};

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={<Users size={16} />} color="#6366f1" />
        <StatCard label="Total Blogs" value={stats?.totalBlogs} icon={<FileText size={16} />} color="#3b82f6" />
        <StatCard label="Published" value={stats?.publishedBlogs} icon={<TrendingUp size={16} />} color="#22c55e" />
        <StatCard label="Drafts" value={stats?.draftBlogs} icon={<FileText size={16} />} color="#f59e0b" />
        <StatCard label="Comments" value={stats?.totalComments} icon={<MessageCircle size={16} />} color="#ec4899" />
        <StatCard label="Categories" value={stats?.totalCategories} icon={<Tag size={16} />} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Users</h3>
          <div className="space-y-3">
            {recentUsers?.map((u: any) => (
              <div key={u._id} className="flex items-center gap-3">
                <img src={u.avatar || generateAvatarUrl(u.name)} alt={u.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{u.email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: u.role === 'admin' ? '#fee2e2' : 'var(--accent-light)', color: u.role === 'admin' ? '#dc2626' : 'var(--accent)' }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent blogs */}
        <div className="p-5 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text)' }}>Recent Posts</h3>
          <div className="space-y-3">
            {recentBlogs?.map((b: any) => (
              <div key={b._id} className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/blog/${b.slug}`} className="text-sm font-medium hover:text-blue-600 line-clamp-1" style={{ color: 'var(--text)' }}>
                    {b.title}
                  </Link>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>by {b.author?.name} · {b.category?.name}</p>
                </div>
                <div className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>
                  <span className="flex items-center gap-1"><Eye size={11} />{b.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Users Tab ─────────────────────────────────────────────────────────────── */
function UsersTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: () => adminApi.getUsers({ page, limit: 10, search: debouncedSearch || undefined }) as any,
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserActive(id) as any,
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUserRole(id, role) as any,
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setTimeout(() => setDebouncedSearch(e.target.value), 400); }}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u: any, i: number) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || generateAvatarUrl(u.name)} alt={u.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{u.email}</td>
                  <td className="px-5 py-3">
                    <select value={u.role} onChange={(e) => updateRole.mutate({ id: u._id, role: e.target.value })}
                      className="text-xs px-2 py-1 rounded-lg border outline-none capitalize"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#16a34a' : '#dc2626' }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(u.createdAt, 'MMM dd, yyyy')}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive.mutate(u._id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: u.isActive ? '#dc2626' : '#16a34a' }}
                      title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && <div className="mt-5"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>}
    </div>
  );
}

/* ── Blogs Tab ─────────────────────────────────────────────────────────────── */
function BlogsTab() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs', page, statusFilter],
    queryFn: () => adminApi.getBlogs({ page, limit: 10, status: statusFilter || undefined }) as any,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlog(id) as any,
    onSuccess: () => { toast.success('Deleted'); queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const featureMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleFeature(id) as any,
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); },
    onError: (err: any) => toast.error(err.message),
  });

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['', 'published', 'draft', 'archived'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className="px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all"
            style={{
              background: statusFilter === s ? 'var(--accent)' : 'var(--surface)',
              color: statusFilter === s ? '#fff' : 'var(--text-2)',
              borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Author', 'Category', 'Status', 'Views', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.map((b: any, i: number) => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
                  <td className="px-5 py-3 max-w-xs">
                    <Link href={`/blog/${b.slug}`} className="font-medium text-sm hover:text-blue-600 line-clamp-2" style={{ color: 'var(--text)' }}>
                      {b.isFeatured && <Star size={12} className="inline mr-1 text-yellow-500" fill="currentColor" />}
                      {b.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{b.author?.name}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                      {b.category?.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{
                        background: b.status === 'published' ? '#dcfce7' : b.status === 'draft' ? '#fef9c3' : '#f3f4f6',
                        color: b.status === 'published' ? '#16a34a' : b.status === 'draft' ? '#ca8a04' : '#6b7280',
                      }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs flex items-center gap-1 pt-4" style={{ color: 'var(--text-3)' }}>
                    <Eye size={12} />{b.views}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => featureMutation.mutate(b._id)}
                        className="p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                        title={b.isFeatured ? 'Remove feature' : 'Feature'}
                        style={{ color: b.isFeatured ? '#f59e0b' : 'var(--text-3)' }}>
                        {b.isFeatured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                      </button>
                      <button onClick={() => { if (confirm('Delete this blog?')) deleteMutation.mutate(b._id); }}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && <div className="mt-5"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>}
    </div>
  );
}

/* ── Shared ────────────────────────────────────────────────────────────────── */
function StatCard({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-4 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{value ?? '—'}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>;
}
