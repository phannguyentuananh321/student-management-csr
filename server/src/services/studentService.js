import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn mặc định tới file students.json
const DEFAULT_DATA_PATH = path.resolve(__dirname, '../../data/students.json');

/**
 * Trích xuất email thuần túy (loại bỏ markdown link nếu có)
 */
function normalizeEmail(emailStr) {
  if (!emailStr) return '';
  const match = String(emailStr).match(/([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase() : String(emailStr).trim().toLowerCase();
}

export class StudentService {
  constructor(dataPath = DEFAULT_DATA_PATH) {
    this.dataPath = dataPath;
    // Hàng đợi promise để tuần tự hóa các thao tác đọc/ghi file, ngăn chặn race conditions
    this.queue = Promise.resolve();
  }

  /**
   * Khởi tạo file nếu chưa tồn tại.
   * TUYỆT ĐỐI không ghi đè nếu file đã tồn tại hoặc có dữ liệu.
   */
  async ensureDataFile() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      await fs.writeFile(this.dataPath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  /**
   * Đọc danh sách sinh viên từ file JSON
   * @returns {Promise<Array>}
   */
  async getAllStudents() {
    await this.ensureDataFile();
    try {
      const content = await fs.readFile(this.dataPath, 'utf-8');
      if (!content || content.trim() === '') {
        return [];
      }
      const data = JSON.parse(content);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error('Dữ liệu trong file students.json không đúng định dạng JSON.');
      }
      throw err;
    }
  }

  /**
   * Thêm sinh viên mới một cách tuần tự (Atomic/Serialized write)
   * Định dạng ID: Theo chuẩn JSON Block 1 có sẵn ("std-" + timestamp)
   * Kiểm tra trùng Gmail: Không phân biệt hoa/thường
   * @param {{ name: string, email: string, dateOfBirth: string, className: string }} sanitizedData
   * @returns {Promise<object>} Sinh viên vừa được tạo
   */
  async addStudent(sanitizedData) {
    return new Promise((resolve, reject) => {
      this.queue = this.queue
        .then(async () => {
          const students = await this.getAllStudents();

          // Kiểm tra trùng Gmail (không phân biệt hoa/thường)
          const targetEmail = normalizeEmail(sanitizedData.email);
          const emailExists = students.some(
            (s) => s.email && normalizeEmail(s.email) === targetEmail
          );

          if (emailExists) {
            const error = new Error('Gmail này đã tồn tại trong hệ thống.');
            error.statusCode = 409;
            error.field = 'email';
            throw error;
          }

          // Tạo ID theo thứ tự tăng dần: std-1, std-2, std-3, std-4...
          const sequentialNumbers = students
            .map((s) => {
              const strId = String(s.id);
              const match = strId.match(/^std-(\d+)$/);
              if (match) {
                const num = parseInt(match[1], 10);
                return num < 1_000_000_000 ? num : 0;
              }
              const directNum = parseInt(strId, 10);
              return !isNaN(directNum) && directNum < 1_000_000_000 ? directNum : 0;
            })
            .filter((n) => n > 0);

          const maxId = sequentialNumbers.length > 0 ? Math.max(...sequentialNumbers) : 0;
          let nextNumber = maxId + 1;
          let newId = `std-${nextNumber}`;

          while (students.some((s) => String(s.id) === newId)) {
            nextNumber++;
            newId = `std-${nextNumber}`;
          }

          // Lưu email theo định dạng chuẩn JSON có sẵn: [email](mailto:email)
          const formattedEmail = `[${sanitizedData.email}](mailto:${sanitizedData.email})`;

          const newStudent = {
            id: newId,
            name: sanitizedData.name,
            email: formattedEmail,
            dateOfBirth: sanitizedData.dateOfBirth,
            className: sanitizedData.className
          };

          // Thêm vào cuối danh sách (sinh viên cũ ở trước, mới ở cuối)
          const updatedList = [...students, newStudent];

          // Ghi an toàn vào file JSON
          await fs.writeFile(this.dataPath, JSON.stringify(updatedList, null, 2), 'utf-8');

          resolve(newStudent);
        })
        .catch(reject);
    });
  }
}

// Singleton instance mặc định
export const defaultStudentService = new StudentService();
