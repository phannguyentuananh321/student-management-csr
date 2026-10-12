import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StudentTable from '../src/components/StudentTable.jsx';
import Toolbar from '../src/components/Toolbar.jsx';
import StudentDetailModal from '../src/components/StudentDetailModal.jsx';

const mockStudents = [
  { id: 'std-1', name: 'Nguyen Van A', email: 'vana@school.edu.vn', dateOfBirth: '2004-05-15', className: 'SE01' },
  { id: 'std-2', name: 'Tran Thi B', email: 'thib@school.edu.vn', dateOfBirth: '2003-11-20', className: 'SE02' }
];

describe('StudentTable Component', () => {
  it('hiển thị đầy đủ danh sách sinh viên với ID chuẩn std- và ngày sinh DD/MM/YYYY', () => {
    const handleView = vi.fn();
    render(<StudentTable students={mockStudents} onViewStudent={handleView} newlyAddedId={null} />);

    expect(screen.getByText('std-1')).toBeInTheDocument();
    expect(screen.getByText('std-2')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('Tran Thi B')).toBeInTheDocument();
    // Kiểm tra định dạng DD/MM/YYYY
    expect(screen.getByText('15/05/2004')).toBeInTheDocument();
    expect(screen.getByText('20/11/2003')).toBeInTheDocument();
    // Kiểm tra mã lớp
    expect(screen.getByText('SE01')).toBeInTheDocument();
    expect(screen.getByText('SE02')).toBeInTheDocument();
  });

  it('gọi hàm onViewStudent khi nhấn nút Xem chi tiết', () => {
    const handleView = vi.fn();
    render(<StudentTable students={mockStudents} onViewStudent={handleView} newlyAddedId={null} />);

    const viewButtons = screen.getAllByRole('button', { name: /Xem chi tiết sinh viên/i });
    fireEvent.click(viewButtons[0]);
    expect(handleView).toHaveBeenCalledWith(mockStudents[0]);
  });
});

describe('Toolbar Component', () => {
  it('phản hồi sự kiện tìm kiếm và chọn lớp', () => {
    const onSearchChange = vi.fn();
    const onClassChange = vi.fn();

    render(
      <Toolbar
        searchTerm=""
        onSearchChange={onSearchChange}
        selectedClass=""
        onClassChange={onClassChange}
        availableClasses={['SE01', 'SE02']}
        onOpenAddModal={vi.fn()}
        onRefresh={vi.fn()}
        isLoading={false}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Tìm theo tên hoặc email/i);
    fireEvent.change(searchInput, { target: { value: 'Nguyen' } });
    expect(onSearchChange).toHaveBeenCalledWith('Nguyen');

    const classSelect = screen.getByRole('combobox');
    fireEvent.change(classSelect, { target: { value: 'SE01' } });
    expect(onClassChange).toHaveBeenCalledWith('SE01');
  });
});

describe('StudentDetailModal Component', () => {
  it('hiển thị đầy đủ chi tiết của sinh viên với ID std- và tính tuổi >= 17', () => {
    const handleClose = vi.fn();
    render(<StudentDetailModal student={mockStudents[0]} onClose={handleClose} />);

    expect(screen.getByText('Hồ Sơ Sinh Viên')).toBeInTheDocument();
    expect(screen.getByText('std-1')).toBeInTheDocument();
    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(screen.getByText('vana@school.edu.vn')).toBeInTheDocument();
    expect(screen.getByText('15/05/2004')).toBeInTheDocument();
    expect(screen.getByText(/Hợp lệ ≥ 17/i)).toBeInTheDocument();
  });
});
