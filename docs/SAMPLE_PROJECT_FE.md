src/
├── assets/                  # Hình ảnh, icons, fonts
├── components/              # Các UI component dùng chung
│   ├── layout/              # Header, Sidebar, Footer, Navbar
│   └── common/              # Loading, EmptyState, Modal, Chart (Dùng chung)
├── constants/               # Khai báo biến môi trường, routes, config
├── features/                # CHIA THEO CHỨC NĂNG (Gói gọn UI + Redux)
│   ├── Authentication/      # Đăng nhập, Đăng ký
│   ├── UserManagement/      # Quản lý tài khoản, Phân quyền
│   ├── AssetManagement/     # Quản lý thiết bị/kệ hàng (Asset)
│   ├── CameraZoneConfig/    # Cấu hình Camera, vẽ Region of Interest (ROI)
│   ├── Dashboard/           # Màn hình tổng quan KPI
│   ├── AnalyticsHeatmap/    # Phân tích bản đồ nhiệt
│   ├── AnalyticsDwellTime/  # ĐO LƯỜNG LƯU LẠI (Sửa từ Downtime)
│   ├── AnalyticsFlow/       # MỚI: Luồng di chuyển & Quỹ đạo (Trajectory)
│   ├── AnalyticsRules/      # MỚI: Luật kết hợp không gian (FP-Tree)
│   ├── DataIntegration/     # MỚI: Đồng bộ POS/CRM & Đối chiếu dữ liệu
│   └── GenAIAssistant/      # MỚI: Chatbot AI hỏi đáp số liệu
├── layouts/                 # MainLayout, AuthLayout
├── redux/
│   └── store.js             # Gom tất cả các Slice từ features/
├── routes/
│   └── index.jsx            # Định nghĩa public/private routes
├── services/                # Call API (Axios)
│   ├── axios.config.js      # Base axios (Interceptors, Token config)
│   ├── auth.api.js
│   ├── user.api.js
│   ├── camera.api.js
│   ├── asset.api.js
│   ├── analytics.api.js     # Gom API của heatmap, dwell time, flow...
│   ├── sync.api.js          # Đồng bộ ngoại vi
│   └── genai.api.js         # API gọi Chatbot
├── styles/                  # CSS global (Tailwind / Custom CSS)
└── utils/                   # Các hàm dùng chung (formatCurrency, checkImg,...)