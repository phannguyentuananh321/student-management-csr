# Hệ Thống Quản Lý Sinh Viên (Student Management CSR — Block 4)

Website quản lý sinh viên chuyên nghiệp được xây dựng theo mô hình **Client-Side Rendering (CSR)** thuần túy, kết nối trực tiếp với REST API Node.js/Express và lưu trữ dữ liệu bền vững bằng file JSON có cơ chế hàng đợi bất đồng bộ chống race condition.

---

## 1. Technical Stack (Công nghệ sử dụng)

### Frontend (Client)
- **Framework & Build Tool**: React 19, Vite 6.
- **Styling**: Tailwind CSS 3 (phong cách Melius Dashboard: góc sắc nét, tương phản cao, tối giản bo góc, màu chủ đạo vàng `#FFD700`).
- **Headless UI Primitives**: Material UI (MUI) `@mui/material` (chỉ dùng cho Modal/Dialog, Input primitives, không dùng icon của MUI).
- **Animation**: GSAP 3 (`gsap.context()` quản lý hiệu ứng bảng, modal, validation shake, toast, highlight hàng mới, tôn trọng `prefers-reduced-motion`).
- **3D Graphics**: Three.js (WebGL 3D background với các quả cầu vàng `#FFD700` và xanh lá nổi từ dưới lên, chiếu sáng đa nguồn, hiệu ứng chuột 3D parallax, vòng lặp vô tận).
- **Icons**: 100% Inline SVG thuần túy viết tay (không sử dụng Lucide, Font Awesome hay React Icons).
- **Testing**: Vitest, React Testing Library, JSDOM.

### Backend (Server)
- **Runtime**: Node.js (ES Modules).
- **Framework**: Express 4.
- **Giao tiếp**: REST API chuẩn hóa JSON (`GET /api/students`, `POST /api/students`), CORS middleware.
- **Lưu trữ**: File JSON bền vững (`server/data/students.json`) không dùng database.
- **Đồng bộ hóa & An toàn dữ liệu**: Hàng đợi Promise tuần tự (Serialized Queue Mutex) ngăn chặn hoàn toàn race condition và mất dữ liệu khi ghi đồng thời.
- **Testing**: Vitest, Supertest (kiểm thử tích hợp HTTP endpoint thực tế).

---

## 2. Architecture (Kiến trúc hệ thống)

### Mô hình Client-Side Rendering (CSR)
```
┌────────────────────────────────────────────────────────┐
│                   Trình duyệt (React Client)            │
│  - Render UI, quản lý State, điều khiển Form          │
│  - Lọc & Tìm kiếm tức thời trên bộ nhớ client-side     │
│  - Hiệu ứng GSAP & 3D Three.js                         │
└───────────────────────▲────────┬───────────────────────┘
     fetch() GET / POST │        │ JSON Response
                        │        ▼
┌────────────────────────────────────────────────────────┐
│                   Máy chủ API (Express Server)         │
│  - Kiểm định dữ liệu 2 lớp (Validation Client & Server)│
│  - Kiểm tra định dạng Gmail (@gmail.com) & trùng email │
│  - Tính tuổi chính xác theo ngày sinh nhật (>= 17 tuổi)│
│  - Sinh ID chuẩn: "std-" + timestamp                   │
└───────────────────────▲────────┬───────────────────────┘
                        │        │ Atomic / Serialized Write
                        │        ▼
┌────────────────────────────────────────────────────────┐
│              Lưu trữ file JSON bền vững                │
│              (server/data/students.json)               │
└────────────────────────────────────────────────────────┘
```

### Luồng lấy danh sách (GET /api/students)
1. Client khởi tạo `App.jsx`, gọi `getStudents()` qua `fetch` tới `GET /api/students`.
2. Express đọc an toàn file `server/data/students.json`.
3. Server trả về danh sách sinh viên dưới dạng JSON với status `200`.
4. React cập nhật state `students`, tự động trích xuất danh sách lớp học thực tế và render bảng dữ liệu không cần tải lại trang.

### Luồng thêm sinh viên (POST /api/students)
1. Người dùng nhập form trên Modal (Tên, Gmail, Ngày sinh, Lớp).
2. React kiểm tra validation phía client. Nếu sai, GSAP kích hoạt hiệu ứng rung (shake) báo lỗi inline ngay dưới từng ô nhập.
3. Nếu hợp lệ, React gửi `fetch` POST mang body JSON tới Express.
4. Server xác thực lại toàn bộ dữ liệu (chống bypass client):
   - Bắt buộc đủ 4 trường.
   - Định dạng Gmail phải kết thúc bằng `@gmail.com`.
   - Kiểm tra trùng Gmail không phân biệt chữ hoa/thường.
   - Tính tuổi thực tế theo ngày/tháng/năm sinh: bắt buộc $\ge 17$ tuổi và không ở tương lai.
