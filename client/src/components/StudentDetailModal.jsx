import React from 'react';
import Dialog from '@mui/material/Dialog';
import { formatDateToDisplay, calculateAge } from '../utils/dateUtils';
import { extractCleanEmail } from '../utils/validation';
import { CloseIcon, IdIcon, UserIcon, MailIcon, CalendarIcon, GraduationCapIcon } from './Icons';

export default function StudentDetailModal({ student, onClose }) {
  if (!student) return null;

  const rawDob = student.dateOfBirth || student.dob;
  const age = calculateAge(rawDob);
  const cleanEmail = extractCleanEmail(student.email);

  return (
    <Dialog
      open={!!student}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          style: {
            backgroundColor: 'rgba(17, 18, 21, 0.75)',
            backdropFilter: 'blur(3px)'
          }
        },
        paper: {
          style: {
            borderRadius: 0,
            border: '3px solid #111215',
            boxShadow: '6px 6px 0px 0px #FFD700',
            margin: '16px'
          }
        }
      }}
    >
      <div className="bg-white p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-dark-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gold border border-dark-900"></span>
              <p className="text-xs font-bold uppercase tracking-wider text-dark-500">
                Thông tin chi tiết
              </p>
            </div>
            <h2 className="text-xl font-extrabold text-dark-900 tracking-tight mt-1">
              Hồ Sơ Sinh Viên
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Đóng chi tiết sinh viên"
            className="p-1 text-dark-500 hover:text-dark-900 hover:bg-surface-200 border border-transparent hover:border-dark-900 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-900"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="mt-5 space-y-4">
          {/* Card ID & Tên */}
          <div className="p-4 bg-surface-50 border-2 border-dark-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-gold border-2 border-dark-900 flex items-center justify-center font-mono font-black text-dark-900 text-sm shadow-sharp-sm">
                {student.id}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dark-500">Mã sinh viên</p>
                <h3 className="text-base font-extrabold text-dark-900">{student.name}</h3>
              </div>
            </div>

            <span className="px-3 py-1 bg-white border border-dark-900 font-mono text-xs font-bold text-dark-900">
              {student.className}
            </span>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Gmail & Liên kết gửi thư */}
            <div className="p-3 border-2 border-dark-900 bg-white sm:col-span-2">
              <div className="flex items-center justify-between text-dark-500 mb-1">
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-dark-900" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Địa chỉ Gmail</span>
                </div>
                <span className="text-[10px] font-mono text-dark-500 bg-surface-100 px-1.5 py-0.5 border border-dark-900/10">
                  mailto link
                </span>
              </div>
              <p className="font-mono text-sm font-bold text-dark-900 break-all">
                {cleanEmail}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${cleanEmail}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-dark-900 bg-gold hover:bg-gold-hover border-2 border-dark-900 shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  title={`Gửi mail tới ${cleanEmail}`}
                >
                  <MailIcon className="w-3.5 h-3.5 text-dark-900" />
                  <span>Gửi thư (mailto:{cleanEmail})</span>
                </a>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(cleanEmail)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-dark-700 hover:text-dark-900 bg-surface-100 hover:bg-surface-200 border border-dark-900 transition-colors"
                  title="Mở ứng dụng web Gmail"
                >
                  <span>Mở trên Gmail Web ↗</span>
                </a>
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="p-3 border-2 border-dark-900 bg-white">
              <div className="flex items-center gap-2 text-dark-500 mb-1">
                <CalendarIcon className="w-4 h-4 text-dark-900" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Ngày sinh</span>
              </div>
              <p className="font-mono text-xs font-bold text-dark-900">
                {formatDateToDisplay(rawDob)}
              </p>
            </div>

            {/* Độ tuổi hiện tại */}
            <div className="p-3 border-2 border-dark-900 bg-white">
              <div className="flex items-center gap-2 text-dark-500 mb-1">
                <UserIcon className="w-4 h-4 text-dark-900" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Độ tuổi</span>
              </div>
              <p className="font-mono text-xs font-bold text-dark-900">
                {age !== null ? `${age} tuổi (Hợp lệ ≥ 17)` : 'Chưa xác định'}
              </p>
            </div>

            {/* Lớp sinh hoạt */}
            <div className="p-3 border-2 border-dark-900 bg-white">
              <div className="flex items-center gap-2 text-dark-500 mb-1">
                <GraduationCapIcon className="w-4 h-4 text-dark-900" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Lớp quản lý</span>
              </div>
              <p className="font-mono text-xs font-bold text-dark-900">{student.className}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t-2 border-dark-900/10 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-dark-900 bg-surface-100 hover:bg-gold border-2 border-dark-900 transition-colors shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            Đóng
          </button>
        </div>
      </div>
    </Dialog>
  );
}
