import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { GraduationCapIcon } from './Icons';

export default function Header({ totalStudents, totalClasses }) {
  const headerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.header-elem', {
        y: -15,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out'
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header ref={headerRef} className="border-b-2 border-dark-900 bg-white py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="header-elem">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-gold border-2 border-dark-900 shadow-sharp-sm flex items-center justify-center font-bold text-dark-900">
              <GraduationCapIcon className="w-5 h-5 text-dark-900" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-dark-500 bg-surface-100 px-2 py-0.5 border border-dark-900/10">
              CSR Platform — Block 4
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-dark-900 tracking-tight">
            Quản Lý Sinh Viên
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-dark-500 font-normal">
            Hệ thống dashboard Client-Side Rendering kết nối Node.js Express REST API
          </p>
        </div>

        <div className="header-elem flex items-center gap-3">
          <div className="border-2 border-dark-900 bg-surface-50 px-4 py-2 shadow-sharp-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dark-500">
              Tổng số sinh viên
            </p>
            <p className="text-xl font-black text-dark-900 font-mono">
              {totalStudents}
            </p>
          </div>

          <div className="border-2 border-dark-900 bg-gold px-4 py-2 shadow-sharp-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dark-900">
              Lớp học thực tế
            </p>
            <p className="text-xl font-black text-dark-900 font-mono">
              {totalClasses}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
