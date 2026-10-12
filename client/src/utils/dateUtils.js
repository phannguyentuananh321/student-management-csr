/**
 * Chuyển đổi định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
 * Tách chuỗi trực tiếp để tránh lệch múi giờ UTC/Local
 * @param {string} dobString - Chuỗi dạng YYYY-MM-DD
 * @returns {string} Chuỗi hiển thị DD/MM/YYYY hoặc chuỗi gốc nếu không đúng định dạng
 */
export function formatDateToDisplay(dobString) {
  if (!dobString || typeof dobString !== 'string') return '';
  const parts = dobString.split('-');
  if (parts.length !== 3) return dobString;
  const [year, month, day] = parts;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Tính số tuổi chính xác dựa trên ngày, tháng, năm sinh thực tế
 * @param {string} dobString - Chuỗi YYYY-MM-DD
 * @param {Date} [referenceDate=new Date()]
 * @returns {number|null}
 */
export function calculateAge(dobString, referenceDate = new Date()) {
  if (!dobString || typeof dobString !== 'string') return null;

  const parts = dobString.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const dob = new Date(year, month, day);
  if (dob.getFullYear() !== year || dob.getMonth() !== month || dob.getDate() !== day) {
    return null;
  }

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  let age = refYear - year;
  const monthDiff = refMonth - month;

  if (monthDiff < 0 || (monthDiff === 0 && refDay < day)) {
    age--;
  }

  return age;
}

/**
 * Kiểm tra ngày có ở tương lai không
 * @param {string} dobString 
 * @param {Date} [referenceDate=new Date()]
 * @returns {boolean}
 */
export function isFutureDate(dobString, referenceDate = new Date()) {
  if (!dobString || typeof dobString !== 'string') return false;
  const parts = dobString.split('-');
  if (parts.length !== 3) return false;
  const dob = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return dob.getTime() > ref.getTime();
}
