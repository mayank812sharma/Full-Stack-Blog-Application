'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn, generateAvatarUrl } from '@/lib/utils';
import {
  PenSquare, Search, Menu, X, ChevronDown,
  LayoutDashboard, Settings, LogOut, Shield, BookOpen,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-200',
        scrolled
          ? 'shadow-sm backdrop-blur-md'
          : ''
      )}
      style={{
        background: scrolled ? 'rgba(var(--surface-rgb, 255,255,255), 0.92)' : 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>B</span>
            BlogApp
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={cn('text-sm font-medium transition-colors hover:text-blue-600', pathname === '/' ? 'text-blue-600' : '')} style={{ color: pathname === '/' ? 'var(--accent)' : 'var(--text-2)' }}>
              Home
            </Link>
            <Link href="/search" className="text-sm font-medium transition-colors" style={{ color: pathname === '/search' ? 'var(--accent)' : 'var(--text-2)' }}>
              Explore
            </Link>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <Link href="/search" className="p-2 rounded-lg transition-colors hover:bg-gray-100" style={{ color: 'var(--text-2)' }}>
              <Search size={18} />
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/blog/create"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  <PenSquare size={15} />
                  Write
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <img
                      src={user?.avatar || generateAvatarUrl(user?.name || 'User')}
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <ChevronDown size={14} style={{ color: 'var(--text-2)' }} />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden animate-slide-down"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                        <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{user?.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-3)' }}>@{user?.username}</p>
                      </div>

                      <div className="p-1">
                        <MenuItem href="/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard" />
                        <MenuItem href="/profile" icon={<Settings size={15} />} label="Profile" />
                        {user?.role === 'admin' && (
                          <MenuItem href="/admin" icon={<Shield size={15} />} label="Admin Panel" />
                        )}
                        <MenuItem href="/blog/create" icon={<PenSquare size={15} />} label="Write" />
                        <MenuItem href="/dashboard/saved" icon={<BookOpen size={15} />} label="Saved" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-red-50 text-red-600"
                        >
                          <LogOut size={15} />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--text-2)' }}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'var(--text-2)' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t p-4 space-y-1 animate-slide-down" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <MobileLink href="/" label="Home" />
          <MobileLink href="/search" label="Explore" />
          {isAuthenticated && <MobileLink href="/blog/create" label="Write a Post" />}
        </div>
      )}
    </header>
  );
}

function MenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50"
      style={{ color: 'var(--text-2)' }}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-sm font-medium rounded-lg"
      style={{ color: 'var(--text-2)' }}
    >
      {label}
    </Link>
  );
}
