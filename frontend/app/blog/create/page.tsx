'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { blogsApi, categoriesApi } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Loader2, Eye, Save, Send } from 'lucide-react';

const schema = z.object({
  title: z.string().min(5, 'Min 5 characters').max(150),
  excerpt: z.string().min(10, 'Min 10 characters').max(300),
  content: z.string().min(50, 'Min 50 characters'),
  category: z.string().min(1, 'Select a category'),
  coverImage: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
});
type FormData = z.infer<typeof schema>;

export default function CreateBlogPage() {
  const router = useRouter();
  const [preview, setPreview] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll() as any,
  });

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'draft' },
  });

  const content = watch('content', '');
  const coverImage = watch('coverImage', '');

  const mutation = useMutation({
    mutationFn: (data: any) => blogsApi.create(data) as any,
    onSuccess: (res) => {
      toast.success(res.blog.status === 'published' ? 'Blog published! 🎉' : 'Saved as draft');
      router.push(res.blog.status === 'published' ? `/blog/${res.blog.slug}` : '/dashboard');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const onSubmit = (data: FormData) => {
    const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    mutation.mutate({ ...data, tags });
  };

  const categories = categoriesData?.categories || [];

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            Write a Post
          </h1>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            <Eye size={15} />
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          <ContentPreview content={content} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Field label="Title *" error={errors.title?.message}>
              <input
                {...register('title')}
                placeholder="Write a compelling title..."
                className="input-field text-xl font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              />
            </Field>

            <Field label="Excerpt *" error={errors.excerpt?.message}>
              <textarea
                {...register('excerpt')}
                placeholder="A short description that appears in listings..."
                rows={2}
                className="input-field resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category *" error={errors.category?.message}>
                <select {...register('category', {required:"Select a category"})} className="input-field">
                  <option value="other">Select category</option>
                  <option value="technology">Technology</option>
                  <option value="health">Health & Fitness</option>
                  <option value="finance">Personal Finance</option>
                  <option value="business">Business & Enterpreneurship</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="food">Food Recipes</option>
                  <option value="self">Self-improvement</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tags" error={errors.tags?.message}>
                <input
                  {...register('tags')}
                  placeholder="react, nodejs, webdev (comma separated)"
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="Cover Image URL" error={errors.coverImage?.message}>
              <input
                {...register('coverImage')}
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="input-field"
              />
              {coverImage && (
                <img src={coverImage} alt="Preview" className="mt-2 h-36 w-full object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
            </Field>

            <Field label="Content * (Markdown supported)" error={errors.content?.message}>
              <textarea
                {...register('content')}
                placeholder="Write your story in Markdown...&#10;&#10;# Heading&#10;&#10;**Bold**, *italic*, `code`&#10;&#10;```js&#10;const hello = 'world';&#10;```"
                rows={20}
                className="input-field font-mono text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                {content.split(/\s+/).filter(Boolean).length} words · ~{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min read
              </p>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="submit"
                onClick={() => setValue('status', 'draft')}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              >
                <Save size={15} />
                Save Draft
              </button>
              <button
                type="submit"
                onClick={() => setValue('status', 'published')}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-color: var(--accent); }
        .input-field::placeholder { color: var(--text-3); }
      `}</style>
    </ProtectedRoute>
  );
}

function ContentPreview({ content }: { content: string }) {
  const ReactMarkdown = require('react-markdown').default;
  return (
    <div className="p-8 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="prose max-w-none">
        {content ? <ReactMarkdown>{content}</ReactMarkdown> : (
          <p style={{ color: 'var(--text-3)' }}>Nothing to preview yet. Write some content first.</p>
        )}
      </div>
    </div>
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
