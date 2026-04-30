'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { blogsApi, commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatDate, timeAgo, generateAvatarUrl } from '@/lib/utils';
import { Heart, Bookmark, Clock, Eye, Share2, MessageCircle, Edit, Trash2, Send } from 'lucide-react';

export default function BlogDetailClient({ initialBlog }: { initialBlog: any }) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const [liked, setLiked] = useState(initialBlog.isLiked);
  const [likeCount, setLikeCount] = useState(initialBlog.likes?.length || 0);
  const [saved, setSaved] = useState(initialBlog.isSaved);

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', initialBlog._id],
    queryFn: () => commentsApi.getAll(initialBlog._id, { limit: 20 }) as any,
  });

  const likeMutation = useMutation({
    mutationFn: () => blogsApi.like(initialBlog._id) as any,
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => blogsApi.save(initialBlog._id) as any,
    onSuccess: (data) => {
      setSaved(data.saved);
      toast.success(data.saved ? 'Saved!' : 'Removed from saved');
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(initialBlog._id, { content }) as any,
    onSuccess: () => {
      setComment('');
      toast.success('Comment added!');
      queryClient.invalidateQueries({ queryKey: ['comments', initialBlog._id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id: string) => commentsApi.delete(id) as any,
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', initialBlog._id] });
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  const comments = commentsData?.comments || [];
  const blog = initialBlog;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Category */}
      <div className="mb-5">
        <Link
          href={`/search?category=${blog.category._id}`}
          className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full"
          style={{ background: `${blog.category.color}18`, color: blog.category.color }}
        >
          {blog.category.icon} {blog.category.name}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        {blog.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href={`/user/${blog.author.username}`} className="flex items-center gap-3 hover:opacity-80">
          <img
            src={blog.author.avatar || generateAvatarUrl(blog.author.name)}
            alt={blog.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{blog.author.name}</p>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatDate(blog.createdAt)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4 ml-auto">
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-3)' }}>
            <Clock size={14} /> {blog.readTime} min read
          </span>
          <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-3)' }}>
            <Eye size={14} /> {blog.views}
          </span>
        </div>
      </div>

      {/* Cover image */}
      {blog.coverImage && (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full rounded-2xl mb-10 object-cover max-h-[500px]"
        />
      )}

      {/* Content */}
      <div className="prose mb-10">
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {blog.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/search?tag=${tag}`}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 py-6 border-t border-b mb-10" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => {
            if (!isAuthenticated) { toast.error('Login to like'); return; }
            likeMutation.mutate();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
          style={{
            borderColor: liked ? 'var(--danger)' : 'var(--border)',
            color: liked ? 'var(--danger)' : 'var(--text-2)',
            background: liked ? '#fee2e2' : 'var(--surface)',
          }}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </button>

        <button
          onClick={() => {
            if (!isAuthenticated) { toast.error('Login to save'); return; }
            saveMutation.mutate();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
          style={{
            borderColor: saved ? 'var(--accent)' : 'var(--border)',
            color: saved ? 'var(--accent)' : 'var(--text-2)',
            background: saved ? 'var(--accent-light)' : 'var(--surface)',
          }}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
        >
          <Share2 size={16} /> Share
        </button>

        {isAuthenticated && user?._id === blog.author._id && (
          <Link
            href={`/blog/edit/${blog._id}`}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            <Edit size={16} /> Edit
          </Link>
        )}
      </div>

      {/* Author card */}
      <div className="p-6 rounded-2xl border mb-10" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start gap-4">
          <img
            src={blog.author.avatar || generateAvatarUrl(blog.author.name)}
            alt={blog.author.name}
            className="w-14 h-14 rounded-full"
          />
          <div>
            <Link href={`/user/${blog.author.username}`} className="font-bold text-base hover:text-blue-600" style={{ color: 'var(--text)' }}>
              {blog.author.name}
            </Link>
            <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>{blog.author.bio || 'Writer at BlogApp'}</p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <section>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <MessageCircle size={20} /> Comments ({comments.length})
        </h3>

        {/* Comment form */}
        {isAuthenticated ? (
          <div className="flex gap-3 mb-8">
            <img
              src={user?.avatar || generateAvatarUrl(user?.name || '')}
              alt={user?.name}
              className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={2}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm resize-none outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <button
                onClick={() => comment.trim() && commentMutation.mutate(comment.trim())}
                disabled={!comment.trim() || commentMutation.isPending}
                className="p-3 rounded-xl text-white disabled:opacity-50 self-end"
                style={{ background: 'var(--accent)' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border mb-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              <Link href="/auth/login" className="font-medium" style={{ color: 'var(--accent)' }}>Login</Link> to join the discussion
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {commentsLoading ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-3)' }}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-3)' }}>No comments yet. Be the first!</p>
          ) : (
            comments.map((c: any) => (
              <CommentItem
                key={c._id}
                comment={c}
                currentUser={user}
                onDelete={(id) => deleteCommentMutation.mutate(id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function CommentItem({ comment, currentUser, onDelete }: any) {
  const canDelete = currentUser?._id === comment.author._id || currentUser?.role === 'admin';

  return (
    <div className="flex gap-3">
      <img
        src={comment.author.avatar || generateAvatarUrl(comment.author.name)}
        alt={comment.author.name}
        className="w-9 h-9 rounded-full flex-shrink-0"
      />
      <div className="flex-1">
        <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{comment.author.name}</span>
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>{comment.content}</p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(comment._id)}
            className="flex items-center gap-1 mt-1 text-xs px-2 py-1 rounded text-red-500 hover:bg-red-50"
          >
            <Trash2 size={11} /> Delete
          </button>
        )}

        {/* Nested replies */}
        {comment.replies?.map((reply: any) => (
          <div key={reply._id} className="ml-6 mt-3 flex gap-3">
            <img src={reply.author.avatar || generateAvatarUrl(reply.author.name)} alt={reply.author.name} className="w-7 h-7 rounded-full flex-shrink-0" />
            <div className="p-3 rounded-xl flex-1" style={{ background: 'var(--surface-2)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{reply.author.name}</span>
              <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{reply.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
