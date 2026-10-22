import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 20, 24, 48],
  itemLabel = 'items',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startItem = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalRecords, currentPage * pageSize);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalRecords <= 0 && currentPage === 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-200 mt-6 text-xs text-slate-600">
      {/* Showing range & total */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-900">{startItem}</strong> to <strong className="text-slate-900">{endItem}</strong> of{' '}
          <strong className="text-slate-900">{totalRecords}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page numbers & Prev/Next */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition cursor-pointer flex items-center gap-1 font-semibold"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer flex items-center justify-center ${
                  currentPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1.5 text-slate-400 font-bold">
                {p}
              </span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 transition cursor-pointer flex items-center gap-1 font-semibold"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
