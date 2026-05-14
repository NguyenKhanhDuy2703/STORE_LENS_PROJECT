# 🚀 HƯỚNG DẪN CHẠY & SETUP HỆ THỐNG

> Document này hướng dẫn cách setup và chạy từng module của hệ thống Store Lens

---

## 📋 Yêu Cầu Hệ Thống

### Hardware

- **CPU**: Tối thiểu Intel i5, khuyên dùng i7+ hoặc Ryzen 7+
- **GPU**: (Tuỳ chọn) NVIDIA GPU với CUDA support để tăng tốc AI
- **RAM**: Tối thiểu 8GB, khuyên dùng 16GB trở lên
- **Storage**: 20GB+ (tùy số lượng video lưu trữ)

### Software

- **Docker & Docker Compose** (khuyên dùng)
- **Python 3.10+** (cho AI module)
- **Node.js 18+** (cho Backend)
- **npm hoặc yarn** (cho Frontend)
- **MongoDB** (local hoặc Atlas)
- **Redis** (local hoặc remote)

---

## 🔧 Setup 1: Dùng Docker Compose (Khuyên Dùng)

### Bước 1: Chuẩn Bị

```bash
# Clone/pull project
cd d:/NCKH_2

# Kiểm tra Docker
docker --version
docker-compose --version
```

### Bước 2: Cấu Hình Environment

Tạo file `.env` trong root workspace:

```env
# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB
MONGO_URL=mongodb://mongo:27017/store_lens
MONGO_USER=root
MONGO_PASSWORD=example

# Backend
BACKEND_PORT=3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development

# AI Module
AI_PORT=8000
VIDEO_SOURCE=./storage/videos/video_1.mp4
```

### Bước 3: Chạy Docker Compose

```bash
# Xây dựng images
docker-compose build

# Chạy tất cả services
docker-compose up -d

# Kiểm tra status
docker-compose ps

# View logs
docker-compose logs -f ai-module
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Bước 4: Kiểm Tra Services

```bash
# AI Module health check
curl http://localhost:8000/api/v1/health

# Backend health check
curl http://localhost:3000/api/v1/health

# Frontend
open http://localhost:5173
```

### Dừng Services

```bash
# Dừng tất cả
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

---

## 🔧 Setup 2: Chạy Local (Dev Mode)

### A. Setup Module AI

#### Bước 1: Environment Setup

```bash
cd d:/NCKH_2/MODULE_AI

# Tạo virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

#### Bước 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

# Nếu gặp lỗi với PyTorch/YOLO, cài riêng:
pip install torch torchvision torchaudio
pip install ultralytics  # YOLOv8
pip install -e .         # Cài deep_sort_realtime nếu có
```

#### Bước 3: Download Models

```bash
# YOLOv8 sẽ tự download khi chạy lần đầu
# Hoặc download trước:
yolo detect predict model=yolov8m.pt source="https://..."

# DeepSORT model thường đã có sẵn trong weights/
```

#### Bước 4: Cấu Hình Redis

```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Nếu chưa, cài Redis:
# Windows: Download từ https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt install redis-server
```

#### Bước 5: Chạy AI Module

```bash
# Kiểm tra config
cat app/config.py

# Chạy
python app/main.py

# Hoặc chạy trong FastAPI server mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Output mong đợi:**

```
INFO:     Uvicorn running on http://0.0.0.0:8000
Starting stream processing...
Connected to Redis on localhost:6379
Processing frame 1...
Detected 5 objects, tracked 5 objects
Published to heatmap_channel
```

---

### B. Setup Module Backend

#### Bước 1: Install Dependencies

```bash
cd d:/NCKH_2/MODULE_BE

npm install
# hoặc
yarn install
```

#### Bước 2: Cấu Hình Environment

Tạo file `.env`:

```env
# Database
MONGO_URL=mongodb://localhost:27017/store_lens
# hoặc dùng MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/store_lens

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars-long
JWT_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development

# API
API_BASE_URL=http://localhost:3000

# Cloudinary (nếu dùng upload ảnh)
CLOUDINARY_NAME=your-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

#### Bước 3: Setup Database

```bash
# Seed dữ liệu test
npm run seed

# Seed cho Gym
npm run seed:gym

# Seed và xóa cũ
npm run seed:test:clean
```

#### Bước 4: Chạy Backend

```bash
# Dev mode (with nodemon + inspect)
npm start

# Production mode
npm run build
node src/server.js

# Run tests
npm test
```

**Output mong đợi:**

```
[Server] Starting server on port 3000...
✓ Connected to MongoDB
✓ Redis connected on localhost:6379
✓ Socket.io server ready
[Socket] New client connected | id=xxx | transport=websocket
```

---

### C. Setup Module Frontend

#### Bước 1: Install Dependencies

```bash
cd d:/NCKH_2/MODULE_FE

npm install
# hoặc
yarn install
```

#### Bước 2: Cấu Hình API

Tạo file `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

Hoặc edit `src/services/api.js`:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
```

#### Bước 3: Chạy Frontend Dev Server

```bash
# Dev server (Vite)
npm run dev

# Output:
#   VITE v6.2.1  ready in 234 ms
#   ➜  Local:   http://localhost:5173/
```

#### Bước 4: Build Production

```bash
# Build
npm run build

# Preview
npm run preview
```

---

## 🔗 Kiểm Tra Kết Nối

### 1. Kiểm Tra Redis

