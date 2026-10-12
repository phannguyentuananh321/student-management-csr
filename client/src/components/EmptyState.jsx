import React from 'react';
import { SearchIcon, UserIcon, PlusIcon } from './Icons';

export default function EmptyState({
  isSearchEmpty = false,
  onOpenAddModal,
  onResetSearch
}) {
  if (isSearchEmpty) {
    return (
      <div className="bg-white border-2 border-dark-900 p-10 text-center shadow-sharp my-6">
        <div className="w-12 h-12 mx-auto bg-surface-100 border-2 border-dark-900 flex items-center justify-center text-dark-500 shadow-sharp-sm">
          <SearchIcon className="w-6 h-6" />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-dark-900">
          Không tìm thấy sinh viên phù hợp
        </h3>
        <p className="mt-1 text-xs text-dark-500 max-w-sm mx-auto">
          Không có sinh viên nào khớp với từ khóa tìm kiếm hoặc bộ lọc lớp đã chọn.
        </p>
        <button
          onClick={onResetSearch}
          type="button"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-surface-50 hover:bg-gold text-dark-900 font-bold text-xs border-2 border-dark-900 transition-colors shadow-sharp-sm"
        >
          Xóa bộ lọc tìm kiếm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-dark-900 p-12 text-center shadow-sharp my-6">
      <div className="w-14 h-14 mx-auto bg-gold border-2 border-dark-900 flex items-center justify-center text-dark-900 shadow-sharp-sm">
        <UserIcon className="w-7 h-7 text-dark-900" />
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-dark-900">
        Chưa có sinh viên nào trong hệ thống
      </h3>
      <p className="mt-1.5 text-xs text-dark-500 max-w-md mx-auto">
        Hiện tại cơ sở dữ liệu chưa có bản ghi nào. Bạn có thể dán seed data từ Block 1 vào file <code className="bg-surface-200 px-1 py-0.5 font-mono text-dark-900 font-bold">server/data/students.json</code> hoặc nhấn nút bên dưới để thêm sinh viên đầu tiên.
      </p>
      <div className="mt-5">
        <button
          onClick={onOpenAddModal}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-hover text-dark-900 font-extrabold text-xs uppercase tracking-wider border-2 border-dark-900 shadow-sharp transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <PlusIcon className="w-4 h-4 text-dark-900" />
          <span>Thêm sinh viên đầu tiên</span>
        </button>
      </div>
    </div>
  );
}
