'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { blogsApi, categoriesApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2, Save, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  title: z.string().min(5).max(150),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(50),
  category: z.string().min(1),
  coverImage: z.string().url().or(z.literal('')).optional(),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
});
type FormData = z.infer<typeof schema>;

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll() as any,
  });

  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ['blog-edit', id],
    queryFn: async () => {
      // We fetch by ID via the my-blogs list. In production you'd have GET /blogs/:id
      const res = await blogsApi.getMyBlogs({ limit: 100 }) as any;
      const blog = res.blogs?.find((b: any) => b._id === id);
      if (!blog) throw new Error('Blog not found');
      return blog;
    },
  });

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (blogData) {
      reset({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content || '',
        category: blogData.category?._id || blogData.category,
        coverImage: blogData.coverImage || '',
        tags: blogData.tags?.join(', ') || '',
        status: blogData.status,
      });
    }
  }, [blogData, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => blogsApi.update(id, data) as any,
    onSuccess: (res) => {
      toast.success('Blog updated!');
      router.push(res.blog.status === 'published' ? `/blog/${res.blog.slug}` : '/dashboard');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    mutation.mutate({ ...data, tags });
  };

  const coverImage = watch('coverImage', '');
  const categories = categoriesData?.categories || [];

  if (blogLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg border hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--text-2)' }} />
          </Link>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Edit Post</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Field label="Title *" error={errors.title?.message}>
            <input {...register('title')} className="input-field text-xl font-semibold" style={{ fontFamily: 'var(--font-display)' }} />
          </Field>
          <Field label="Excerpt *" error={errors.excerpt?.message}>
            <textarea {...register('excerpt')} rows={2} className="input-field resize-none" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category *" error={errors.category?.message}>
              <select {...register('category')} className="input-field">
                <option value="">Select category</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Tags">
              <input {...register('tags')} placeholder="react, nodejs (comma separated)" className="input-field" />
            </Field>
          </div>
          <Field label="Cover Image URL">
            <input {...register('coverImage')} type="url" className="input-field" />
            {coverImage && (
              <img src={coverImage} alt="" className="mt-2 h-36 w-full object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
            )}
          </Field>
          <Field label="Content * (Markdown)" error={errors.content?.message}>
            <textarea {...register('content')} rows={20} className="input-field font-mono text-sm" style={{ fontFamily: 'var(--font-mono)' }} />
          </Field>

          <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <button type="submit" onClick={() => setValue('status', 'draft')} disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}>
              <Save size={15} /> Save Draft
            </button>
            <button type="submit" onClick={() => setValue('status', 'published')} disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {isSubmitting ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .input-field { width:100%; padding:.625rem .875rem; border-radius:.625rem; border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:.875rem; outline:none; transition:border-color .15s; }
        .input-field:focus { border-color:var(--accent); }
      `}</style>
    </ProtectedRoute>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