```bash
# Mở Redis CLI
redis-cli

# Kiểm tra connection
ping
# Output: PONG

# Xem channels
PUBSUB CHANNELS

# Xem list items
LLEN heatmap_channel
LLEN dwell_time_channel
```

### 2. Kiểm Tra MongoDB

```bash
# Mở MongoDB client
mongosh

# Kết nối
use store_lens

# Xem collections
show collections

# Query users
db.users.find()

# Query heatmaps
db.heatmaps.find().limit(1)
```

### 3. Kiểm Tra Backend APIs

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Lấy list cameras
curl http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Lấy heatmap
curl http://localhost:3000/api/v1/analytics/heatmap \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Kiểm Tra AI Module

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Xem logs
tail -f MODULE_AI/logs/app.log
```

---

## 🐛 Troubleshooting

### AI Module

**Error: "No module named 'ultralytics'"**

```bash
pip install ultralytics
```

**Error: "CUDA not available"**

- AI sẽ tự fallback sang CPU
- Để dùng GPU, cài CUDA Toolkit + cuDNN

**Error: "Redis connection refused"**

```bash
# Kiểm tra Redis
redis-cli ping
# Nếu không chạy, start Redis
redis-server
```

**Error: "Video file not found"**

- Kiểm tra `VIDEO_SOURCE` trong `app/config.py`
- Đảm bảo file tồn tại trong `storage/videos/`

### Backend

**Error: "ECONNREFUSED MongoDB"**

```bash
# Kiểm tra MongoDB
mongosh
# Hoặc kết nối tới MongoDB Atlas
```

**Error: "ECONNREFUSED Redis"**

```bash
# Khởi động Redis
redis-server
```

**Error: "Port 3000 already in use"**

```bash
# Tìm process dùng port 3000
lsof -i :3000
# Hoặc dùng port khác
PORT=3001 npm start
```

### Frontend

**Error: "Network Error" trong console**

- Kiểm tra Backend có chạy không: `curl http://localhost:3000`
- Kiểm tra CORS settings
- Check `VITE_API_BASE_URL` có đúng không

\*\*Error: "Module not found"

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
```

**Heatmap không hiển thị**

- Kiểm tra AI module có gửi dữ liệu lên Redis không
- Kiểm tra Backend có nhận và lưu vào MongoDB không
- Kiểm tra Frontend API call trả về dữ liệu không

---

## 📊 Workflow Chạy Toàn Hệ Thống

### Bước 1: Khởi Động Services (Theo Thứ Tự)

```bash
# Terminal 1: Redis
redis-server

# Terminal 2: MongoDB
mongosh

# Terminal 3: AI Module
cd MODULE_AI
source venv/bin/activate  # Mac/Linux
# venv\Scripts\activate   # Windows
python app/main.py

# Terminal 4: Backend
cd MODULE_BE
npm start

# Terminal 5: Frontend
cd MODULE_FE
npm run dev
```

### Bước 2: Kiểm Tra Tất Cả Services

```bash
# Terminal riêng
# Kiểm tra Redis có data từ AI không
redis-cli
LLEN heatmap_channel

# Kiểm tra MongoDB
mongosh
use store_lens
db.heatmaps.findOne()

# Kiểm tra Backend logs
tail -f MODULE_BE/logs/*.log
```

### Bước 3: Mở Frontend & Test

```bash
# Browser
http://localhost:5173

# Đăng nhập
username: admin
password: password

# Xem Dashboard
# - Heatmap real-time
# - Dwell time chart
# - Alerts
```

---

## 📈 Performance Tuning

### AI Module

```python
# Trong stream_processing.py

# 1. Reduce frame resolution
target_size = (320, 320)  # instead of (640, 640)

# 2. Skip frames
skip_frames = 5  # Process every 5th frame

# 3. Lower detection threshold
confidence_threshold = 0.3  # instead of 0.5
```

### Backend

```javascript
// Trong worker.js

// 1. Increase batch size
const BATCH_SIZE = 100;

// 2. Reduce polling interval
const POLL_INTERVAL = 1000; // 1 second

// 3. Database indexing
db.heatmaps.createIndex({ timestamp: -1 });
db.sessions.createIndex({ camera_id: 1, date: -1 });
```

### Frontend

```javascript
// Trong vite.config.js

export default {
  build: {
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-redux"],
        },
      },
    },
  },
};
```

---

## 🎯 Checklist Setup Toàn Hệ Thống

- [ ] Docker & Docker Compose cài đặt
- [ ] Python 3.10+ cài đặt
- [ ] Node.js 18+ cài đặt
- [ ] Redis chạy
- [ ] MongoDB chạy
- [ ] AI module dependencies installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] .env files configured
- [ ] Database seeded
- [ ] AI module chạy thành công
- [ ] Backend chạy thành công
- [ ] Frontend chạy thành công
- [ ] APIs respond tới requests
- [ ] Redis channels hoạt động
- [ ] Socket.io connections established
- [ ] Dashboard hiển thị heatmap
- [ ] Real-time updates working

---

## 📚 Tài Liệu Thêm

- [AI Module README](./MODULE_AI/README.md)
- [Backend README](./MODULE_BE/README.md)
- [Frontend README](./MODULE_FE/README.md)
- [Database Schema](./docs/ERD.docs.md)
- [API Reference](./docs/API_REFERENCE.md)

---

**Last Updated:** 2026-05-14
