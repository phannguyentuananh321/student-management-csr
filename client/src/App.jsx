import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import StudentTable from './components/StudentTable';
import AddStudentModal from './components/AddStudentModal';
import StudentDetailModal from './components/StudentDetailModal';
import Toast from './components/Toast';
import EmptyState from './components/EmptyState';
import BubbleBackground from './components/BubbleBackground';
import { ErrorState, LoadingSkeleton } from './components/StatusStates';
import { extractCleanEmail } from './utils/validation';
import { getStudents, createStudent } from './services/api';

export default function App() {
  // State quản lý danh sách và trạng thái hệ thống
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // State bộ lọc và tìm kiếm client-side
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // State modals và notifications
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [toast, setToast] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);

  // 1. Tải danh sách sinh viên ban đầu từ API
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setFetchError(err.message || 'Không thể tải danh sách sinh viên.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // 2. Trích xuất danh sách lớp thực tế từ dữ liệu đang có trong state
  const availableClasses = useMemo(() => {
    const classSet = new Set();
    students.forEach((s) => {
      if (s.className && typeof s.className === 'string') {
        classSet.add(s.className.trim());
      }
    });
    return Array.from(classSet).sort();
  }, [students]);

  // 3. Lọc danh sách sinh viên dựa trên state hiện tại (không gọi API per-stroke)
  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const cleanEmail = extractCleanEmail(student.email);

      // Tìm kiếm theo tên hoặc email (không phân biệt hoa/thường)
      const matchesSearch =
        !term ||
        (student.name && student.name.toLowerCase().includes(term)) ||
        (cleanEmail && cleanEmail.includes(term));

      // Lọc theo lớp
      const matchesClass =
        !selectedClass ||
        (student.className && student.className.trim() === selectedClass);

      return matchesSearch && matchesClass;
    });
  }, [students, searchTerm, selectedClass]);

  // 4. Xử lý thêm sinh viên mới qua REST API
  const handleAddStudent = async (formData) => {
    const createdStudent = await createStudent(formData);
    
    // Cập nhật React state: Thêm vào cuối mảng, không reload trang
    setStudents((prev) => [...prev, createdStudent]);
    setNewlyAddedId(createdStudent.id);

    // Kích hoạt toast thông báo thành công
    setToast({
      type: 'success',
      message: `Đã thêm sinh viên "${createdStudent.name}" (ID: ${createdStudent.id}) thành công!`
    });

    // Reset ID highlight sau 3s
    setTimeout(() => {
      setNewlyAddedId(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-surface-50/70">
      {/* 3D Background bong bóng vàng và xanh lá nổi từ dưới lên loop vô tận */}
      <BubbleBackground />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Dashboard */}
      <Header
        totalStudents={students.length}
        totalClasses={availableClasses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 relative z-10">
        {/* Toolbar: Tìm kiếm, Lọc lớp, Thêm mới */}
        <Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          availableClasses={availableClasses}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onRefresh={loadStudents}
          isLoading={isLoading}
        />

        {/* Khu vực hiển thị bảng & các trạng thái */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : fetchError ? (
          <ErrorState message={fetchError} onRetry={loadStudents} />
        ) : students.length === 0 ? (
          <EmptyState
            isSearchEmpty={false}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            isSearchEmpty={true}
            onResetSearch={() => {
              setSearchTerm('');
              setSelectedClass('');
            }}
          />
        ) : (
          <StudentTable
            students={filteredStudents}
            newlyAddedId={newlyAddedId}
            onViewStudent={(student) => setViewingStudent(student)}
          />
        )}
      </main>

      {/* Footer Melius Style */}
      <footer className="border-t-2 border-dark-900 bg-white/90 backdrop-blur-sm py-4 px-4 sm:px-8 text-center text-xs text-dark-500 font-mono relative z-10">
        Student Management System — CSR Architecture (React + Express + JSON Storage)
      </footer>

      {/* Modal Thêm sinh viên */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStudent}
        existingStudents={students}
        availableClasses={availableClasses}
      />

      {/* Modal Xem chi tiết sinh viên */}
      <StudentDetailModal
        student={viewingStudent}
        onClose={() => setViewingStudent(null)}
      />
    </div>
  );
}
