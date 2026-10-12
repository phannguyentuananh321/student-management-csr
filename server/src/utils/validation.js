/**
 * Regex kiểm tra định dạng Gmail: bắt buộc có tiền tố hợp lệ và đuôi @gmail.com (không phân biệt hoa/thường)
 */
export const GMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;

/**
 * Tính số tuổi chính xác dựa trên ngày, tháng, năm sinh thực tế
 * Không chỉ lấy năm hiện tại trừ năm sinh
 * @param {string} dobString - Chuỗi ngày sinh dạng YYYY-MM-DD
 * @param {Date} [referenceDate=new Date()] - Ngày mốc so sánh (mặc định hôm nay)
 * @returns {number|null} Số tuổi hoặc null nếu ngày không hợp lệ
 */
export function calculateAge(dobString, referenceDate = new Date()) {
  if (!dobString || typeof dobString !== 'string') return null;

  // Kiểm tra định dạng YYYY-MM-DD
  const parts = dobString.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const dob = new Date(year, month, day);
  // Kiểm tra ngày thực sự hợp lệ (ví dụ tránh 31/02)
  if (dob.getFullYear() !== year || dob.getMonth() !== month || dob.getDate() !== day) {
    return null;
  }

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  let age = refYear - year;
  const monthDiff = refMonth - month;

  // Nếu chưa tới sinh nhật trong năm hiện tại thì giảm 1 tuổi
  if (monthDiff < 0 || (monthDiff === 0 && refDay < day)) {
    age--;
  }

  return age;
}

/**
 * Kiểm tra xem ngày sinh có nằm ở tương lai hay không
 * @param {string} dobString 
 * @param {Date} [referenceDate=new Date()]
 * @returns {boolean}
 */
export function isFutureDate(dobString, referenceDate = new Date()) {
  if (!dobString || typeof dobString !== 'string') return false;
  const parts = dobString.split('-');
  if (parts.length !== 3) return false;
  const dob = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  
  // So sánh mốc ngày thuần túy không phụ thuộc giờ phút
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return dob.getTime() > ref.getTime();
}

/**
 * Xác thực toàn bộ dữ liệu sinh viên
 * Bổ sung kiểm tra định dạng Gmail bắt buộc (@gmail.com)
 * @param {object} data
 * @returns {{ isValid: boolean, errors: Record<string, string>, sanitizedData: object }}
 */
export function validateStudentData(data) {
  const errors = {};
  
  const rawName = data?.name;
  const rawEmail = data?.email;
  // Hỗ trợ cả dateOfBirth và dob
  const rawDob = data?.dateOfBirth || data?.dob;
  const rawClassName = data?.className;

  // 1. Tên sinh viên
  if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
    errors.name = 'Tên sinh viên không được để trống.';
  }

  // 2. Gmail validation
  if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.trim().length === 0) {
    errors.email = 'Vui lòng nhập địa chỉ Gmail.';
  } else {
    // Làm sạch email nếu dán từ markdown [email](mailto:email)
    let cleanedEmail = rawEmail.trim();
    const mailtoMatch = cleanedEmail.match(/\[?([^\]\(\s]+@[^\]\(\s]+)\]?(?:\(mailto:[^\)]+\))?/);
    if (mailtoMatch) {
      cleanedEmail = mailtoMatch[1];
    }

    if (!GMAIL_REGEX.test(cleanedEmail)) {
      errors.email = 'Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).';
    }
  }

  // 3. Ngày sinh (dateOfBirth / dob) - Yêu cầu từ 17 tuổi trở lên (>= 17)
  if (!rawDob || typeof rawDob !== 'string' || rawDob.trim().length === 0) {
    errors.dateOfBirth = 'Ngày sinh không được để trống.';
  } else {
    const trimmedDob = rawDob.trim();
    if (isFutureDate(trimmedDob)) {
      errors.dateOfBirth = 'Ngày sinh không được ở tương lai.';
    } else {
      const age = calculateAge(trimmedDob);
      if (age === null) {
        errors.dateOfBirth = 'Ngày sinh không hợp lệ (định dạng YYYY-MM-DD).';
      } else if (age < 17) {
        errors.dateOfBirth = 'Sinh viên phải từ 17 tuổi trở lên.';
      }
    }
  }

  // 4. Lớp
  if (!rawClassName || typeof rawClassName !== 'string' || rawClassName.trim().length === 0) {
    errors.className = 'Lớp không được để trống.';
  }

  const isValid = Object.keys(errors).length === 0;
  
  let cleanedEmail = rawEmail ? rawEmail.trim().toLowerCase() : '';
  const mailtoMatch = cleanedEmail.match(/\[?([^\]\(\s]+@[^\]\(\s]+)\]?/);
  if (mailtoMatch) {
    cleanedEmail = mailtoMatch[1];
  }

  const sanitizedData = isValid ? {
    name: rawName.trim(),
    email: cleanedEmail,
    dateOfBirth: rawDob.trim(),
    className: rawClassName.trim()
  } : null;

  return { isValid, errors, sanitizedData };
}
