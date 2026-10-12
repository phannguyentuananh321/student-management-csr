import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { formatDateToDisplay } from '../utils/dateUtils';
import { extractCleanEmail } from '../utils/validation';
import { EyeIcon } from './Icons';

export default function StudentTable({
  students,
  newlyAddedId,
  onViewStudent
}) {
  const tableRef = useRef(null);

  // GSAP animation khi danh sách tải lần đầu hoặc thay đổi
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (prefersReducedMotion || !tableRef.current) return;

    const rows = tableRef.current.querySelectorAll('.student-row');
    if (rows.length > 0) {
      gsap.fromTo(
        rows,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.03,
          duration: 0.25,
          ease: 'power1.out'
        }
      );
    }
  }, [students.length]);

  // Highlight sinh viên mới được thêm
  useEffect(() => {
    if (!newlyAddedId || !tableRef.current) return;

    const row = tableRef.current.querySelector(`[data-student-id="${newlyAddedId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      gsap.fromTo(
        row,
        { backgroundColor: '#FFD700', scale: 1.01 },
        { backgroundColor: '#FFFFFF', scale: 1, duration: 1.6, ease: 'power2.out' }
      );
    }
  }, [newlyAddedId]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-2 border-dark-900 shadow-sharp overflow-hidden">
      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full text-left border-collapse">
          <caption className="sr-only">Danh sách sinh viên</caption>
          <thead>
            <tr className="bg-dark-900 text-white text-xs font-bold uppercase tracking-wider border-b-2 border-dark-900">
              <th scope="col" className="py-3.5 px-4 w-28 text-center font-mono">
                ID
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Tên sinh viên
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Email
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Ngày sinh
              </th>
              <th scope="col" className="py-3.5 px-4 font-bold">
                Lớp
              </th>
              <th scope="col" className="py-3.5 px-4 w-28 text-center font-bold">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {students.map((student, index) => {
              const isNewlyAdded = String(student.id) === String(newlyAddedId);
              const cleanEmail = extractCleanEmail(student.email);
              const rawDob = student.dateOfBirth || student.dob;

              return (
                <tr
                  key={student.id}
                  data-student-id={student.id}
                  className={`student-row transition-colors hover:bg-gold/15 group ${
                    isNewlyAdded ? 'bg-gold/20 font-medium' : index % 2 === 0 ? 'bg-white/80' : 'bg-surface-50/80'
                  }`}
                >
                  {/* ID chuẩn JSON Block 1 (std-...) */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-dark-500 group-hover:text-dark-900">
                    {student.id}
                  </td>

                  {/* Tên */}
                  <td className="py-3.5 px-4 font-semibold text-dark-900">
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      {isNewlyAdded && (
                        <span className="text-[10px] bg-dark-900 text-gold font-bold px-1.5 py-0.5 uppercase tracking-wide">
                          Mới
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-dark-600 font-mono text-xs">
                    {cleanEmail}
                  </td>

                  {/* Ngày sinh (hiển thị DD/MM/YYYY) */}
                  <td className="py-3.5 px-4 text-dark-800 font-mono text-xs">
                    {formatDateToDisplay(rawDob)}
                  </td>

                  {/* Lớp */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-bold bg-surface-200 text-dark-900 border border-dark-900/20">
                      {student.className}
                    </span>
                  </td>

                  {/* Chi tiết button */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onViewStudent(student)}
                      type="button"
                      aria-label={`Xem chi tiết sinh viên ${student.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-dark-900 bg-white hover:bg-gold border-2 border-dark-900 transition-colors shadow-sharp-sm active:translate-x-0.5 active:translate-y-0.5"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      <span>Xem</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
