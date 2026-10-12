const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Lấy danh sách toàn bộ sinh viên từ backend
 * @returns {Promise<Array>}
 */
export async function getStudents() {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  const data = await response.json().catch(() => {
    throw new Error('Không thể phân tích dữ liệu JSON từ máy chủ.');
  });

  if (!response.ok) {
    throw new Error(data.message || `Lỗi máy chủ (${response.status})`);
  }

  return data.data || [];
}

/**
 * Thêm sinh viên mới qua REST API POST
 * @param {object} studentData
 * @returns {Promise<object>} Sinh viên vừa được tạo
 */
export async function createStudent(studentData) {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(studentData)
  });

  const data = await response.json().catch(() => {
    throw new Error('Không thể phân tích dữ liệu JSON phản hồi từ máy chủ.');
  });

  if (!response.ok) {
    const error = new Error(data.message || 'Thêm sinh viên thất bại.');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data.data;
}
