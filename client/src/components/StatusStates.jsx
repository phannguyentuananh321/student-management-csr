import React from 'react';
import { AlertCircleIcon, RefreshIcon } from './Icons';

export function ErrorState({ message, onRetry }) {
  return (
    <div className="bg-white border-2 border-red-600 border-l-8 p-8 shadow-sharp my-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 border-2 border-red-600 flex items-center justify-center text-red-600 flex-shrink-0">
          <AlertCircleIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-extrabold text-dark-900">
            Không thể kết nối đến máy chủ API
          </h3>
          <p className="mt-1 text-xs text-dark-600 font-medium leading-relaxed">
            {message || 'Đã xảy ra lỗi khi tải danh sách sinh viên từ backend Express.'}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onRetry}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 bg-dark-900 hover:bg-dark-800 text-white font-bold text-xs uppercase tracking-wider border-2 border-dark-900 transition-colors shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>Thử kết nối lại</span>
            </button>
            <span className="text-[11px] text-dark-500 font-mono">
              (Kiểm tra server đã chạy tại http://localhost:5000 chưa)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="bg-white border-2 border-dark-900 shadow-sharp p-6 space-y-4 my-6">
      <div className="flex items-center justify-between border-b-2 border-dark-900 pb-3">
        <div className="h-4 bg-surface-200 w-32 animate-pulse"></div>
        <div className="h-4 bg-surface-200 w-20 animate-pulse"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 bg-surface-200 w-12 animate-pulse"></div>
            <div className="h-4 bg-surface-200 flex-1 animate-pulse"></div>
            <div className="h-4 bg-surface-200 w-48 animate-pulse"></div>
            <div className="h-4 bg-surface-200 w-24 animate-pulse"></div>
            <div className="h-4 bg-surface-200 w-20 animate-pulse"></div>
            <div className="h-7 bg-surface-200 w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
