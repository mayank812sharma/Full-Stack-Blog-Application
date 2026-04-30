'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50),
  username: z.string().min(3, 'At least 3 characters').max(30)
    .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register(data) as any;
      setAuth(res.user, res.token);
      toast.success(`Welcome, ${res.user.name}! 🎉`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'var(--accent)' }}>B</span>
            BlogApp
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Create your account</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Join thousands of writers and readers</p>
        </div>

        <div className="p-8 rounded-2xl border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name?.message}>
                <input {...register('name')} placeholder="John Doe" className="input-field" />
              </Field>
              <Field label="Username" error={errors.username?.message}>
                <input {...register('username')} placeholder="johndoe" className="input-field" />
              </Field>
            </div>

            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-3">
                  {checks.map((c) => (
                    <span key={c.label} className="flex items-center gap-1 text-xs"
                      style={{ color: c.ok ? 'var(--success)' : 'var(--text-3)' }}>
                      {c.ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {c.label}
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ background: 'var(--accent)' }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-2)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-color: var(--accent); }
        .input-field::placeholder { color: var(--text-3); }
      `}</style>
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
