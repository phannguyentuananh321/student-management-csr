import React, { useRef } from 'react';
import gsap from 'gsap';
import { SearchIcon, FilterIcon, PlusIcon, RefreshIcon, CloseIcon } from './Icons';

export default function Toolbar({
  searchTerm,
  onSearchChange,
  selectedClass,
  onClassChange,
  availableClasses,
  onOpenAddModal,
  onRefresh,
  isLoading
}) {
  const addBtnRef = useRef(null);

  const handleBtnMouseEnter = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !addBtnRef.current) return;
    gsap.to(addBtnRef.current, { scale: 1.02, y: -2, duration: 0.15, ease: 'power2.out' });
  };

  const handleBtnMouseLeave = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !addBtnRef.current) return;
    gsap.to(addBtnRef.current, { scale: 1, y: 0, duration: 0.15, ease: 'power2.in' });
  };

  return (
    <div className="bg-white border-2 border-dark-900 p-4 shadow-sharp mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Tìm kiếm và Lọc lớp */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              aria-label="Tìm kiếm sinh viên theo tên hoặc email"
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-50 border-2 border-dark-900 text-dark-900 placeholder-dark-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gold focus:border-dark-900 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                type="button"
                aria-label="Xóa tìm kiếm"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-dark-500 hover:text-dark-900"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lọc lớp thực tế */}
          <div className="relative sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select
              id="class-filter"
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value)}
              aria-label="Lọc theo lớp"
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-surface-50 border-2 border-dark-900 text-dark-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gold focus:border-dark-900 appearance-none transition-colors cursor-pointer"
            >
              <option value="">Tất cả các lớp ({availableClasses.length})</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Lớp: {cls}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-dark-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Nút reset lọc khi đang lọc */}
          {(searchTerm || selectedClass) && (
            <button
              onClick={() => {
                onSearchChange('');
                onClassChange('');
              }}
              type="button"
              className="px-3 py-2.5 text-xs font-bold text-dark-700 hover:text-dark-900 border-2 border-dashed border-dark-900/40 hover:border-dark-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <CloseIcon className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Right: Refresh & Nút Thêm sinh viên màu #FFD700 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            type="button"
            aria-label="Tải lại danh sách"
            title="Tải lại danh sách từ server"
            className="p-2.5 border-2 border-dark-900 bg-surface-50 hover:bg-surface-200 text-dark-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50"
          >
            <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            ref={addBtnRef}
            onClick={onOpenAddModal}
            onMouseEnter={handleBtnMouseEnter}
            onMouseLeave={handleBtnMouseLeave}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-dark-900 font-extrabold text-sm border-2 border-dark-900 shadow-sharp-sm hover:shadow-sharp transition-all focus:outline-none focus:ring-2 focus:ring-dark-900 active:translate-x-0.5 active:translate-y-0.5"
          >
            <PlusIcon className="w-4 h-4 text-dark-900" />
            <span>Thêm sinh viên</span>
          </button>
        </div>
      </div>
    </div>
  );
}
