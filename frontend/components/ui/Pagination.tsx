'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-50"
        style={{ borderColor: 'var(--border)' }}
      >
        <ChevronLeft size={16} />
      </button>

      {pages[0] > 1 && (
        <>
          <PageBtn page={1} current={currentPage} onClick={onPageChange} />
          {pages[0] > 2 && <span className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <PageBtn key={p} page={p} current={currentPage} onClick={onPageChange} />
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-sm" style={{ color: 'var(--text-3)' }}>…</span>
          )}
          <PageBtn page={totalPages} current={currentPage} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-50"
        style={{ borderColor: 'var(--border)' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function PageBtn({ page, current, onClick }: { page: number; current: number; onClick: (p: number) => void }) {
  const isActive = page === current;
  return (
    <button
      onClick={() => onClick(page)}
      className={cn('w-9 h-9 rounded-lg text-sm font-medium transition-colors', isActive ? 'text-white' : 'hover:bg-gray-50')}
      style={{
        background: isActive ? 'var(--accent)' : 'transparent',
        color: isActive ? '#fff' : 'var(--text-2)',
        border: isActive ? 'none' : '1px solid var(--border)',
      }}
    >
      {page}
    </button>
  );
}
