# 📊 OVERVIEW SOURCE CODE — Hệ Thống Phân Tích AI Cửa Hàng Bán Lẻ

> **Dự Án:** Store Lens / SpaceLens  
> **Kiến Trúc:** Microservices (3 Modules độc lập)  
> **Ngôn Ngữ:** Python (AI) + Node.js (Backend) + React (Frontend)  
> **Database:** MongoDB (NoSQL) + Redis (Message Broker)

---

## 📑 Mục Lục

1. [Tổng Quan Kiến Trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng Dữ Liệu Toàn Hệ Thống](#2-luồng-dữ-liệu-toàn-hệ-thống)
3. [MODULE_AI — Hệ Thống AI & Computer Vision](#3-module_ai--hệ-thống-ai--computer-vision)
4. [MODULE_BE — Hệ Thống Backend API](#4-module_be--hệ-thống-backend-api)
5. [MODULE_FE — Hệ Thống Frontend React](#5-module_fe--hệ-thống-frontend-react)
6. [Chi Tiết Các File Quan Trọng](#6-chi-tiết-các-file-quan-trọng)
7. [Cách Các Phần Tương Tác](#7-cách-các-phần-tương-tác)

---

## 1. Tổng Quan Kiến Trúc

Dự án sử dụng mô hình **Microservices** với 3 phân hệ độc lập:

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              (React + Redux + Socket.io)                    │
│           Hiển thị Dashboard, Chart, Heatmap                │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP Request/Response
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Node.js)                        │
│    ├─ Express API (REST)                                    │
│    ├─ MongoDB (Database)                                    │
│    ├─ Redis (Message Broker)                                │
│    └─ Socket.io (Real-time Communication)                   │
└──────┬──────────────────────────────────────────────────────┘
       │ Redis Pub/Sub
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                      AI MODULE (Python)                      │
│    ├─ YOLO v8 (Object Detection)                            │
│    ├─ DeepSORT (Object Tracking)                            │
│    ├─ Heatmap Analysis                                      │
│    └─ Zone Analysis (Dwell Time)                            │
└──────────────────────────────────────────────────────────────┘
```

### 🎯 Vai Trò Của Mỗi Module:

| Module       | Vai Trò                                                | Input                | Output                  |
| ------------ | ------------------------------------------------------ | -------------------- | ----------------------- |
| **AI**       | Xử lý video RTSP, nhận diện người, theo dõi, phân tích | Camera RTSP Stream   | Redis (JSON)            |
| **Backend**  | Cầu nối trung tâm, lưu dữ liệu, cung cấp API           | Redis + HTTP Request | MongoDB + HTTP Response |
| **Frontend** | Giao diện người dùng, hiển thị dữ liệu, thống kê       | HTTP/Socket.io       | Dashboard Visual        |

---

## 2. Luồng Dữ Liệu Toàn Hệ Thống

### 📡 Luồng Real-time (Real-time Channel)

```
AI Module (Stream Processing)
  ↓ (Dwell Time Real-time)
Redis Channel: "dwell_time_realtime_channel"
  ↓
Backend Worker (realtime listener)
  ↓ (via Socket.io)
Frontend (Real-time Dashboard Update)
  └→ Hiển thị ngay lập tức trên dashboard
```

### 💾 Luồng Pack Processing (Batch Processing)

```
AI Module (định kỳ)
  ↓ (Heatmap, Dwell Time, Zone Analysis)
Redis Channels:
  ├─ heatmap_channel
  ├─ dwell_time_channel
  └─ zone_analysis_event_channel
  ↓
Backend Workers:
  ├─ heatmapWorker.save()
  ├─ sessionWorker.save()
  └─ ruleCustomerWorker.checkZoneRules()
  ↓
MongoDB Collections:
  ├─ Heatmap
  ├─ Sessions
  ├─ BusinessEvents
  └─ Notifications
  ↓
Frontend (HTTP Request)
  ├─ GET /api/analytics/heatmap
  ├─ GET /api/analytics/dwell-time
  └─ GET /api/notifications
  ↓
Dashboard (Biểu đồ, Thống kê)
```

### 🔄 Vòng Lặp Hoàn Chỉnh:

1. **AI Module nhận video từ Camera** (RTSP)
2. **YOLO phát hiện người** (Bounding box)
3. **DeepSORT gán ID duy nhất** (Tracking)
4. **Tính toán**:
   - Heatmap (Mật độ người)
   - Dwell Time (Thời gian đứng)
   - Zone Analysis (Người trong vùng nào)
5. **Đẩy dữ liệu lên Redis** (JSON format)
6. **Backend listen Redis** → Lưu vào MongoDB
7. **Frontend fetch API** → Hiển thị Dashboard
8. **Real-time Socket.io** → Update trực tiếp trên UI

---

## 3. MODULE_AI — Hệ Thống AI & Computer Vision

### 📂 Cấu Trúc Thư Mục

```
MODULE_AI/
├── app/
│   ├── main.py                 # ⭐ Entry point — Vòng lặp xử lý video
│   ├── config.py               # Cấu hình toàn cục (Redis, YOLO, DeepSORT)
│   │
│   ├── core/                   # Lớp 1: Nhận thức (Perception)
│   │   ├── yolov8_model.py     # Load YOLO, predict bounding box
│   │   ├── deepsort_model.py   # Load DeepSORT, gán ID tracking
│   │   ├── object_tracking.py  # Combo YOLO + DeepSORT
│   │   ├── re_id.py            # Re-identification (nhận diện lại người)
│   │   └── redis.py            # Kết nối Redis
│   │
│   ├── filters/
│   │   └── preprocessing_image.py  # Xử lý tiền xử lý ảnh
│   │
│   ├── processing/             # Lớp 2-3: Xử lý & Phân tích
│   │   └── stream_processing.py    # ⭐ Xử lý stream chính
│   │                               # - Preprocess frame
│   │                               # - Detect & Track
│   │                               # - Tính heatmap
│   │                               # - Phân tích zone
│   │                               # - Đẩy Redis
│   │
│   ├── analytics/              # Lớp 3: Phân tích nghiệp vụ
│   │   ├── heatmap_analysis.py     # Tính toán ma trận heatmap
│   │   ├── dwelltime_analysis.py   # Tính thời gian đứng lâu
│   │   └── zone_analysis.py        # Xác định người ở zone nào
│   │
│   ├── communication/          # Lớp 4: Truyền tải dữ liệu
│   │   ├── redis_publish.py        # Đẩy dữ liệu lên Redis
│   │   └── pack_communication.py   # Đóng gói dữ liệu
│   │
│   ├── utils/
│   │   ├── logging.py              # Cấu hình logging
│   │   ├── exception_handle.py     # Xử lý exception
│   │   ├── heatmap_visualizer.py   # Vẽ heatmap lên video
│   │   └── geometry.py             # Tính toán hình học
│   │
│   └── api/
│       └── v1/
│           └── tracking_router.py  # Routes API endpoints
│
├── configs/                    # Cấu hình các mô hình AI
│   ├── yolov8.config.yaml      # Tham số YOLO (model path, threshold)
│   ├── deepsort.config.yaml    # Tham số DeepSORT (feature extractor)
│   └── redis.config.yaml       # Cấu hình Redis
│
├── models/                     # Trọng số mô hình (Pre-trained)
│   └── yolov8m.pt              # Mô hình YOLO chính
│
├── weights/                    # Các mô hình đã tối ưu
│   └── yolov8m_openvino_model/ # YOLO tối ưu cho inference
│
├── storage/
│   └── videos/                 # Lưu video test
│
├── Dockerfile                  # Docker container cho AI
├── docker-compose.yml          # Cấu hình chạy cùng Redis
├── requirements.txt            # Python dependencies
└── run.py                      # Script chạy ứng dụng
```

### 🧠 Cách Hoạt Động Chi Tiết:

#### **Bước 1: Khởi Động (main.py)**

```python
1. Load config từ config.py
2. Khởi tạo ObjectTracking (YOLO + DeepSORT)
3. Khởi tạo StreamProcessor (xử lý chính)
4. Vòng lặp (while True):
   a. Đọc frame từ video
   b. Gọi process_frame()
   c. Nhận kết quả tracking
   d. Gọi phân tích (heatmap, dwell time, zone)
   e. Đẩy Redis
```

#### **Bước 2: Detect & Track (core/)**

```
Frame đầu vào
  ↓
YOLOv8 (Predict)
  ↓ Bounding box: [x1, y1, x2, y2, confidence, class]
  ↓
DeepSORT (Tracker)
  ↓ Track ID: {ID: 1, bbox, features}
  ↓
ObjectTracking.process_single_frame()
  ↓ Output: [(track_id, bbox, confidence), ...]
```

#### **Bước 3: Phân Tích (analytics/)**

**a) Heatmap Analysis:**

- Chia frame thành lưới (grid_size = 40 pixels)
- Mỗi khi nhận diện được người → cộng +0.5 vào cell tương ứng
- Apply decay factor (0.99998) để làm mờ dần
- Output: Ma trận heatmap [rows][cols]

**b) Dwell Time Analysis:**

- Theo dõi mỗi track ID
- Ghi nhận thời gian xuất hiện / mất tích
- Tính thời gian đứng = thời gian xuất hiện - thời gian vắng
- Output: {track_id, dwell_time, position}

**c) Zone Analysis:**

- Kiểm tra bbox có nằm trong bất kỳ zone nào không (Point-in-Polygon)
- Ghi nhận event: "enter_zone", "in_zone", "exit_zone"
- Output: {track_id, zone_id, event_type}

#### **Bước 4: Truyền Tải (communication/)**

```python
RedisPublisher.publish(channel, json_payload)
  ↓ Channels:
  ├─ "heatmap_channel" (batch)
  ├─ "dwell_time_channel" (batch)
  ├─ "dwell_time_realtime_channel" (real-time)
  └─ "zone_analysis_channel" (real-time)
```

### 🔧 Các File Chính & Ý Nghĩa:

| File                      | Ý Nghĩa                                          |
| ------------------------- | ------------------------------------------------ |
| **main.py**               | Vòng lặp chính, khởi động hệ thống               |
| **object_tracking.py**    | Combo YOLO + DeepSORT, trả về track_id           |
| **stream_processing.py**  | Xử lý frame, tính toán heatmap, zone, dwell time |
| **heatmap_analysis.py**   | Ma trận heatmap với decay factor                 |
| **dwelltime_analysis.py** | Tính thời gian đứng lâu của người                |
| **zone_analysis.py**      | Xác định người nằm trong zone nào                |
| **redis_publish.py**      | Kết nối Redis, push dữ liệu                      |

---

## 4. MODULE_BE — Hệ Thống Backend API

### 📂 Cấu Trúc Thư Mục

```
MODULE_BE/
├── src/
│   ├── server.js               # ⭐ Entry point — Khởi động Express
│   ├── app.js                  # Cấu hình Express (middleware, routes)
│   ├── worker.js               # ⭐ Redis consumer (listen Redis channels)
│   ├── config.js               # Cấu hình toàn cục
│   │
│   ├── config/                 # Kết nối các services
│   │   ├── databaseMonogo.js   # MongoDB connection (Mongoose)
│   │   └── redis.js            # Redis connection
│   │
│   ├── controllers/            # Xử lý HTTP request/response
│   │   ├── auth.controller.js      # Login, Register, Logout
│   │   ├── camera.controller.js    # Quản lý camera
│   │   ├── areaManagement.controller.js  # Quản lý khu vực
│   │   ├── asyncData.controller.js      # Upload dữ liệu không đồng bộ
│   │   ├── businessEvent.controller.js  # Quản lý sự kiện
│   │   └── ... (các controller khác)
│   │
│   ├── routes/                 # Định nghĩa API endpoints
│   │   ├── index.route.js          # Gắn kết tất cả routes
│   │   ├── auth.routes.js          # /api/auth/login, /api/auth/register
│   │   ├── camera.routes.js        # /api/cameras
│   │   └── ... (routes khác)
│   │
│   ├── schemas/                # MongoDB schemas (Models)
│   │   ├── user.schema.js          # Người dùng (Admin, Manager)
│   │   ├── camera.schema.js        # Thông tin camera
│   │   ├── zoneConfig.schema.js    # Cấu hình vùng (ROI)
│   │   ├── heatmap.schema.js       # Dữ liệu heatmap
│   │   ├── session.schema.js       # Session người dùng
│   │   ├── businessEvent.schema.js # Sự kiện kinh doanh
│   │   └── notification.schema.js  # Thông báo
│   │
│   ├── workers/                # Background workers (xử lý dữ liệu từ AI)
│   │   ├── heatmap.worker.js       # Lưu heatmap vào DB
│   │   ├── session.worker.js       # Lưu session (dwell time)
│   │   ├── ruleCustomer.worker.js  # Kiểm tra rule (dwell time > threshold)
│   │   └── cameraHealth.worker.js  # Kiểm tra sức khỏe camera (định kỳ)
│   │
│   ├── middlewares/            # Các middleware
│   │   ├── auth.middleware.js      # Xác thực JWT
│   │   └── morgan.middleware.js    # Logging HTTP request
│   │
│   ├── service/                # Business logic (tách khỏi controller)
│   │   └── auth.service.js         # Xử lý token, mật khẩu, session
│   │
│   ├── utils/                  # Utility functions
│   │   ├── response.js             # Chuẩn hóa API response format
│   │   ├── exceptions.js           # Custom error classes
│   │   ├── handleToken.js          # Gen/verify JWT
│   │   ├── hashpassword.js         # Bcrypt password
│   │   ├── catchAsync.js           # Try-catch wrapper
│   │   ├── logging.js              # Winston logger
│   │   └── scheduler.js            # Job scheduler (Bull/node-schedule)
│   │
│   └── api/
│       └── cameraAI.api.js     # Giao tiếp với AI module qua HTTP
│
├── tests/                      # Test files
│   ├── setup.js                # Jest config
│   └── integration/            # Integration tests
│
├── package.json                # Dependencies
├── jest.config.js              # Jest test config
├── Dockerfile                  # Docker container
└── docker-compose.yml          # Compose file
```

### 🔄 Cách Hoạt Động Chi Tiết:

#### **Bước 1: Khởi Động (server.js)**

```javascript
1. Load config
2. Khởi tạo Express app
3. Kết nối MongoDB (Mongoose)
4. Kết nối Redis (2 connections)
   - packClient: listen channels batch
   - rtClient: listen channels real-time
5. Khởi tạo Socket.io
6. Bắt đầu workers (heatmap, session, rule customer)
7. Start server trên port (mặc định: 3000)
```

#### **Bước 2: Xử Lý Redis (worker.js)**

**Pack Consumer (Batch):**

```
blPop(['heatmap_channel', 'dwell_time_channel', ...]) ← Blocking pop
  ↓
packprocessor():
  ├─ heatmap_channel → heatmapWorker.save() → MongoDB
  ├─ dwell_time_channel → sessionWorker.save() → MongoDB
  └─ zone_analysis_event_channel → sessionWorker.updateZoneSequence()
```

**Real-time Listener:**

```
subscribe(['dwell_time_realtime_channel', 'zone_analysis_channel'])
  ↓
Emit via Socket.io:
  ├─ io.to(locationId).emit('dwell_time', data)
  └─ io.to(locationId).emit('zone_update', data)
  ↓
Frontend nhận ngay lập tức
```

#### **Bước 3: API Endpoints (routes/)**

| Endpoint                    | Method | Mô Tả                        |
| --------------------------- | ------ | ---------------------------- |
| `/api/auth/login`           | POST   | Đăng nhập (trả JWT)          |
| `/api/auth/register`        | POST   | Đăng ký tài khoản            |
| `/api/cameras`              | GET    | Danh sách camera             |
| `/api/cameras/:id`          | POST   | Thêm/cập nhật camera         |
| `/api/zones/:locationId`    | GET    | Danh sách zone               |
| `/api/analytics/heatmap`    | GET    | Lấy dữ liệu heatmap          |
| `/api/analytics/dwell-time` | GET    | Thống kê dwell time          |
| `/api/notifications`        | GET    | Thông báo (alert dwell time) |
| `/api/events`               | GET    | Sự kiện kinh doanh           |

#### **Bước 4: Database (schemas/)**

Các MongoDB collections chính:

- **Users**: Tài khoản người dùng
- **Cameras**: Thông tin camera RTSP
- **Zones**: Cấu hình vùng phân tích (ROI)
- **Sessions**: Tracking session của mỗi người
- **Heatmap**: Ma trận heatmap theo thời gian
- **BusinessEvents**: Sự kiện dwell time, in/out zone
- **Notifications**: Alert khi có sự kiện
- **Locations**: Chi nhánh/cửa hàng

#### **Bước 5: Socket.io Real-time**

```javascript
io.on("connection", (socket) => {
  socket.on("join_location", (locationId) => {
    socket.join(locationId); // Join room theo location
  });
});

// Backend emit:
io.to(locationId).emit("dwell_time_update", {
  track_id: 1,
  dwell_time: 45,
  position: { x: 100, y: 200 },
});
```

### 🔧 Các File Chính & Ý Nghĩa:

| File                       | Ý Nghĩa                              |
| -------------------------- | ------------------------------------ |
| **server.js**              | Entry point, khởi động tất cả        |
| **app.js**                 | Cấu hình Express middleware          |
| **worker.js**              | Lắng nghe Redis, xử lý dữ liệu từ AI |
| **heatmap.worker.js**      | Lưu heatmap vào MongoDB              |
| **session.worker.js**      | Lưu dwell time vào MongoDB           |
| **ruleCustomer.worker.js** | Kiểm tra rule (threshold), tạo alert |
| **auth.middleware.js**     | Xác thực JWT token                   |

---

## 5. MODULE_FE — Hệ Thống Frontend React

### 📂 Cấu Trúc Thư Mục

```
MODULE_FE/
├── src/
│   ├── main.jsx                # Entry point ReactDOM
│   ├── App.jsx                 # Root component (Router + Redux)
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── HeatmapDisplay/    # Hiển thị heatmap
│   │   ├── ZoneConfig/        # Cấu hình zone trên video
│   │   ├── DwellTimeChart/    # Biểu đồ dwell time
│   │   └── ... (components khác)
│   │
│   ├── pages/                  # Page components (route pages)
│   │   ├── LoginPage.jsx       # Trang đăng nhập
│   │   ├── DashboardPage.jsx   # Dashboard chính
│   │   ├── AnalyticsPage.jsx   # Trang phân tích
│   │   ├── CameraPage.jsx      # Quản lý camera
│   │   └── ... (pages khác)
│   │
│   ├── routes/                 # React Router setup
│   │   └── index.jsx           # Định nghĩa routes
│   │
│   ├── features/               # Redux feature modules
│   │   ├── Authentication/
│   │   │   ├── auth.reducer.js
│   │   │   ├── auth.thunk.js
│   │   │   └── auth.selectors.js
│   │   ├── Analytics/
│   │   │   ├── analytics.reducer.js
│   │   │   └── analytics.thunk.js
│   │   └── ... (features khác)
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useSocket.js        # Hook để connect Socket.io
│   │   └── ... (hooks khác)
│   │
│   ├── services/               # API services (Axios)
│   │   ├── api.js              # Axios instance
│   │   ├── authService.js      # API auth
│   │   ├── analyticsService.js # API analytics
│   │   ├── cameraService.js    # API camera
│   │   └── ... (services khác)
│   │
│   ├── redux/
│   │   └── store.js            # Redux store setup
│   │
│   ├── styles/                 # Global styles
│   │   └── index.css
│   │
│   ├── constants/              # Hằng số
│   │   └── api.constants.js
│   │
│   ├── utils/                  # Utility functions
│   │   └── ... (utility files)
│   │
│   └── layout/                 # Layout components
│       ├── MainLayout.jsx      # Main layout với Sidebar
│       └── AuthLayout.jsx      # Layout cho auth pages
│
├── docs/
│   ├── PROJECT_STRUCTURE.md
│   ├── DATA_SCHEMA_MAPPING.md
│   └── UI_STYLE_GUIDE.md
│
├── public/                     # Static assets
├── index.html                  # Main HTML
├── vite.config.js              # Vite config
├── tailwind.config.js          # Tailwind CSS config
├── eslint.config.js            # ESLint config
├── package.json                # Dependencies
└── Dockerfile                  # Docker container
```

### 🎨 Cách Hoạt Động Chi Tiết:

#### **Bước 1: Khởi Động (main.jsx + App.jsx)**

```javascript
1. main.jsx: createRoot + render App
2. App.jsx:
   a. Khởi tạo Redux store provider
   b. Khởi tạo BrowserRouter
   c. Dispatch checkAuthThunk() để kiểm tra auth
   d. Render AppRouter (routes)
```

#### **Bước 2: Xác Thực (Authentication)**

```
Login Page
  ↓ POST /api/auth/login (username, password)
  ↓
Backend trả JWT token
  ↓
Redux store lưu token
  ↓
Redirect đến Dashboard
```

#### **Bước 3: Hiển Thị Dữ Liệu**

**A. Heatmap Display:**

```
DashboardPage
  ↓ useEffect: dispatch(getHeatmapThunk())
  ↓
analyticsService.getHeatmap()
  ↓ GET /api/analytics/heatmap
  ↓
Backend trả heatmap matrix từ MongoDB
  ↓
Redux: analytics.heatmap = data
  ↓
HeatmapDisplay component:
  - Vẽ canvas
  - Render heatmap matrix dưới dạng color gradient
  - Overlay trên video
```

**B. Dwell Time Chart:**

```
AnalyticsPage
  ↓ useEffect: dispatch(getDwellTimeStatsThunk())
  ↓
Backend trả dwell time statistics
  ↓
Redux store
  ↓
Chart.js / Recharts render biểu đồ
```

#### **Bước 4: Real-time Updates (Socket.io)**

```javascript
useSocket hook:
  1. Connect tới server via Socket.io
  2. socket.emit('join_location', locationId)
  3. Lắng nghe:
     - socket.on('dwell_time_update', (data) => {...})
     - socket.on('zone_update', (data) => {...})
     - socket.on('alert', (data) => {...})
  4. Update Redux state khi nhận dữ liệu
  5. Component re-render (tự động)
```

#### **Bước 5: Giao Diện Chính (Pages)**

- **Login Page**: Đăng nhập
- **Dashboard**: Overview, real-time stats
- **Analytics Page**: Heatmap, dwell time trends
- **Camera Page**: Danh sách camera, cấu hình
- **Zone Config Page**: Vẽ zone trên video (Konva canvas)
- **Alerts Page**: Danh sách alert (dwell time > threshold)

### 🔧 Các File Chính & Ý Nghĩa:

| File                          | Ý Nghĩa                        |
| ----------------------------- | ------------------------------ |
| **App.jsx**                   | Root component, Redux + Router |
| **services/api.js**           | Axios instance với baseURL     |
| **services/authService.js**   | API calls để login/register    |
| **features/auth.thunk.js**    | Redux async thunk cho auth     |
| **hooks/useSocket.js**        | Hook kết nối Socket.io         |
| **components/HeatmapDisplay** | Render heatmap canvas          |
| **pages/DashboardPage**       | Dashboard chính                |

---

## 6. Chi Tiết Các File Quan Trọng

### 🎯 AI Module

#### **main.py**

- **Vai Trò**: Entry point, vòng lặp chính
- **Công Việc**:
  1. Load config
  2. Khởi tạo mô hình YOLO, DeepSORT
  3. Khởi tạo StreamProcessor
  4. Vòng lặp: đọc frame → detect → track → phân tích → push Redis

#### **stream_processing.py**

- **Vai Trò**: Xử lý stream video
- **Công Việc**:
  1. Preprocess frame (resize, padding)
  2. Gọi object tracking (YOLO + DeepSORT)
  3. Tính heatmap
  4. Phân tích dwell time
  5. Kiểm tra zone
  6. Đẩy dữ liệu lên Redis channels

#### **heatmap_analysis.py**

- **Vai Trò**: Tính toán heatmap
- **Công Việc**:
  1. Chia frame thành lưới
  2. Mỗi frame, mỗi track_id → tìm cell tương ứng → cộng +0.5
  3. Apply decay để làm mờ dần
  4. Normalize để không vượt quá 255
  5. Return ma trận heatmap

#### **object_tracking.py**

- **Vai Trò**: Combo YOLO + DeepSORT
- **Công Việc**:
  1. YOLO predict frame → detections
  2. Transform to DeepSORT format
  3. DeepSORT predict → tracks (với track_id)
  4. Return track list

### 🎯 Backend Module

#### **worker.js**

- **Vai Trò**: Lắng nghe Redis channels từ AI
- **Công Việc**:
  1. 2 Redis connections: batch + realtime
  2. Batch: blPop từ heatmap, dwell_time, zone_analysis
  3. Real-time: subscribe, emit qua Socket.io
  4. Gọi workers tương ứng (heatmapWorker, sessionWorker, ...)

#### **heatmap.worker.js**

- **Vai Trò**: Lưu heatmap vào MongoDB
- **Công Việc**:
  1. Nhận heatmap matrix từ Redis
  2. Tìm heatmap document của location/camera
  3. Update matrix + timestamp
  4. Lưu vào collection `Heatmap`

#### **session.worker.js**

- **Vai Trò**: Lưu dwell time vào MongoDB
- **Công Việc**:
  1. Nhận dwell_time data từ Redis
  2. Tìm hoặc tạo session mới
  3. Ghi lại track_id, dwell_time, position
  4. Lưu vào collection `Sessions`

#### **ruleCustomer.worker.js**

- **Vai Trò**: Kiểm tra rule tự động (dwell time threshold)
- **Công Việc**:
  1. Nhận event dwell_time
  2. So sánh với threshold từ database
  3. Nếu exceed → tạo alert
  4. Lưu notification vào DB
  5. Emit via Socket.io để FE alert ngay

### 🎯 Frontend Module

#### **App.jsx**

- **Vai Trò**: Root component
- **Công Việc**:
  1. Redux Provider
  2. BrowserRouter
  3. Dispatch checkAuthThunk
  4. Render AppRouter

#### **services/api.js**

- **Vai Trò**: Axios instance
- **Công Việc**:
  1. Set baseURL = `http://localhost:3000/api/v1`
  2. Thêm JWT token vào header
  3. Handle 401 error (logout)

#### **hooks/useSocket.js**

- **Vai Trò**: Custom hook kết nối Socket.io
- **Công Việc**:
  1. Connect tới server
  2. Join location room
  3. Lắng nghe events: dwell_time, zone_update, alert
  4. Dispatch Redux action khi nhận data
  5. Cleanup khi unmount

#### **components/HeatmapDisplay.jsx**

- **Vai Trò**: Hiển thị heatmap
- **Công Việc**:
  1. Nhận heatmap matrix từ Redux
  2. Render canvas
  3. Vẽ gradient color theo intensity
  4. Overlay trên video background

---

## 7. Cách Các Phần Tương Tác

### 🔗 Luồng Hoàn Chỉnh: Từ Camera đến Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ 1️⃣  AI MODULE (main.py)                                      │
│    - Đọc video từ camera RTSP                               │
│    - YOLO detect người (bounding box)                       │
│    - DeepSORT gán ID tracking                               │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 2️⃣  ANALYTICS (stream_processing.py)                        │
│    - Tính heatmap (ma trận mật độ)                          │
│    - Tính dwell_time (thời gian đứng)                       │
│    - Phân tích zone (người ở zone nào)                      │
│    - Tạo event data                                         │
└──────────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 3️⃣  REDIS PUBLISH (redis_publish.py)                        │
│    - Channels: heatmap_channel, dwell_time_channel         │
│    - Real-time: dwell_time_realtime_channel                │
│    - Đẩy JSON lên Redis                                     │
└──────────────────────────────────────────────────────────────┘
                         ↓
      ┌──────────────────┴──────────────────┐
      ↓                                     ↓
  ╔═══════════════════╗              ╔═══════════════════╗
  ║ BATCH PROCESSING  ║              ║ REAL-TIME STREAM  ║
  ║ (blPop channels)  ║              ║ (subscribe)       ║
  ╚═══════════════════╝              ╚═══════════════════╝
      ↓                                     ↓
  Backend workers:                    Socket.io emit:
  - heatmapWorker                     - Mỗi location room
  - sessionWorker                     - Gửi ngay data
  - ruleCustomerWorker                - Frontend xử lý real-time
      ↓                                     ↓
  MongoDB save:                       Frontend Socket listen:
  - Heatmap                           - useSocket hook
  - Sessions                          - Redux update
  - Notifications                     - Component re-render
      ↓                                     ↓
  HTTP GET API:                       Real-time Dashboard:
  - /api/analytics/heatmap            - Dwell time realtime
  - /api/analytics/dwell-time         - Zone updates
      ↓                                     ↓
      └──────────────────┬──────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │ 4️⃣  FRONTEND DASHBOARD         │
        │  - Hiển thị Heatmap            │
        │  - Biểu đồ Dwell Time          │
        │  - Real-time Alerts            │
        │  - Zone Analysis               │
        └────────────────────────────────┘
```

### 📊 Communication Protocols

| Phần               | Gửi   | Nhận     | Protocol              |
| ------------------ | ----- | -------- | --------------------- |
| AI → Backend       | JSON  | -        | Redis Pub/Sub         |
| Backend ↔ Frontend | JSON  | JSON     | HTTP REST + Socket.io |
| Backend ↔ Database | Query | Document | MongoDB Driver        |
| Frontend → Backend | JSON  | -        | HTTP POST/GET         |
| Frontend ← Backend | -     | JSON     | HTTP Response         |
| Backend ↔ Frontend | -     | JSON     | Socket.io Emit        |

### ⚙️ Dependencies Quan Trọng

**AI Module:**

- `FastAPI` — Web framework Python
- `YOLOv8` — Object detection
- `DeepSORT` — Multi-object tracking
- `OpenCV` — Image processing
- `Redis` — Message broker
- `numpy`, `scipy` — Numerical computing

**Backend Module:**

- `Express` — Web framework Node.js
- `Mongoose` — MongoDB ORM
- `Redis` — Cache + message broker
- `Socket.io` — Real-time communication
- `JWT` — Authentication
- `Bcrypt` — Password hashing
- `Bull` — Job queue

**Frontend Module:**

- `React` — UI library
- `Redux Toolkit` — State management
- `Axios` — HTTP client
- `Socket.io-client` — Real-time client
- `Tailwind CSS` — Styling
- `Chart.js / Recharts` — Charting
- `Konva` — Canvas drawing (zone config)

---

## 📝 Tổng Kết

### 🎯 Quy Trình Chính

1. **AI xử lý video** → Nhận diện người, tracking, phân tích
2. **Đẩy Redis** → Batch (heatmap, dwell time) + Real-time (alerts)
3. **Backend consumer** → Lưu MongoDB + Emit Socket.io
4. **Frontend listen** → Hiển thị Dashboard real-time

### 🏗️ Kiến Trúc

- **Loosely coupled**: 3 modules độc lập, giao tiếp qua Redis + HTTP
- **Scalable**: Có thể scale từng module riêng biệt
- **Real-time**: Socket.io cho updates trực tiếp
- **Reliable**: Job queue + error handling

### 📡 Data Flow

```
Video Stream → AI Detection → Analytics → Redis Queue
    ↓
Backend Consumer → MongoDB Storage
    ↓
Frontend API/Socket.io → Dashboard Visualization
```
