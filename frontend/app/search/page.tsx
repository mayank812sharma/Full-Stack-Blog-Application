'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { blogsApi, categoriesApi } from '@/lib/api';
import BlogCard from '@/components/blog/BlogCard';
import Pagination from '@/components/ui/Pagination';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(1); }, [debouncedQuery, category, tag, sort]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, category, tag, sort, page],
    queryFn: () =>
      blogsApi.getAll({
        search: debouncedQuery || undefined,
        category: category || undefined,
        tag: tag || undefined,
        sort,
        page,
        limit: 9,
      }) as any,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll() as any,
    staleTime: Infinity,
  });

  const blogs = data?.blogs || [];
  const pagination = data?.pagination;
  const categories = categoriesData?.categories || [];

  const clearFilters = () => {
    setQuery(''); setCategory(''); setTag(''); setSort('-createdAt'); setPage(1);
  };

  const hasFilters = query || category || tag;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Explore
      </h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, topics, tags..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border outline-none text-sm transition-all"
          style={{
            background: 'var(--surface)', borderColor: 'var(--border)',
            color: 'var(--text)', fontSize: '1rem',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex flex-wrap gap-2 flex-1">
          <FilterChip label="All" active={!category} onClick={() => setCategory('')} />
          {categories.map((c: any) => (
            <FilterChip key={c._id} label={`${c.icon} ${c.name}`} active={category === c._id} onClick={() => setCategory(c._id === category ? '' : c._id)} />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border text-red-500 hover:bg-red-50"
              style={{ borderColor: '#fca5a5' }}>
              <X size={12} /> Clear
            </button>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border outline-none"
            style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }}>
            <option value="-createdAt">Latest</option>
            <option value="-views">Most Viewed</option>
            <option value="-likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Active tag filter */}
      {tag && (
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>Tag:</span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-light)' }}>
            #{tag}
            <button onClick={() => setTag('')}><X size={11} /></button>
          </span>
        </div>
      )}

      {/* Results */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <div className="skeleton h-40 w-full rounded-xl" />
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-5 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>No results found</h3>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            {query ? `No posts matching "${query}"` : 'No posts in this category yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {pagination?.total} result{pagination?.total !== 1 ? 's' : ''}
              {query && ` for "${query}"`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {blogs.map((blog: any) => <BlogCard key={blog._id} blog={blog} />)}
          </div>
          {pagination && (
            <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all"
      style={{
        background: active ? 'var(--accent)' : 'var(--surface)',
        color: active ? '#fff' : 'var(--text-2)',
        borderColor: active ? 'var(--accent)' : 'var(--border)',
      }}>
      {label}
    </button>
  );
}
