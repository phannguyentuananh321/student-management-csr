import { defaultStudentService } from '../services/studentService.js';
import { validateStudentData } from '../utils/validation.js';

export function createStudentController(studentService = defaultStudentService) {
  return {
    async getStudents(req, res) {
      try {
        const students = await studentService.getAllStudents();
        return res.status(200).json({
          success: true,
          data: students
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Không thể đọc dữ liệu sinh viên.'
        });
      }
    },

    async createStudent(req, res) {
      try {
        const { isValid, errors, sanitizedData } = validateStudentData(req.body);

        if (!isValid) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ.',
            errors
          });
        }

        const newStudent = await studentService.addStudent(sanitizedData);
        return res.status(201).json({
          success: true,
          message: 'Thêm sinh viên thành công.',
          data: newStudent
        });
      } catch (err) {
        if (err.statusCode === 409) {
          return res.status(409).json({
            success: false,
            message: err.message,
            errors: {
              email: err.message
            }
          });
        }

        return res.status(500).json({
          success: false,
          message: 'Đã xảy ra lỗi khi lưu thông tin sinh viên.'
        });
      }
    }
  };
}

export const defaultStudentController = createStudentController();
