import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--accent)' }}>B</span>
              BlogApp
            </Link>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              A modern blogging platform for developers and creators to share ideas that matter.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Platform</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/search', 'Explore'], ['/auth/register', 'Start Writing']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-blue-600" style={{ color: 'var(--text-2)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Account</h4>
            <ul className="space-y-2">
              {[['/auth/login', 'Login'], ['/auth/register', 'Register'], ['/dashboard', 'Dashboard']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-blue-600" style={{ color: 'var(--text-2)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} BlogApp. Built with Next.js, Node.js & MongoDB.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            Designed for production. Built to scale.
          </p>
        </div>
      </div>
    </footer>
  );
}
