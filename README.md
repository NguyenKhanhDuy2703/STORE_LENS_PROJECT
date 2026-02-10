# 📊 StoreLens - Backend API

Backend cho dự án **StoreLens** – Hệ thống phân tích hành vi khách hàng bằng **Thị giác máy tính (Computer Vision)** và **AIoT**.  
Dự án sử dụng **Node.js + Express + Sequelize** để xây dựng RESTful API, kết nối CSDL (MySQL / SQL Server), đồng thời hỗ trợ upload media qua Cloudinary.

---

## 🚀 Công nghệ sử dụng

- **Runtime & Framework**
  - Node.js
  - Express.js
- **Database & ORM**
  - Sequelize ORM
  - MySQL2 / SQL Server (Tedious)
- **Authentication & Security**
  - JWT (jsonwebtoken)
  - bcryptjs (hash password)
  - cookie-parser
  - cors
- **File Upload**
  - multer
  - cloudinary
  - multer-storage-cloudinary
- **Dev Tools**
  - nodemon (reload khi code thay đổi)
  - sequelize-cli (migration, seeders)
  - morgan (log request)
  - dotenv (quản lý biến môi trường)

---

## 📁 Cấu trúc thư mục

```
BE/
├── node_modules/          # Dependencies
├── src/
│   ├── config/            # Cấu hình DB (config.json, env)
│   ├── controllers/       # Controller: xử lý request/response
│   ├── middlewares/       # Middleware: auth, validate, logger
│   ├── migrations/        # Sequelize migration (tạo/sửa bảng)
│   ├── models/            # Định nghĩa Model (User, Product…)
│   ├── routes/            # Định nghĩa API routes
│   ├── seeders/           # Data mẫu (Seeder)
│   ├── service/           # Business logic/service layer
│   ├── uploads/           # Upload file tạm thời
│   ├── utils/             # Helper, utils (format, validation…)
│   └── app.js             # Entry point của server
├── package.json
└── package-lock.json
```

---

## ⚙️ Cài đặt & Chạy dự án

1. **Clone repository**
   ```bash
   git clone <repository_url>
   cd BE
   ```

2. **Cài dependencies**
   ```bash
   npm install
   ```

3. **Tạo file `.env` trong thư mục gốc**
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=storelens
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=xxxx
   CLOUDINARY_API_KEY=xxxx
   CLOUDINARY_API_SECRET=xxxx
   ```

4. **Chạy migration & seed (nếu có)**
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

5. **Khởi chạy server**
   ```bash
   npm run start
   ```
   hoặc development mode:
   ```bash
   nodemon src/app.js
   ```

   Ứng dụng chạy tại: [http://localhost:3000](http://localhost:3000)

---

## 📌 Scripts trong `package.json`

- `npm run start` → Start server với **nodemon**  
- `npm test` → Placeholder test script  


## 📝 Quy tắc Commit Code

Để đảm bảo quy trình làm việc khoa học, minh bạch và dễ dàng theo dõi, tất cả các thành viên cần tuân thủ cấu trúc commit sau:

### 1. Mẫu Commit

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Các thành phần

- **type (Loại thay đổi):**
  - `feat`: Thêm tính năng mới  
  - `fix`: Sửa lỗi  
  - `docs`: Thay đổi tài liệu (README.md, …)  
  - `style`: Thay đổi định dạng code, không ảnh hưởng logic  
  - `refactor`: Tái cấu trúc code, không thêm tính năng/không sửa lỗi  
  - `test`: Thêm/sửa test cases  
  - `chore`: Thay đổi build, công cụ, dependencies  
  - `perf`: Cải thiện hiệu suất  

- **scope (Phạm vi):**  
  Mô tả phần của dự án bị ảnh hưởng, ví dụ: auth, dashboard, heatmap, api, frontend, backend.  
  Nếu thay đổi ảnh hưởng nhiều phạm vi, có thể để trống hoặc dùng `general`.  

- **subject (Tiêu đề):**  
  Mô tả ngắn gọn thay đổi, dùng thì hiện tại, ví dụ: “Thêm”, “Sửa”, “Tái cấu trúc”.  
  Không kết thúc bằng dấu chấm. Có thể liên kết ID của task Jira (ví dụ: FEAT-123).  

- **body (Nội dung - không bắt buộc):**  
  Giải thích chi tiết lý do thay đổi, tác động, giải quyết vấn đề gì.  
  Nên ngắn gọn ≤ 72 ký tự mỗi dòng.  

- **footer (Chân trang - không bắt buộc):**
  - Thay đổi gây hỏng: `BREAKING CHANGE: <mô tả>`  
  - Đóng issue: `Closes #<issue-id>` hoặc `Resolves #<issue-id>`  

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh. Hãy tạo **Issue** hoặc gửi **Pull Request** để cải tiến dự án.  

