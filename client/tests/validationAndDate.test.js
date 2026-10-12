import { describe, it, expect } from 'vitest';
import { formatDateToDisplay, calculateAge, isFutureDate } from '../src/utils/dateUtils.js';
import { validateStudentForm } from '../src/utils/validation.js';

describe('Frontend Date Utilities', () => {
  it('định dạng ngày YYYY-MM-DD sang DD/MM/YYYY chuẩn xác', () => {
    expect(formatDateToDisplay('2005-08-25')).toBe('25/08/2005');
    expect(formatDateToDisplay('2000-01-05')).toBe('05/01/2000');
    expect(formatDateToDisplay('')).toBe('');
  });

  it('tính số tuổi chính xác theo ngày sinh nhật', () => {
    const refDate = new Date(2026, 9, 12); // 12/10/2026

    // Vừa tròn 17 tuổi hôm nay
    expect(calculateAge('2009-10-12', refDate)).toBe(17);

    // Ngày mai mới đủ 17 tuổi
    expect(calculateAge('2009-10-13', refDate)).toBe(16);

    // Đã qua sinh nhật 17 tuổi hôm qua
    expect(calculateAge('2009-10-11', refDate)).toBe(17);
  });

  it('phát hiện ngày ở tương lai', () => {
    const refDate = new Date(2026, 9, 12);
    expect(isFutureDate('2026-10-13', refDate)).toBe(true);
    expect(isFutureDate('2026-10-12', refDate)).toBe(false);
    expect(isFutureDate('2000-01-01', refDate)).toBe(false);
  });
});

describe('Frontend Form Validation (Yêu cầu tuổi >= 17)', () => {
  const existingStudents = [
    { id: 'std-1', name: 'Nguyen Van A', email: '[vana@gmail.com](mailto:vana@gmail.com)', dateOfBirth: '2004-01-01', className: 'SE01' }
  ];

  it('báo lỗi khi để trống các trường bắt buộc', () => {
    const result = validateStudentForm({ name: '', email: '', dateOfBirth: '', className: '' }, existingStudents);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBe('Vui lòng nhập địa chỉ Gmail.');
    expect(result.errors.dateOfBirth).toBeDefined();
    expect(result.errors.className).toBeDefined();
  });

  it('từ chối email không đúng định dạng Gmail (@gmail.com)', () => {
    const result = validateStudentForm({
      name: 'Nguyen B',
      email: 'student@school.edu.vn',
      dateOfBirth: '2004-01-01',
      className: 'SE01'
    }, existingStudents);

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).');
  });

  it('từ chối Gmail đã tồn tại trong danh sách (không phân biệt hoa thường, kể cả dạng markdown mailto)', () => {
    const result = validateStudentForm({
      name: 'Nguyen B',
      email: 'VANA@GMAIL.COM',
      dateOfBirth: '2004-01-01',
      className: 'SE01'
    }, existingStudents);

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBe('Gmail này đã tồn tại trong danh sách sinh viên.');
  });

  it('từ chối sinh viên chưa đủ 17 tuổi', () => {
    const result = validateStudentForm({
      name: 'Nguyen C',
      email: 'vanc@gmail.com',
      dateOfBirth: '2015-05-20',
      className: 'SE01'
    }, existingStudents);

    expect(result.isValid).toBe(false);
    expect(result.errors.dateOfBirth).toContain('Sinh viên phải từ 17 tuổi trở lên');
  });

  it('chấp nhận sinh viên từ 17 tuổi trở lên và Gmail hợp lệ', () => {
    const result = validateStudentForm({
      name: 'Nguyen Thi Hop Le',
      email: 'hople@gmail.com',
      dateOfBirth: '2009-01-01',
      className: 'SE02'
    }, existingStudents);

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors).length).toBe(0);
  });
});