5. Server đưa request vào hàng đợi tuần tự (`Promise queue`), tự động tạo ID tăng dần `std-${nextNumber}` (std-1, std-2, std-3...), lưu email định dạng `[email@gmail.com](mailto:email@gmail.com)` và ghi vào file JSON.
6. Server trả kết quả `201 Created` kèm sinh viên mới tạo.
7. React nhận dữ liệu mới, chèn vào cuối mảng state, đóng modal, reset form, bắn Toast thành công và chạy GSAP highlight hàng mới mà **không tải lại trang (Zero page reload)**.

---

## 3. Project Structure (Cấu trúc dự án)

```text
CODEBLOCK4/
├── .gitignore                      # Bỏ qua node_modules, build dist, log, file tạm
├── package.json                    # Script điều phối toàn bộ dự án (test, run)
├── README.md                       # Tài liệu hướng dẫn chi tiết
│
├── client/                         # Frontend React + Vite
│   ├── index.html                  # HTML Shell & Google Fonts Inter
│   ├── vite.config.js              # Cấu hình Vite, Proxy API port 5000, Vitest JSDOM
│   ├── tailwind.config.js          # Bảng màu Melius (#FFD700) và đổ bóng sắc nét
│   ├── postcss.config.js           # PostCSS Tailwind
│   ├── package.json                # Dependencies Frontend (React, MUI, GSAP, Three.js)
│   ├── .gitignore
│   ├── src/
│   │   ├── main.jsx                # Entry point React 19
│   │   ├── App.jsx                 # Dashboard chính, quản lý state và bộ lọc
│   │   ├── index.css               # Base styles Tailwind & tùy biến scrollbar
│   │   ├── components/
│   │   │   ├── Header.jsx          # Header nhận diện Block 4, thống kê sinh viên
│   │   │   ├── Toolbar.jsx         # Ô tìm kiếm, chọn lớp thực tế, nút Thêm sinh viên
│   │   │   ├── StudentTable.jsx    # Bảng sinh viên semantic, highlight sinh viên mới
│   │   │   ├── AddStudentModal.jsx # Modal controlled form, inline validation
│   │   │   ├── StudentDetailModal.jsx # Modal hồ sơ chi tiết, nút gửi mailto & Gmail
│   │   │   ├── BubbleBackground.jsx# Hiệu ứng 3D WebGL Three.js bong bóng vàng & xanh
│   │   │   ├── Toast.jsx           # Thông báo GSAP nổi góc phải
│   │   │   ├── EmptyState.jsx      # Trạng thái rỗng (khi chưa có dữ liệu / tìm kiếm 0 kết quả)
│   │   │   ├── StatusStates.jsx    # Loading Skeleton & Error State có nút Thử lại
│   │   │   └── Icons.jsx           # 100% Inline SVG Icons thuần
│   │   ├── services/
│   │   │   └── api.js              # Wrapper hàm fetch GET/POST tới Express API
│   │   ├── utils/
│   │   │   ├── dateUtils.js        # Chuyển đổi DD/MM/YYYY, tính tuổi theo ngày sinh
│   │   │   └── validation.js       # Client validation (Gmail regex, duplicate, age >= 17)
│   │   └── test/
│   │       └── setup.js            # Mock JSDOM (matchMedia, scrollIntoView)
│   └── tests/
│       ├── validationAndDate.test.js # Test logic ngày tháng, tính tuổi, kiểm tra Gmail
│       └── components.test.jsx       # Test render Table, Toolbar, Modal chi tiết
│
└── server/                         # Backend Node.js + Express
    ├── package.json                # Dependencies Backend (Express, CORS, Vitest, Supertest)
    ├── .gitignore
    ├── data/
    │   └── students.json           # Nguồn lưu trữ JSON bền vững của hệ thống
    ├── src/
    │   ├── app.js                  # Khởi tạo Express App, middleware CORS & JSON
    │   ├── server.js               # Lắng nghe cổng HTTP (Port 5000)
    │   ├── routes/
    │   │   └── students.js         # Định tuyến GET / và POST /
    │   ├── controllers/
    │   │   └── studentController.js# Xử lý Request/Response, ánh xạ mã lỗi HTTP
    │   ├── services/
    │   │   └── studentService.js   # Đọc/ghi file JSON có hàng đợi tuần tự (Mutex Queue)
    │   └── utils/
    │       └── validation.js       # Xác thực server (Bắt buộc Gmail, tuổi >= 17, ngày tương lai)
    └── tests/
        └── student.test.js         # Test API Supertest, kiểm tra đồng thời, trùng Gmail
```

---

## 4. Installation & Usage (Hướng dẫn cài đặt & Chạy ứng dụng)

Làm theo các bước dưới đây từ khi vừa tải mã nguồn về máy:

### Bước 1: Tải mã nguồn từ GitHub
Mở Terminal hoặc Command Prompt trên máy tính của bạn và clone dự án:
```bash
git clone <URL_REPO_CUA_BAN>
cd CODEBLOCK4
```

### Bước 2: Cài đặt thư viện (Dependencies)
Cài đặt các gói phụ thuộc cho cả thư mục `server` và `client`:

