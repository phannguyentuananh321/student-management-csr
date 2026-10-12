import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateAge, isFutureDate, validateStudentData } from '../src/utils/validation.js';
import { StudentService } from '../src/services/studentService.js';
import { createStudentController } from '../src/controllers/studentController.js';
import { createStudentRouter } from '../src/routes/students.js';
import { createApp } from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATA_PATH = path.resolve(__dirname, 'test-students.json');

describe('Validation Utilities & Gmail Validation', () => {
  it('tính tuổi chính xác theo ngày và tháng sinh thực tế', () => {
    const refDate = new Date(2026, 9, 12);
    expect(calculateAge('2009-10-12', refDate)).toBe(17);
    expect(calculateAge('2009-10-13', refDate)).toBe(16);
    expect(calculateAge('2009-10-11', refDate)).toBe(17);
    expect(calculateAge('2000-01-01', refDate)).toBe(26);
  });

  it('nhận diện ngày ở tương lai', () => {
    const refDate = new Date(2026, 9, 12);
    expect(isFutureDate('2026-10-13', refDate)).toBe(true);
    expect(isFutureDate('2026-10-12', refDate)).toBe(false);
  });

  it('bắt buộc định dạng Gmail (@gmail.com)', () => {
    // Email không phải @gmail.com
    const nonGmail = validateStudentData({
      name: 'Nguyen Van A',
      email: 'a@school.edu.vn',
      dateOfBirth: '2000-01-01',
      className: 'CNTT-K20'
    });
    expect(nonGmail.isValid).toBe(false);
    expect(nonGmail.errors.email).toBe('Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).');

    // Email rỗng
    const emptyEmail = validateStudentData({
      name: 'Nguyen Van A',
      email: '',
      dateOfBirth: '2000-01-01',
      className: 'CNTT-K20'
    });
    expect(emptyEmail.isValid).toBe(false);
    expect(emptyEmail.errors.email).toBe('Vui lòng nhập địa chỉ Gmail.');

    // Gmail hợp lệ
    const validGmail = validateStudentData({
      name: 'Nguyen Van A',
      email: 'student.test@gmail.com',
      dateOfBirth: '2005-01-01',
      className: 'CNTT-K20'
    });
    expect(validGmail.isValid).toBe(true);
    expect(validGmail.sanitizedData.email).toBe('student.test@gmail.com');
  });

  it('từ chối tuổi dưới 17', () => {
    const under17 = validateStudentData({
      name: 'Nguyen Van A',
      email: 'young@gmail.com',
      dateOfBirth: '2015-01-01',
      className: 'CNTT-K20'
    });
    expect(under17.isValid).toBe(false);
    expect(under17.errors.dateOfBirth).toBe('Sinh viên phải từ 17 tuổi trở lên.');
  });
});

describe('Student REST API & Duplicate Gmail Verification', () => {
  let studentService;
  let app;

  beforeEach(async () => {
    await fs.writeFile(TEST_DATA_PATH, JSON.stringify([
      { id: 'std-1', name: 'Sinh Vien Cu', email: 'cu@gmail.com', dateOfBirth: '2002-05-10', className: 'SE01' }
    ], null, 2), 'utf-8');

    studentService = new StudentService(TEST_DATA_PATH);
    const controller = createStudentController(studentService);
    const router = createStudentRouter(controller);
    app = createApp(router);
  });

  afterEach(async () => {
    try {
      await fs.unlink(TEST_DATA_PATH);
    } catch {}
  });

  it('GET /api/students trả danh sách sinh viên dưới dạng JSON', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].id).toBe('std-1');
  });

  it('POST /api/students thêm sinh viên hợp lệ với Gmail và tạo ID theo thứ tự tăng dần (std-2, std-3...)', async () => {
    const newStudent = {
      name: 'Tran Thi B',
      email: 'b.tran@gmail.com',
      dateOfBirth: '2005-03-15',
      className: 'SE02'
    };

    const res = await request(app).post('/api/students').send(newStudent);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Danh sách ban đầu có std-1, sinh viên tiếp theo bắt buộc là std-2
    expect(res.body.data.id).toBe('std-2');
    expect(res.body.data.email).toBe('[b.tran@gmail.com](mailto:b.tran@gmail.com)');

    const fileContent = JSON.parse(await fs.readFile(TEST_DATA_PATH, 'utf-8'));
    expect(fileContent.length).toBe(2);
    expect(fileContent[1].id).toBe('std-2');
    expect(fileContent[1].email).toBe('[b.tran@gmail.com](mailto:b.tran@gmail.com)');
  });

  it('POST /api/students từ chối email không phải đuôi @gmail.com', async () => {
    const invalidEmailStudent = {
      name: 'Khong Phai Gmail',
      email: 'user@yahoo.com',
      dateOfBirth: '2005-01-01',
      className: 'SE01'
    };

    const res = await request(app).post('/api/students').send(invalidEmailStudent);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.email).toBe('Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).');
  });

  it('POST /api/students từ chối trùng Gmail (không phân biệt hoa thường)', async () => {
    const duplicateStudent = {
      name: 'Nguyen Van Trung',
      email: 'CU@GMAIL.COM', // trùng với cu@gmail.com
      dateOfBirth: '2003-01-01',
      className: 'SE01'
    };

    const res = await request(app).post('/api/students').send(duplicateStudent);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.email).toBe('Gmail này đã tồn tại trong hệ thống.');
  });

  it('Xử lý đồng thời hai request gửi cùng một Gmail: chỉ 1 thành công (201), 1 bị từ chối trùng Gmail (409)', async () => {
    const payload = {
      name: 'Duplicate Student',
      email: 'same.person@gmail.com',
      dateOfBirth: '2005-01-01',
      className: 'SE01'
    };

    const [res1, res2] = await Promise.all([
      request(app).post('/api/students').send(payload),
      request(app).post('/api/students').send(payload)
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]);
  });
});
