'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { usersApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { generateAvatarUrl } from '@/lib/utils';
import { Loader2, Camera, Github, Twitter, Linkedin } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().max(300).optional(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  avatar: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  'social.twitter': z.string().optional(),
  'social.github': z.string().optional(),
  'social.linkedin': z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const { register: regProfile, handleSubmit: handleProfile, reset, watch,
    formState: { errors: profileErrors, isSubmitting: profileSaving } } =
    useForm<ProfileData>({ resolver: zodResolver(profileSchema) });

  const { register: regPw, handleSubmit: handlePw, reset: resetPw,
    formState: { errors: pwErrors, isSubmitting: pwSaving } } =
    useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        bio: user.bio || '',
        website: user.website || '',
        avatar: user.avatar || '',
        'social.twitter': user.social?.twitter || '',
        'social.github': user.social?.github || '',
        'social.linkedin': user.social?.linkedin || '',
      });
    }
  }, [user, reset]);

  const avatarPreview = watch('avatar', '');

  const profileMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        name: data.name, bio: data.bio, website: data.website, avatar: data.avatar,
        social: {
          twitter: data['social.twitter'],
          github: data['social.github'],
          linkedin: data['social.linkedin'],
        },
      };
      return usersApi.updateProfile(payload) as any;
    },
    onSuccess: (res) => {
      updateUser(res.user);
      toast.success('Profile updated!');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordData) => authApi.changePassword(data) as any,
    onSuccess: () => {
      toast.success('Password changed!');
      resetPw();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
          Profile Settings
        </h1>

        {/* Avatar preview */}
        <div className="flex items-center gap-5 mb-8 p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="relative">
            <img
              src={avatarPreview || generateAvatarUrl(user?.name || '')}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border-4"
              style={{ borderColor: 'var(--surface-2)' }}
              onError={(e) => (e.currentTarget.src = generateAvatarUrl(user?.name || ''))}
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>@{user?.username}</p>
            <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block capitalize"
              style={{ background: user?.role === 'admin' ? '#fee2e2' : 'var(--accent-light)', color: user?.role === 'admin' ? '#dc2626' : 'var(--accent)' }}>
              {user?.role}
            </p>
          </div>
        </div>

        {/* Profile form */}
        <Card title="Personal Info">
          <form onSubmit={handleProfile((data) => profileMutation.mutate(data))} className="space-y-5">
            <Field label="Display Name" error={profileErrors.name?.message}>
              <input {...regProfile('name')} className="input-field" />
            </Field>
            <Field label="Avatar URL" error={profileErrors.avatar?.message}>
              <input {...regProfile('avatar')} type="url" placeholder="https://..." className="input-field" />
            </Field>
            <Field label="Bio" error={profileErrors.bio?.message}>
              <textarea {...regProfile('bio')} rows={3} placeholder="Tell the world about yourself..." className="input-field resize-none" />
            </Field>
            <Field label="Website" error={profileErrors.website?.message}>
              <input {...regProfile('website')} type="url" placeholder="https://yourwebsite.com" className="input-field" />
            </Field>

            <p className="text-sm font-semibold pt-2" style={{ color: 'var(--text)' }}>Social Links</p>
            <div className="space-y-3">
              <SocialField icon={<Twitter size={15} />} label="Twitter">
                <input {...regProfile('social.twitter')} placeholder="@handle" className="input-field" />
              </SocialField>
              <SocialField icon={<Github size={15} />} label="GitHub">
                <input {...regProfile('social.github')} placeholder="username" className="input-field" />
              </SocialField>
              <SocialField icon={<Linkedin size={15} />} label="LinkedIn">
                <input {...regProfile('social.linkedin')} placeholder="username" className="input-field" />
              </SocialField>
            </div>

            <button type="submit" disabled={profileSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {profileSaving && <Loader2 size={15} className="animate-spin" />}
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>

        {/* Password form */}
        <Card title="Change Password">
          <form onSubmit={handlePw((data) => passwordMutation.mutate(data))} className="space-y-4">
            <Field label="Current Password" error={pwErrors.currentPassword?.message}>
              <input {...regPw('currentPassword')} type="password" className="input-field" />
            </Field>
            <Field label="New Password" error={pwErrors.newPassword?.message}>
              <input {...regPw('newPassword')} type="password" className="input-field" />
            </Field>
            <button type="submit" disabled={pwSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {pwSaving && <Loader2 size={15} className="animate-spin" />}
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Card>
      </div>

      <style jsx>{`
        .input-field { width:100%; padding:.625rem .875rem; border-radius:.625rem; border:1px solid var(--border); background:var(--bg); color:var(--text); font-size:.875rem; outline:none; transition:border-color .15s; }
        .input-field:focus { border-color:var(--accent); }
        .input-field::placeholder { color:var(--text-3); }
      `}</style>
    </ProtectedRoute>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl border mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h2 className="text-base font-bold mb-5" style={{ color: 'var(--text)' }}>{title}</h2>
      {children}
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

function SocialField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 w-24 text-sm shrink-0" style={{ color: 'var(--text-2)' }}>
        {icon} {label}
      </div>
      {children}
    </div>
  );
}