1. **Cài đặt cho Backend Server**:
   ```bash
   cd server
   npm install
   cd ..
   ```

2. **Cài đặt cho Frontend Client**:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Bước 3: Khởi động Backend Express API
Mở một cửa sổ Terminal thứ nhất tại thư mục gốc `CODEBLOCK4`:
```bash
npm run server
```
*hoặc:*
```bash
cd server
npm run dev
```
- Máy chủ backend sẽ lắng nghe tại: **`http://localhost:5000`**
- Endpoint dữ liệu: **`http://localhost:5000/api/students`**

### Bước 4: Khởi động Frontend React (Vite)
Mở một cửa sổ Terminal thứ hai tại thư mục gốc `CODEBLOCK4`:
```bash
npm run client
```
*hoặc:*
```bash
cd client
npm run dev
```
- Giao diện web sẽ được mở tại: **`http://localhost:3000`**
- Truy cập trình duyệt và sử dụng toàn bộ tính năng website!

---

## 5. Validation & Data Storage Specs (Quy chuẩn dữ liệu)

### Quy chuẩn dữ liệu JSON lưu trữ
Dữ liệu trong [`server/data/students.json`](file:///d:/Y2-Se2/Y3-SE1/WEB/BLOCK4/CODEBLOCK4/server/data/students.json) tuân thủ đúng cấu trúc chuẩn của Block 4:
```json
[
  {
    "id": "std-1",
    "name": "Nguyễn Văn An",
    "email": "[an.nguyen@gmail.com](mailto:an.nguyen@gmail.com)",
    "dateOfBirth": "2003-05-15",
    "className": "SE1"
  }
]
```
- **`id`**: Chuỗi ký tự có tiền tố `std-` tăng dần (ví dụ: `std-1`, `std-2`, `std-3`, ... `std-21`).
- **`email`**: Lưu định dạng Markdown link `[email](mailto:email)`. Khi xem chi tiết, hệ thống có nút bấm mở thẳng ứng dụng gửi email hoặc soạn thảo trên Gmail Web.
- **`dateOfBirth`**: Lưu dạng chuỗi `YYYY-MM-DD`, tự động format thành `DD/MM/YYYY` khi hiển thị trên giao diện người dùng.

### Quy tắc kiểm thực (Validation Rules)
Áp dụng đồng nhất tại cả Frontend (`client`) và Backend (`server`):

| Trường dữ liệu | Quy tắc kiểm tra | Thông báo lỗi |
| :--- | :--- | :--- |
| **Họ và tên** | Bắt buộc, không được để trống sau khi trim khoảng trắng. | *Tên sinh viên không được để trống.* |
| **Email** | Bắt buộc đúng định dạng **Gmail** (kết thúc bằng `@gmail.com`). | *Email phải đúng định dạng Gmail (kết thúc bằng @gmail.com).* |
| **Trùng Email** | Không được trùng với Gmail sinh viên đã có trong hệ thống (so sánh không phân biệt hoa/thường). | *Gmail này đã tồn tại trong hệ thống.* |
| **Ngày sinh** | Đúng định dạng ngày, không được ở tương lai. | *Ngày sinh không được ở tương lai.* |
| **Độ tuổi** | Phải **từ 17 tuổi trở lên** ($\ge 17$). Tính chính xác theo ngày, tháng, năm sinh thực tế so với thời điểm hiện tại. | *Sinh viên phải từ 17 tuổi trở lên.* |
| **Lớp học** | Bắt buộc nhập hoặc chọn lớp. | *Lớp không được để trống.* |

---

## 6. Testing (Kiểm thử hệ thống)

Dự án tích hợp đầy đủ bộ test tự động kiểm thử toàn diện từ unit test logic đến test tích hợp endpoint API.

### Chạy toàn bộ 21/21 Unit Tests
Tại thư mục gốc dự án:
```bash
npm test
```

### Chạy riêng từng bộ test:
- **Chạy bài test Backend**:
  ```bash
  npm run test:server
  ```
  *Bao gồm 9 bài test*: Xác thực tuổi $\ge 17$, phát hiện ngày tương lai, kiểm định định dạng Gmail, GET danh sách JSON, POST tạo sinh viên chuẩn `std-`, từ chối trùng Gmail (mã 409), kiểm tra an toàn khi nhiều request POST gửi đồng thời.

- **Chạy bài test Frontend**:
  ```bash
  npm run test:client
  ```
  *Bao gồm 12 bài test*: Chuyển đổi định dạng ngày `DD/MM/YYYY`, tính tuổi theo ngày sinh nhật, kiểm định form client, render danh sách sinh viên, sự kiện tìm kiếm và lọc lớp, hiển thị modal chi tiết kèm liên kết email.

---

## 7. Build cho môi trường sản xuất (Production Build)

Để biên dịch tối ưu mã nguồn Frontend phục vụ triển khai production:
```bash
npm run build:client
```
Thư mục xuất bản sau khi build: `client/dist/`.
