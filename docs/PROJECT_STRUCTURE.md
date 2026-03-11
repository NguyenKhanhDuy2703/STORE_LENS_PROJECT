🏗️ Kiến Trúc Tổng Thể Dự Án Store Lens
Dự án được chia làm 3 phân hệ (Modules) hoạt động độc lập, giao tiếp với nhau qua API (HTTP/REST) và Message Broker (Redis). Kiến trúc này giúp hệ thống dễ dàng mở rộng (scale), bảo trì và triển khai linh hoạt theo hướng Microservices.

🤖 1. MODULE_AI — Hệ Thống Phân Tích AI & Computer Vision
Vai trò: Đọc luồng video (RTSP từ camera), sử dụng các mô hình AI (YOLO, DeepSORT) để nhận diện người, theo dõi quỹ đạo, và phân tích các chỉ số (Heatmap, Dwell time). Kết quả được đẩy lên Redis.
MODULE_AI/
├── config/                     # Cấu hình AI (không chứa mã nguồn)
│   ├── app_config.yaml         # Cài đặt FPS, độ phân giải, ngưỡng AI (Confidence, NMS)
│   ├── zone_config.json        # Định nghĩa tọa độ các vùng (ROI - Region of Interest)
│   └── logging.yaml            # Format và cấu hình lưu trữ Log
│
├── models/                     # Trọng số mô hình (Pre-trained weights)
│   ├── yolov8n_openvino/       # YOLOv8 (định dạng .xml, .bin tối ưu cho Intel Edge)
│   └── deepsort/               # Mô hình trích xuất đặc trưng Re-ID (VD: ckpt.t7)
│
├── src/                        # Mã nguồn AI chính (kiến trúc 4 lớp)
│   ├── core/                   # Lớp 1: Nhận thức (Perception — Detect & Track)
│   │   ├── detector.py         # Chạy YOLOv8 trên khung hình
│   │   └── tracker.py          # Gán ID duy nhất cho đối tượng (DeepSORT)
│   │
│   ├── managers/               # Lớp 2: Quản lý trạng thái (Memory)
│   │   ├── zone_manager.py     # Kiểm tra người dùng nằm trong Zone nào (Point-in-Polygon)
│   │   └── state_manager.py    # Lưu trữ thời gian, trạng thái của từng ID đang xuất hiện
│   │
│   ├── analytics/              # Lớp 3: Phân tích nghiệp vụ (Business Logic)
│   │   ├── trajectory.py       # Tính toán và làm mượt quỹ đạo di chuyển
│   │   ├── heatmap.py          # Cộng dồn ma trận mật độ để tạo Heatmap
│   │   └── event_processor.py  # Xử lý sự kiện (VD: khách đứng vùng A quá 30s → Event Dwell Time)
│   │
│   ├── communication/          # Lớp 4: Truyền tải dữ liệu (Output)
│   │   └── redis_publisher.py  # Đóng gói JSON và Publish dữ liệu lên Redis Stream/PubSub
│   │
│   └── utils/                  # Tiện ích dùng chung
│       ├── visualizer.py       # Vẽ Bounding Box, Tracking ID lên video để debug
│       └── geometry.py         # Tính toán toán học (IoU, khoảng cách Euclidean)
│
├── docker/
│   └── Dockerfile              # Môi trường chạy AI (OpenCV, OpenVINO, Python)
├── .env                        # Biến môi trường (RTSP Camera, Redis URL)
├── config.py                   # Class load cấu hình toàn cục
└── main.py                     # Entry Point: vòng lặp đọc Camera và chạy Pipeline AI

⚙️ 2. MODULE_BE — Hệ Thống Backend API (Node.js/Express)
Vai trò: Là cầu nối trung tâm. Lắng nghe dữ liệu từ Redis (do AI đẩy lên), lưu trữ vào Database (MongoDB), và cung cấp các RESTful APIs cho Frontend hiển thị biểu đồ, quản lý Camera, User, v.v.
Kiến trúc: Layered Architecture — Controller → Service → Model/Schema
MODULE_BE/
├── src/
│   ├── api/
│   │   └── index.js                    # Export/Import route tổng (tùy chọn)
│   │
│   ├── config/                         # Thiết lập kết nối các dịch vụ ngoài
│   │   ├── databaseMonogo.js           # Cấu hình kết nối MongoDB (Mongoose)
│   │   └── redis.js                    # Cấu hình kết nối Redis (Subscribe dữ liệu từ AI)
│   │
│   ├── controllers/                    # Xử lý Request/Response HTTP
│   │   └── auth.controller.js          # Xử lý logic Login, Register, Refresh Token
│   │
│   ├── middlewares/                    # Các màng lọc Request
│   │   ├── auth.middleware.js          # Xác thực JWT Token, phân quyền (Role)
│   │   └── morgan.middleware.js        # Ghi log các API request (Morgan)
│   │
│   ├── routes/                         # Định nghĩa các Endpoints (API URL)
│   │   ├── auth.routes.js              # Routes cho /api/auth/...
│   │   └── index.route.js              # Gắn kết tất cả các routes lại
│   │
│   ├── schemas/                        # Khai báo Model / Database Schema (Mongoose)
│   │   ├── user.schema.js              # Bảng người dùng (Admin, Manager)
│   │   ├── camera.schema.js            # Bảng quản lý thông tin luồng Camera
│   │   ├── zoneConfig.schema.js        # Bảng lưu tọa độ vẽ các vùng (ROI)
│   │   ├── heatmap.schema.js           # Bảng lưu trữ ma trận Heatmap theo thời gian
│   │   ├── trajectories.schema.js      # Bảng lưu quỹ đạo di chuyển
│   │   └── businessEvent.schema.js     # Bảng lưu các sự kiện phân tích (Dwell Time, In/Out)
│   │
│   ├── service/                        # Business Logic (tách biệt khỏi Controller)
│   │   └── auth.service.js             # Hàm xử lý cấp token, kiểm tra mật khẩu
│   │
│   └── utils/                          # Các hàm tiện ích dùng chung
│       ├── catchAsync.js               # Bọc Try/Catch tự động cho Async/Await
│       ├── exceptions.js               # Quản lý mã lỗi (Custom Error Classes)
│       ├── handleToken.js              # Logic gen/verify JWT Token
│       ├── hashpassword.js             # Logic băm mật khẩu (Bcrypt)
│       └── response.js                 # Chuẩn hóa format API: { status, data, message }
│
├── tests/
│   ├── setup.js                        # Setup môi trường test (Jest config)
│   └── units/                          # Test từng function cụ thể
│
├── src/app.js                          # Khởi tạo Express App, gắn Middlewares & Routes
├── src/server.js                       # Entry point: start server lắng nghe trên Port
├── docker-compose.yml                  # Triển khai đồng thời BE, DB, Redis
└── package.json                        # Danh sách thư viện Node.js

