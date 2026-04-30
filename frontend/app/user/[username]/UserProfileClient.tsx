'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { generateAvatarUrl, formatDate } from '@/lib/utils';
import BlogCard from '@/components/blog/BlogCard';
import { Globe, Github, Twitter, Linkedin, UserPlus, UserMinus, Calendar } from 'lucide-react';

export default function UserProfileClient({ initialUser, initialBlogs }: { initialUser: any; initialBlogs: any[] }) {
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const followMutation = useMutation({
    mutationFn: () => usersApi.follow(initialUser._id) as any,
    onSuccess: (res) => toast.success(res.following ? 'Following!' : 'Unfollowed'),
    onError: (err: any) => toast.error(err.message),
  });

  const isOwnProfile = currentUser?._id === initialUser._id;
  const isFollowing = initialUser.followers?.includes(currentUser?._id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile header */}
      <div className="p-8 rounded-2xl border mb-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <img
            src={initialUser.avatar || generateAvatarUrl(initialUser.name)}
            alt={initialUser.name}
            className="w-24 h-24 rounded-full object-cover border-4"
            style={{ borderColor: 'var(--surface-2)' }}
          />
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {initialUser.name}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>@{initialUser.username}</p>
              </div>
              {isAuthenticated && !isOwnProfile && (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: isFollowing ? 'var(--surface-2)' : 'var(--accent)',
                    color: isFollowing ? 'var(--text-2)' : '#fff',
                    border: isFollowing ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {isFollowing ? <UserMinus size={15} /> : <UserPlus size={15} />}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
              {isOwnProfile && (
                <Link href="/profile" className="px-5 py-2 rounded-xl text-sm font-medium border hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                  Edit Profile
                </Link>
              )}
            </div>

            {initialUser.bio && (
              <p className="mt-3 text-sm max-w-xl" style={{ color: 'var(--text-2)' }}>{initialUser.bio}</p>
            )}

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {initialUser.website && (
                <a href={initialUser.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--accent)' }}>
                  <Globe size={14} /> Website
                </a>
              )}
              {initialUser.social?.github && (
                <a href={`https://github.com/${initialUser.social.github}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: 'var(--text-2)' }}>
                  <Github size={14} /> {initialUser.social.github}
                </a>
              )}
              {initialUser.social?.twitter && (
                <a href={`https://twitter.com/${initialUser.social.twitter}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:underline" style={{ color: '#1da1f2' }}>
                  <Twitter size={14} /> {initialUser.social.twitter}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-5">
              <Stat value={initialBlogs.length} label="Posts" />
              <Stat value={initialUser.followers?.length || 0} label="Followers" />
              <Stat value={initialUser.following?.length || 0} label="Following" />
            </div>

            <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: 'var(--text-3)' }}>
              <Calendar size={12} /> Joined {formatDate(initialUser.createdAt, 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Blogs */}
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
        Posts by {initialUser.name}
      </h2>
      {initialBlogs.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <p className="text-3xl mb-2">✍️</p>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>No published posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</p>
    </div>
  );
}
