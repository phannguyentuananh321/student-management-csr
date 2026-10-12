import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CheckCircleIcon, AlertCircleIcon, CloseIcon } from './Icons';

export default function Toast({ toast, onClose }) {
  const toastRef = useRef(null);

  useEffect(() => {
    if (!toast || !toastRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      gsap.fromTo(
        toastRef.current,
        { y: -30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }

    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleClose = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && toastRef.current) {
      gsap.to(toastRef.current, {
        y: -20,
        opacity: 0,
        scale: 0.95,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full px-4 pointer-events-none">
      <div
        ref={toastRef}
        role="alert"
        aria-live="assertive"
        className={`pointer-events-auto flex items-start p-4 rounded-none border-2 bg-white shadow-sharp ${
          isSuccess ? 'border-dark-900 border-l-8 border-l-gold' : 'border-red-600 border-l-8 border-l-red-600'
        }`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <div className="w-6 h-6 rounded-full bg-gold/30 flex items-center justify-center text-dark-900">
              <CheckCircleIcon className="w-5 h-5 text-dark-900" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircleIcon className="w-5 h-5 text-red-600" />
            </div>
          )}
        </div>

        <div className="ml-3 flex-1">
          <p className="text-sm font-bold text-dark-900 tracking-tight">
            {isSuccess ? 'Thao tác thành công' : 'Đã có lỗi xảy ra'}
          </p>
          <p className="mt-0.5 text-xs text-dark-600 font-medium leading-relaxed">
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleClose}
          type="button"
          aria-label="Đóng thông báo"
          className="ml-3 flex-shrink-0 text-dark-500 hover:text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900 p-1"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