💻 3. MODULE_FE — Hệ Thống Frontend (React.js/Vite)
Vai trò: Giao diện tương tác cho người dùng cuối (chủ cửa hàng, quản lý). Hiển thị Dashboard trực quan, bản đồ Heatmap, quản lý danh sách Camera, cho phép vẽ Zone (ROI) trực tiếp trên trình duyệt.
Kiến trúc: Feature-based Structure kết hợp Redux Toolkit.
MODULE_FE/
├── src/
│   ├── assets/
│   │   └── logo.png                        # Hình ảnh, Icon, Fonts
│   │
│   ├── components/                         # Reusable UI Components
│   │   ├── common/                         # Dumb components (nguyên thủy)
│   │   │   ├── Loading.jsx                 # Spinner
│   │   │   ├── NotFound.jsx                # Trang 404
│   │   │   ├── EmptyState.jsx              # Hiển thị khi không có dữ liệu
│   │   │   └── ConfirmationModal.jsx       # Popup xác nhận (Xóa, Lưu)
│   │   ├── Header.jsx                      # Thanh Header trên cùng
│   │   ├── Navbar.jsx                      # Thanh điều hướng (Side-menu)
│   │   └── Footer.jsx                      # Chân trang
│   │
│   ├── features/                           # Smart components — nhóm theo tính năng
│   │   ├── Authentication/
│   │   │   └── authen.jsx                  # Đăng nhập / Đăng ký
│   │   ├── Dashboard/
│   │   │   └── Dashboard.jsx               # Màn hình tổng quan (biểu đồ, thông số tóm tắt)
│   │   ├── AnalyticsHeatmap/
│   │   │   └── AnalyticsHeatmapPage.jsx    # Xem/lọc bản đồ nhiệt
│   │   ├── AnalyticsDwellTime/
│   │   │   └── AnalyticsDwellTime.jsx      # Thống kê thời gian dừng chân
│   │   ├── CameraZoneConfig/
│   │   │   └── CameraZoneConfig.jsx        # Xem stream camera và vẽ Zone (Polygon)
│   │   ├── AssetManagement/
│   │   │   ├── ManagementProduct.jsx       # Quản lý Camera, thiết bị (CRUD)
│   │   │   ├── asset.slice.js              # Redux reducer quản lý state Asset
│   │   │   └── asset.thunk.js              # Redux thunk gọi API bất đồng bộ
│   │   └── UserManagement/
│   │       └── ManagerUsers.jsx            # Quản lý nhân viên / tài khoản
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx                  # Bố cục chính (Header + Sidebar + Nội dung động)
│   │
│   ├── redux/
│   │   └── store.js                        # Khởi tạo Redux Store, tích hợp các Slices
│   │
│   ├── routes/
│   │   └── index.jsx                       # Phân luồng URL (Public routes, Private routes)
│   │
│   ├── styles/
│   │   └── index.css                       # Global Styles (TailwindCSS init)
│   │
│   ├── App.jsx                             # Bọc ứng dụng với Providers (Redux, Router, Theme)
│   └── main.jsx                            # Entry point: mount React vào DOM (index.html)
│
├── index.html                              # File HTML gốc
├── eslint.config.js                        # Cấu hình Linting
├── vite.config.js                          # Cấu hình Vite (Bundler)
└── package.json                            # Thư viện Frontend (React, Redux, Axios, React-Router)

🚀 Luồng Dữ Liệu Tổng Thể (Data Flow)
Camera (RTSP)
    │
    ▼
MODULE_AI          ← Detect & Track (YOLO + DeepSORT), sinh Heatmap, Dwell Time
    │
    │  Publish JSON
    ▼
Redis
    │
    │  Subscribe
    ▼
MODULE_BE          ← Xử lý logic, lưu vào MongoDB theo Schema
    │
    │  REST API (JWT)
    ▼
MODULE_FE          ← Axios → Redux State → Render biểu đồ cho người dùng
BướcMô tả1Camera Stream đẩy RTSP vào MODULE_AI2MODULE_AI phát hiện khách hàng, tạo dữ liệu Heatmap3Dữ liệu được Publish dạng JSON lên Redis4MODULE_BE Subscribe Redis, xử lý và nạp vào MongoDB5Người dùng truy cập MODULE_FE, gửi request kèm JWT Token6MODULE_BE query MongoDB, trả về JSON qua REST API7MODULE_FE cập nhật Redux state và render biểu đồ