---

## 📄 Giấy phép

Dự án phát hành theo **MIT License**. Xem file [LICENSE](LICENSE) để biết chi tiết.
# StoreLens – Real-Time Retail Optimization Powered by Edge AI

StoreLens là giải pháp phân tích bán lẻ thông minh, kết hợp công nghệ AI tại biên (Edge AI) và phân tích dữ liệu tập trung để giải quyết các "điểm mù" trong cửa hàng vật lý. Hệ thống theo dõi hành trình khách hàng một cách ẩn danh, sau đó đối chiếu với dữ liệu bán hàng để cung cấp các chỉ số kinh doanh chuyên sâu.

---

## 📌 Tổng quan dự án

StoreLens chuyển đổi luồng video từ camera IP thành dữ liệu hành vi có giá trị như:
- **Bản đồ nhiệt (Heatmap)** – Xác định khu vực được quan tâm nhiều nhất
- **Thời gian dừng (Dwell time)** – Đo lường mức độ tương tác với sản phẩm
- **Tỷ lệ chuyển đổi (Conversion rate)** – So sánh lượt ghé thăm với giao dịch thực tế

Dự án được thiết kế với tiêu chí **Privacy by Design**, chỉ gửi metadata ẩn danh về máy chủ.

---

## 🏗 Kiến trúc hệ thống

Hệ thống được chia thành 3 module chính:

### **MODULE_AI (Edge Layer)**
Sử dụng YOLOv8 và DeepSORT để phát hiện và định danh người, tính toán tọa độ và gửi về Backend.

### **MODULE_BE (Backend Layer)**
Xây dựng trên nền tảng Node.js/Express, chịu trách nhiệm lưu trữ, xử lý logic nghiệp vụ và tóm tắt dữ liệu (Summarization).

### **MODULE_FE (Frontend Layer)**
Giao diện React hiển thị Dashboard, Heatmap và các báo cáo phân tích thời gian thực cho quản lý.

---

## 📁 Cấu trúc thư mục

```
StoreLens_Project/
├── MODULE_AI/                # Xử lý AI tại biên (Python)
│   ├── Models/               # Chứa các model YOLOv8 (.pt, .xml, .bin)
│   ├── src/                  # Mã nguồn xử lý tracking, heatmap, dwell time
│   └── run.py                # File khởi chạy luồng xử lý AI
│
├── MODULE_BE/                # Hệ thống Backend (Node.js)
│   ├── src/
│   │   ├── api/              # Kết nối với module AI
│   │   ├── controllers/      # Điều hướng logic nghiệp vụ
│   │   ├── routes/           # Định nghĩa các API endpoints
│   │   ├── schemas/          # Định nghĩa cấu trúc dữ liệu MongoDB (Mongoose)
│   │   ├── utils/            # Các tiện ích (Logging, Exceptions, Response)
│   │   └── workers/          # Xử lý các tác vụ nền (Importing, Syncing)
│   └── app.js                # Điểm khởi đầu của Server
│
└── MODULE_FE/                # Giao diện người dùng (React + Vite)
    ├── src/
    │   ├── features/         # Các module chức năng (Dashboard, Heatmap,...)
    │   ├── services/         # Gọi API từ Backend
    │   └── redux/            # Quản lý trạng thái ứng dụng
```

---

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js (v18 trở lên) & npm
- Python (3.10 trở lên)
- MongoDB & Redis

### 1. Cấu hình Backend (MODULE_BE)

