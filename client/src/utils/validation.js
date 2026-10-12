import { calculateAge, isFutureDate } from './dateUtils.js';

/**
 * Regex kiểm tra định dạng Gmail: Bắt buộc đuôi @gmail.com
 */
export const GMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

/**
 * Trích xuất email thuần túy (loại bỏ markdown link [email](mailto:email) nếu có)
 */
export function extractCleanEmail(emailStr) {
  if (!emailStr) return '';
  const match = String(emailStr).match(/([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase() : String(emailStr).trim().toLowerCase();
}

/**
 * Kiểm tra dữ liệu form thêm sinh viên ở frontend
 * Yêu cầu độ tuổi: >= 17 (từ 17 tuổi trở lên)
 * Yêu cầu email: đúng định dạng Gmail (@gmail.com) và không trùng lặp
 * @param {object} formData
 * @param {Array} existingStudents
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateStudentForm(formData, existingStudents = []) {
  const errors = {};

  // 1. Tên
  const name = formData.name ? formData.name.trim() : '';
  if (!name) {
    errors.name = 'Vui lòng nhập họ và tên sinh viên.';
  }

  // 2. Gmail validation
  const rawEmail = formData.email ? formData.email.trim() : '';
  const email = extractCleanEmail(rawEmail);

  if (!rawEmail) {
    errors.email = 'Vui lòng nhập địa chỉ Gmail.';
  } else if (!GMAIL_REGEX.test(email)) {
    errors.email = 'Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).';
  } else {
    // Kiểm tra trùng lặp Gmail trên danh sách hiện tại của client
    const targetEmail = email.toLowerCase();
    const isDuplicate = existingStudents.some((s) => {
      const existingEmail = extractCleanEmail(s.email);
      return existingEmail === targetEmail;
    });

    if (isDuplicate) {
      errors.email = 'Gmail này đã tồn tại trong danh sách sinh viên.';
    }
  }

  // 3. Ngày sinh (hỗ trợ cả dateOfBirth và dob)
  const dob = (formData.dateOfBirth || formData.dob || '').trim();
  if (!dob) {
    errors.dateOfBirth = 'Vui lòng chọn ngày sinh.';
  } else if (isFutureDate(dob)) {
    errors.dateOfBirth = 'Ngày sinh không được ở tương lai.';
  } else {
    const age = calculateAge(dob);
    if (age === null) {
      errors.dateOfBirth = 'Ngày sinh không hợp lệ.';
    } else if (age < 17) {
      errors.dateOfBirth = `Sinh viên phải từ 17 tuổi trở lên (Hiện tại: ${age} tuổi).`;
    }
  }

  // 4. Lớp
  const className = formData.className ? formData.className.trim() : '';
  if (!className) {
    errors.className = 'Vui lòng nhập hoặc chọn mã lớp.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
