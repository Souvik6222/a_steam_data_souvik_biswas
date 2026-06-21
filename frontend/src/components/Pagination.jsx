import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-light border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      {/* Page numbers */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-headline font-semibold bg-surface-light border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary transition-all duration-200 cursor-pointer"
          >
            1
          </button>
          {pages[0] > 2 && (
            <span className="text-text-muted text-xs px-1">…</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-headline font-semibold transition-all duration-200 cursor-pointer ${
            page === currentPage
              ? 'nexus-btn-gradient text-white shadow-glow'
              : 'bg-surface-light border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary'
          }`}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-text-muted text-xs px-1">…</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-headline font-semibold bg-surface-light border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary transition-all duration-200 cursor-pointer"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-light border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
};

export default Pagination;