```bash
cd MODULE_BE
npm install

# Tạo file .env dựa theo mẫu bên dưới
npm start
```

**Tạo file `MODULE_BE/.env`:**

```bash
# App Configuration
PORT=3000
NODE_ENV=development
APP_NAME=StoreLens_Backend

# Database Configuration (MongoDB)
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/storelens?retryWrites=true&w=majority

# Caching Configuration (Redis)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Security (JWT)
JWT_SECRET=your_super_secret_key_storelens_2024
JWT_EXPIRE=24h

# AI Module Integration
AI_API_PORT=8000
AI_API_URL=http://localhost:8000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 2. Cấu hình AI (MODULE_AI)

```bash
cd MODULE_AI
pip install -r requirements.txt

# Tạo file .env dựa theo mẫu bên dưới
python run.py
```

**Tạo file `MODULE_AI/.env`:**

```bash
# AI Service Configuration
AI_PORT=8000
HOST=0.0.0.0

# Backend Connection
BACKEND_URL=http://localhost:3000/api/v1/tracking/collect

# Redis for Edge Caching
REDIS_HOST=localhost
REDIS_PORT=6379

# Camera Stream (Nếu không cấu hình trong yaml)
RTSP_URL=rtsp://admin:password@192.168.1.100:554/live
```

> **Lưu ý:** Cấu hình RTSP camera trong `src/configs/tracking_config.yaml`

### 3. Cấu hình Frontend (MODULE_FE)

```bash
cd MODULE_FE
npm install

# Tạo file .env dựa theo mẫu bên dưới
npm run dev
```

**Tạo file `MODULE_FE/.env`:**

```bash
# API URL kết nối tới Backend Node.js
VITE_API_URL=http://localhost:3000/api/v1

# Timeout cho các request API (ms)
VITE_API_TIMEOUT=10000

# App Name
VITE_APP_NAME=StoreLens_Manager
```

---

## 🛠 Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| **AI** | PyTorch, OpenCV, YOLOv8, DeepSORT, OpenVINO |
| **Backend** | Node.js, Express, Winston (Logging), Morgan |
| **Database** | MongoDB (Dữ liệu chính), Redis (Caching) |
| **Frontend** | React, Redux Toolkit, Tailwind CSS, Vite |

---

## 🔐 Giải thích các biến môi trường quan trọng

### Backend (MODULE_BE)
- **`NODE_ENV`**: Quyết định mức độ log (debug/info) và việc hiển thị stack trace lỗi
- **`MONGO_URI`**: Đường dẫn kết nối MongoDB để lưu trữ Store, Camera, Zone và Invoices
- **`AI_API_URL`**: Cho phép Backend gửi lệnh điều khiển (cập nhật ROI) tới Module AI
- **`JWT_SECRET`**: Khóa bí mật để mã hóa token xác thực người dùng

### AI Module (MODULE_AI)
- **`BACKEND_URL`**: Endpoint để gửi metadata sau khi xử lý tracking
- **`RTSP_URL`**: Đường dẫn stream camera IP (nếu không dùng file YAML)

### Frontend (MODULE_FE)
- **`VITE_API_URL`**: URL Backend để Frontend gửi request lấy dữ liệu Heatmap, Dashboard, Báo cáo

---

## 📊 Tính năng chính

✅ Phát hiện và theo dõi khách hàng theo thời gian thực  
✅ Tạo bản đồ nhiệt (Heatmap) dựa trên hành vi di chuyển  
✅ Phân tích thời gian dừng chân tại từng khu vực  
✅ Tính toán tỷ lệ chuyển đổi từ lượt ghé thăm sang giao dịch  
✅ Dashboard trực quan với biểu đồ và báo cáo tùy chỉnh  
✅ Bảo mật thông tin khách hàng (Privacy by Design)  

---

## 📄 License

Dự án này được phát triển cho mục đích nghiên cứu và thương mại. Vui lòng liên hệ để biết thêm thông tin về giấy phép sử dụng.

---

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo Pull Request hoặc mở Issue để thảo luận về các tính năng mới.

---

**Được phát triển với ❤️ bởi StoreLens Team**