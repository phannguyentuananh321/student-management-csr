import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Dialog from '@mui/material/Dialog';
import { validateStudentForm } from '../utils/validation';
import { CloseIcon, UserIcon, MailIcon, CalendarIcon, GraduationCapIcon } from './Icons';

export default function AddStudentModal({
  isOpen,
  onClose,
  onSubmit,
  existingStudents = [],
  availableClasses = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    className: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const modalContentRef = useRef(null);
  const nameInputRef = useRef(null);

  // Focus vào ô tên khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setServerError('');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi của trường đang sửa
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError('');
  };

  const shakeModal = () => {
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (prefersReducedMotion || !modalContentRef.current) return;

    gsap.fromTo(
      modalContentRef.current,
      { x: -10 },
      { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // 1. Kiểm tra validation phía client (tuổi >= 17)
    const validation = validateStudentForm(formData, existingStudents);
    if (!validation.isValid) {
      setErrors(validation.errors);
      shakeModal();
      return;
    }

    // 2. Gửi dữ liệu tới API
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      // Nếu thành công: reset form và đóng modal
      setFormData({ name: '', email: '', dateOfBirth: '', className: '' });
      setErrors({});
      onClose();
    } catch (err) {
      shakeModal();
      if (err.errors && Object.keys(err.errors).length > 0) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'Không thể thêm sinh viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
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
      <div ref={modalContentRef} className="bg-white p-6 relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-dark-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-gold border border-dark-900"></span>
              <p className="text-xs font-bold uppercase tracking-wider text-dark-500">
                Thao tác quản trị
              </p>
            </div>
            <h2 className="text-xl font-extrabold text-dark-900 tracking-tight mt-1">
              Thêm Sinh Viên Mới
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
            aria-label="Đóng hộp thoại"
            className="p-1 text-dark-500 hover:text-dark-900 hover:bg-surface-200 border border-transparent hover:border-dark-900 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-900"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo lỗi tổng quát từ Server */}
        {serverError && (
          <div
            role="alert"
            className="mt-4 p-3 bg-red-50 border-2 border-red-600 text-red-700 text-xs font-semibold"
          >
            {serverError}
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Tên sinh viên */}
          <div>
            <label
              htmlFor="student-name"
              className="block text-xs font-bold uppercase tracking-wide text-dark-900 mb-1"
            >
              Họ và tên sinh viên <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                ref={nameInputRef}
                type="text"
                id="student-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-surface-50 border-2 text-dark-900 placeholder-dark-400 focus:outline-none focus:bg-white transition-colors ${
                  errors.name
                    ? 'border-red-600 focus:ring-2 focus:ring-red-600'
                    : 'border-dark-900 focus:ring-2 focus:ring-gold'
                }`}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs font-semibold text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Gmail */}
          <div>
            <label
              htmlFor="student-email"
              className="block text-xs font-bold uppercase tracking-wide text-dark-900 mb-1"
            >
              Địa chỉ Gmail (@gmail.com) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                <MailIcon className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="student-email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@gmail.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-surface-50 border-2 text-dark-900 placeholder-dark-400 focus:outline-none focus:bg-white transition-colors ${
                  errors.email
                    ? 'border-red-600 focus:ring-2 focus:ring-red-600'
                    : 'border-dark-900 focus:ring-2 focus:ring-gold'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs font-semibold text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Ngày sinh (Từ 17 tuổi trở lên) */}
          <div>
            <label
              htmlFor="student-dob"
              className="block text-xs font-bold uppercase tracking-wide text-dark-900 mb-1"
            >
              Ngày sinh (Từ 17 tuổi trở lên) <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                id="student-dob"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                disabled={isSubmitting}
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby={errors.dateOfBirth ? 'dob-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-surface-50 border-2 text-dark-900 focus:outline-none focus:bg-white transition-colors ${
                  errors.dateOfBirth
                    ? 'border-red-600 focus:ring-2 focus:ring-red-600'
                    : 'border-dark-900 focus:ring-2 focus:ring-gold'
                }`}
              />
            </div>
            {errors.dateOfBirth && (
              <p id="dob-error" className="mt-1 text-xs font-semibold text-red-600">
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Lớp */}
          <div>
            <label
              htmlFor="student-class"
              className="block text-xs font-bold uppercase tracking-wide text-dark-900 mb-1"
            >
              Lớp học <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-500">
                <GraduationCapIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="student-class"
                list="class-suggestions"
                value={formData.className}
                onChange={(e) => handleChange('className', e.target.value)}
                placeholder="Ví dụ: SE1, IT2..."
                disabled={isSubmitting}
                aria-invalid={!!errors.className}
                aria-describedby={errors.className ? 'class-error' : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-surface-50 border-2 text-dark-900 placeholder-dark-400 focus:outline-none focus:bg-white transition-colors ${
                  errors.className
                    ? 'border-red-600 focus:ring-2 focus:ring-red-600'
                    : 'border-dark-900 focus:ring-2 focus:ring-gold'
                }`}
              />
              <datalist id="class-suggestions">
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls} />
                ))}
              </datalist>
            </div>
            {errors.className && (
              <p id="class-error" className="mt-1 text-xs font-semibold text-red-600">
                {errors.className}
              </p>
            )}
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t-2 border-dark-900/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
              className="px-4 py-2 text-xs font-bold text-dark-900 bg-surface-100 hover:bg-surface-200 border-2 border-dark-900 transition-colors focus:outline-none focus:ring-2 focus:ring-dark-900"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-black uppercase tracking-wider text-dark-900 bg-gold hover:bg-gold-hover border-2 border-dark-900 shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-dark-900 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu sinh viên'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
