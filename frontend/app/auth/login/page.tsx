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
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data) as any;
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      router.push(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'var(--accent)' }}>B</span>
            BlogApp
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Sign in to continue writing and reading</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 p-4 rounded-xl text-xs space-y-1" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Demo Credentials</p>
            <p>User: john@blogapp.com / John@1234</p>
            <p>Admin: admin@blogapp.com / Admin@1234</p>
          </div>

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-2)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Sign up
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
