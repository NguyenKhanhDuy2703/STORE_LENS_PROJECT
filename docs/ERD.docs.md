# ERD Documentation — Retail Intelligence Platform

> **Phiên bản:** 1.0.0 | **Cập nhật:** 2025 | **Database:** MongoDB (NoSQL Document Store)

---

## Mục lục

1. [Tổng quan Kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Collection: Locations](#2-collection-locations)
3. [Collection: Users](#3-collection-users)
4. [Collection: Cameras](#4-collection-cameras)
5. [Collection: Zones](#5-collection-zones)
6. [Collection: Assets](#6-collection-assets)
7. [Collection: Sessions](#7-collection-sessions)
8. [Collection: InteractionLogs](#8-collection-interactionlogs)
9. [Collection: BusinessEvents](#9-collection-businessevents)
10. [Collection: Heatmap](#10-collection-heatmap)
11. [Collection: LocationStats](#11-collection-locationstats)
12. [Collection: ZoneStats](#12-collection-zonestats)
13. [Collection: FlowPatterns](#13-collection-flowpatterns)
14. [Collection: ChatSessions](#14-collection-chatsessions)
15. [Collection: CustomerCareRules & Automation](#15-collection-customercarerules--automation)
16. [Collection: Notifications](#16-collection-notifications)
17. [Quan hệ giữa các Collection (Relationships)](#17-quan-hệ-giữa-các-collection-relationships)
18. [Sơ đồ Luồng Dữ liệu](#18-sơ-đồ-luồng-dữ-liệu)

---

## 1. Tổng quan Kiến trúc

Hệ thống sử dụng **MongoDB** làm cơ sở dữ liệu chính theo mô hình NoSQL Document Store. Dữ liệu được tổ chức thành các **Collections** độc lập, liên kết với nhau qua `ObjectId` reference hoặc **embedded documents/arrays**.

### Nhóm Collections theo chức năng

| Nhóm | Collections | Mô tả |
|------|-------------|--------|
| **Hạ tầng** | `Locations`, `Users`, `Cameras`, `Zones` | Quản lý địa điểm, tài khoản, thiết bị |
| **Danh mục** | `Assets` | Sản phẩm / tài sản theo dõi |
| **Tracking** | `Sessions`, `InteractionLogs` | Theo dõi hành vi khách hàng real-time |
| **Giao dịch** | `BusinessEvents` | Dữ liệu bán hàng / POS |
| **Phân tích** | `Heatmap`, `LocationStats`, `ZoneStats`, `FlowPatterns` | Dữ liệu tổng hợp & analytics |
| **AI / GenAI** | `ChatSessions`, `CustomerCareRules` | Tương tác AI & tự động hoá |
| **Thông báo** | `Notifications` | Hệ thống cảnh báo & alert |

### Quy ước Ký hiệu

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `🔑 PK` | Primary Key (`_id` ObjectId) |
| `🔗 FK` | Foreign Key (ObjectId tham chiếu collection khác) |
| `📦 EMB` | Embedded Object (nhúng trực tiếp) |
| `📋 ARR` | Embedded Array |
| `✳️ REQ` | Required (bắt buộc) |
| `🔁 UNQ` | Unique (duy nhất) |
| `⚙️ DEF` | Default value |

---

## 2. Collection: Locations

> Quản lý thông tin các chi nhánh / cửa hàng. Đây là **collection trung tâm** mà hầu hết các collection khác đều tham chiếu đến.

### 2.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | Định danh duy nhất |
| `location_code` | String | ✳️ REQ, 🔁 UNQ, Uppercase, Trimmed | Mã chi nhánh (VD: `HCM-001`) |
| `name` | String | ✳️ REQ, Trimmed | Tên chi nhánh |
| `address` | String | Trimmed | Địa chỉ |
| `type_model` | String | ⚙️ DEF: `RETAIL`, Enum | Loại mô hình kinh doanh |
| `created_at` | Date | Tự động tạo | Thời điểm tạo |
| `updated_at` | Date | Tự động cập nhật | Thời điểm cập nhật cuối |

**Enum `type_model`:** `RETAIL` | `GYM` | `OFFICE`

### 2.2 Embedded Objects

#### 📦 manager_info

| Field | Type | Mô tả |
|-------|------|-------|
| `name` | String | Họ tên quản lý |
| `phone` | String | Số điện thoại |
| `email` | String | Email liên hệ |

#### 📦 business_hours

| Field | Type | Mô tả |
|-------|------|-------|
| `open` | String | Giờ mở cửa (VD: `"08:00"`) |
| `close` | String | Giờ đóng cửa (VD: `"22:00"`) |
| `timezone` | String | ⚙️ DEF: `Asia/Ho_Chi_Minh` |

### 2.3 Ví dụ Document

```json
{
  "_id": "ObjectId('64a1b2c3d4e5f6789012')",
  "location_code": "HCM-001",
  "name": "Cửa hàng Quận 1",
  "address": "123 Nguyễn Huệ, Q.1, TP.HCM",
  "type_model": "RETAIL",
  "manager_info": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "email": "manager@store.com"
  },
  "business_hours": {
    "open": "08:00",
    "close": "22:00",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "created_at": "2024-01-15T07:00:00Z",
  "updated_at": "2024-06-01T10:30:00Z"
}
```

---

## 3. Collection: Users

> Quản lý tài khoản hệ thống, phân quyền theo vai trò.

### 3.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | Định danh duy nhất |
| `account` | String | ✳️ REQ, 🔁 UNQ, Trimmed | Tên đăng nhập |
| `password` | String | ✳️ REQ | Mật khẩu (đã hash) |
| `email` | String | ✳️ REQ, 🔁 UNQ, Lowercase, Trimmed | Email |
| `role` | String | ⚙️ DEF: `USER`, Enum | Vai trò trong hệ thống |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | Chi nhánh phụ trách |
| `created_at` | Date | Tự động tạo | |
| `updated_at` | Date | Tự động cập nhật | |

**Enum `role`:** `ADMIN` | `MANAGER` | `USER`

> **Lưu ý:** `location_id` bắt buộc nếu `role` không phải `SUPER_ADMIN`.

### 3.2 Quan hệ

```
Users ────────────── Locations
  (N)   location_id    (1)
```

---

## 4. Collection: Cameras

> Quản lý thiết bị camera đầu cuối tại các địa điểm.

### 4.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh lắp đặt |
| `camera_name` | String | ✳️ REQ, Trimmed | Tên camera |
| `camera_code` | String | ✳️ REQ, 🔁 UNQ, Trimmed | Mã định danh camera |
| `rtsp_url` | String | ✳️ REQ, Trimmed | Địa chỉ stream RTSP |
| `status` | String | | Trạng thái vận hành |
| `last_heartbeat` | Date | | Lần cuối gửi tín hiệu sống |
| `installation_date` | Date | | Ngày lắp đặt |
| `ai_config` | Mixed | | Cấu hình AI riêng cho camera |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 4.2 Embedded Objects

#### 📦 camera_spec

| Field | Type | Mô tả |
|-------|------|-------|
| `max_resolution` | Object | Độ phân giải tối đa `{width, height}` |
| `current_resolution` | Object | Độ phân giải hiện tại `{width, height}` |

#### 📦 camera_state

| Field | Type | Mô tả |
|-------|------|-------|
| `last_processed_time` | Date | Thời điểm xử lý frame cuối cùng |
| `last_stop_time` | Date | Thời điểm dừng hoạt động cuối |

### 4.3 Ví dụ Document

```json
{
  "_id": "ObjectId('...')",
  "location_id": "ObjectId('64a1b2c3d4e5f6789012')",
  "camera_name": "Cổng vào chính",
  "camera_code": "CAM-ENT-001",
  "rtsp_url": "rtsp://192.168.1.10:554/stream1",
  "status": "ACTIVE",
  "last_heartbeat": "2024-06-01T10:29:55Z",
  "camera_spec": {
    "max_resolution": { "width": 1920, "height": 1080 },
    "current_resolution": { "width": 1280, "height": 720 }
  },
  "camera_state": {
    "last_processed_time": "2024-06-01T10:29:50Z",
    "last_stop_time": null
  }
}
```

---

## 5. Collection: Zones

> Định nghĩa các vùng phân tích (polygon) trên camera. Mỗi zone là một khu vực không gian được khoanh vùng để theo dõi hành vi.

### 5.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh |
| `camera_id` | ObjectId | 🔗 FK → `Cameras._id`, ✳️ REQ | Camera chứa zone |
| `zone_name` | String | ✳️ REQ, Trimmed | Tên vùng (VD: "Kệ hàng A") |
| `function_type` | String | | Loại chức năng / danh mục phân tích |
| `polygon_coordinates` | Array | | Mảng tọa độ `[[x1,y1],[x2,y2],...]` |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 5.2 Quan hệ

```
Locations ──(1)──< Zones >──(1)── Cameras
```

---

## 6. Collection: Assets

> Quản lý danh mục sản phẩm / tài sản được theo dõi trong hệ thống phân tích.

### 6.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh |
| `category_name` | String | ✳️ REQ, Trimmed | Danh mục (VD: "Giày thể thao") |
| `name_product` | String | ✳️ REQ, Trimmed | Tên sản phẩm |
| `brand` | String | | Nhãn hiệu |
| `price` | Number | | Giá bán |
| `unit` | String | | Đơn vị tính |
| `stock_quantity` | Number | | Số lượng tồn kho |
| `status` | Boolean | ⚙️ DEF: `true` | `true` = đang bán |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 6.2 Embedded Object

#### 📦 asset_attributes

| Field | Type | Mô tả |
|-------|------|-------|
| `maintenance_date` | String | Ngày bảo trì (nếu là tài sản) |
| `color` | String | Màu sắc |
| `custom_note` | String | Ghi chú tuỳ chỉnh |

---

## 7. Collection: Sessions

> Theo dõi phiên khách hàng theo công nghệ **Re-ID** (nhận diện lại người). Mỗi session đại diện cho một lần ghé thăm của một người.

### 7.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh |
| `session_uuid` | String | ✳️ REQ, 🔁 UNQ, Trimmed | UUID định danh phiên |
| `person_id` | String | | ID người dùng (nếu đã đăng ký) |
| `reid_vector` | Array\<Number\> | | Vector đặc trưng nhận diện (embedding) |
| `entry_time` | Date | ✳️ REQ | Thời điểm vào cửa hàng |
| `exit_time` | Date | | Thời điểm ra khỏi cửa hàng |
| `total_dwell_time_seconds` | Number | | Tổng thời gian ở lại (giây) |

### 7.2 Embedded Array

#### 📋 zone_sequence

Chuỗi các vùng mà khách đã đi qua trong phiên.

| Field | Type | Mô tả |
|-------|------|-------|
| `zone_id` | ObjectId | 🔗 FK → `Zones._id` |
| `entry_time` | Date | Thời điểm vào zone |
| `exit_time` | Date | Thời điểm rời zone |
| `dwell_time_seconds` | Number | Thời gian ở trong zone (giây) |

### 7.3 Ví dụ Document

```json
{
  "_id": "ObjectId('...')",
  "location_id": "ObjectId('...')",
  "session_uuid": "sess-2024-abc123xyz",
  "entry_time": "2024-06-01T09:15:00Z",
  "exit_time": "2024-06-01T09:42:00Z",
  "total_dwell_time_seconds": 1620,
  "zone_sequence": [
    {
      "zone_id": "ObjectId('zone-entrance')",
      "entry_time": "2024-06-01T09:15:00Z",
      "exit_time": "2024-06-01T09:18:00Z",
      "dwell_time_seconds": 180
    },
    {
      "zone_id": "ObjectId('zone-shelf-A')",
      "entry_time": "2024-06-01T09:19:00Z",
      "exit_time": "2024-06-01T09:35:00Z",
      "dwell_time_seconds": 960
    }
  ]
}
```

---

## 8. Collection: InteractionLogs

> Nhật ký chi tiết từng sự kiện tương tác của khách với zone hoặc sản phẩm.

### 8.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `session_id` | ObjectId | 🔗 FK → `Sessions._id`, ✳️ REQ | Phiên liên quan |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh |
| `zone_id` | ObjectId | 🔗 FK → `Zones._id` | Vùng xảy ra tương tác |
| `asset_id` | ObjectId | 🔗 FK → `Assets._id` | Sản phẩm liên quan (nếu có) |
| `event_type` | String | ✳️ REQ | Loại sự kiện (VD: `STOP`, `PICK_UP`, `PURCHASE`) |
| `start_time` | Date | | Thời điểm bắt đầu sự kiện |
| `last_heartbeat` | Date | | Thời điểm heartbeat cuối cùng ghi nhận |
| `duration_seconds` | Number | | Thời gian tương tác (giây) |
| `status` | String | | Trạng thái sự kiện |

### 8.2 Quan hệ

```
Sessions ──(1)──< InteractionLogs >──(N)── Zones
                                    >──(N)── Assets
```

---

## 9. Collection: BusinessEvents

> Ghi nhận các giao dịch bán hàng từ hệ thống POS.

### 9.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | Chi nhánh |
| `event_code` | String | ✳️ REQ, 🔁 UNQ | Mã hóa đơn (invoice code) |
| `type` | String | | Loại giao dịch |
| `total_amount` | Number | | Tổng tiền hóa đơn |
| `discount` | Number | | Giá trị giảm giá |
| `payment_method` | String | | Phương thức thanh toán |
| `status` | String | | Trạng thái giao dịch |
| `date` | Date | | Thời điểm giao dịch |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 9.2 Embedded Array

#### 📋 event_details

Chi tiết từng mặt hàng trong hóa đơn.

| Field | Type | Mô tả |
|-------|------|-------|
| `item_id` | ObjectId | 🔗 FK → `Assets._id` |
| `item_name` | String | Tên sản phẩm tại thời điểm mua |
| `quantity` | Number | Số lượng |
| `unit_price` | Number | Đơn giá |
| `total_price` | Number | Thành tiền |

### 9.3 Ví dụ Document

```json
{
  "_id": "ObjectId('...')",
  "location_id": "ObjectId('...')",
  "event_code": "INV-20240601-00123",
  "total_amount": 1250000,
  "discount": 50000,
  "payment_method": "CREDIT_CARD",
  "status": "COMPLETED",
  "date": "2024-06-01T10:05:00Z",
  "event_details": [
    {
      "item_id": "ObjectId('...')",
      "item_name": "Giày Nike Air Max",
      "quantity": 1,
      "unit_price": 1300000,
      "total_price": 1300000
    }
  ]
}
```

---

## 10. Collection: Heatmap

> Lưu trữ dữ liệu bản đồ nhiệt theo khung hình từ camera. Dùng để phân tích mật độ di chuyển của khách theo không gian và thời gian.

### 10.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | |
| `camera_id` | ObjectId | 🔗 FK → `Cameras._id`, ✳️ REQ | Camera nguồn |
| `date` | Date | | Ngày ghi nhận |
| `time_stamp` | Number | | Mốc thời gian Unix (epoch) |
| `width_matrix` | Number | | Số cột ma trận |
| `height_matrix` | Number | | Số hàng ma trận |
| `grid_size` | Number | | Kích thước ô lưới (pixel) |
| `frame_width` | Number | | Chiều rộng khung hình gốc |
| `frame_height` | Number | | Chiều cao khung hình gốc |
| `heatmap_matrix` | Array\<Array\<Number\>\> | | Ma trận mật độ 2D |
| `created_at` | Date | | |
| `updated_at` | Date | | |

> **Ghi chú kỹ thuật:** `heatmap_matrix` là mảng 2D `[[Number]]`. Giá trị mỗi ô tương ứng với mật độ người xuất hiện tại vùng không gian đó trong khoảng thời gian `time_stamp`.

---

## 11. Collection: LocationStats

> Dữ liệu thống kê tổng hợp theo ngày cho từng địa điểm. Được tính toán định kỳ (aggregation pipeline) từ `Sessions`, `InteractionLogs`, `BusinessEvents`.

### 11.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | |
| `date` | Date | | Ngày thống kê |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 11.2 Embedded Objects & Arrays

#### 📦 kpis

| Field | Type | Mô tả |
|-------|------|-------|
| `total_visitors` | Number | Tổng lượt khách |
| `total_revenue` | Number | Tổng doanh thu |
| `total_events` | Number | Tổng số giao dịch |
| `conversion_rate` | Number | Tỉ lệ chuyển đổi (%) |
| `avg_store_dwell_time` | Number | Thời gian lưu trú TB (giây) |
| `avg_basket_value` | Number | Giá trị giỏ hàng TB |

#### 📦 realtime

| Field | Type | Mô tả |
|-------|------|-------|
| `people_current` | Number | Số khách hiện đang trong cửa hàng |
| `checkout_length` | Number | Độ dài hàng chờ tính tiền |

#### 📋 chart_data

Dữ liệu theo giờ để vẽ biểu đồ.

| Field | Type | Mô tả |
|-------|------|-------|
| `hour` | Number | Giờ trong ngày (0–23) |
| `people_count` | Number | Số khách trong giờ đó |
| `total_revenue` | Number | Doanh thu trong giờ đó |

#### 📋 top_assets

Top sản phẩm bán chạy trong ngày.

| Field | Type | Mô tả |
|-------|------|-------|
| `asset_id` | ObjectId | 🔗 FK → `Assets._id` |
| `asset_name` | String | Tên sản phẩm |
| `total_quantity` | Number | Tổng số lượng bán |
| `total_revenue` | Number | Tổng doanh thu |
| `rank` | Number | Thứ hạng |

---

## 12. Collection: ZoneStats

> Dữ liệu thống kê tổng hợp theo ngày cho từng Zone. Tương tự `LocationStats` nhưng ở cấp độ vùng phân tích.

### 12.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | |
| `zone_id` | ObjectId | 🔗 FK → `Zones._id` | |
| `date` | Date | | Ngày thống kê |
| `trend` | String | | Xu hướng (VD: `UP`, `DOWN`, `STABLE`) |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 12.2 Embedded Object

#### 📦 performance

| Field | Type | Mô tả |
|-------|------|-------|
| `people_count` | Number | Tổng lượt khách vào zone |
| `total_sales_value` | Number | Tổng doanh thu từ zone |
| `total_events` | Number | Tổng sự kiện ghi nhận |
| `conversion_rate` | Number | Tỉ lệ chuyển đổi (%) |
| `avg_dwell_time` | Number | Thời gian lưu trú TB (giây) |
| `total_stop_events` | Number | Tổng số lần dừng lại |
| `top_asset_id` | ObjectId | 🔗 FK → `Assets._id` — Sản phẩm nổi bật |
| `peak_hour` | Number | Giờ cao điểm (0–23) |

---

## 13. Collection: FlowPatterns

> Lưu trữ các mẫu luồng di chuyển (movement flow) được phát hiện bằng thuật toán **Association Rule Mining** (Apriori / FP-Growth).

### 13.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | |
| `pattern_type` | String | | Loại mẫu di chuyển |
| `antecedent_zones` | Array\<Number\> | | Danh sách zone xuất phát (nguyên nhân) |
| `consequent_zones` | Array\<Number\> | | Danh sách zone đích (kết quả) |
| `confidence` | Float | | Độ tin cậy (0.0 – 1.0) |
| `support` | Float | | Độ phổ biến (0.0 – 1.0) |
| `lift` | Number | | Chỉ số nâng (lift score) |
| `created_at` | Date | | |
| `updated_at` | Date | | |

> **Giải thích:** Nếu `antecedent_zones = [ZoneA]` và `consequent_zones = [ZoneB]` với `confidence = 0.75`, nghĩa là 75% khách hàng đến ZoneA sẽ tiếp tục đến ZoneB.

---

## 14. Collection: ChatSessions

> Lưu trữ lịch sử hội thoại với AI (GenAI assistant) của từng người dùng.

### 14.1 Schema chính

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `user_id` | ObjectId | 🔗 FK → `Users._id` | Người dùng |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | Ngữ cảnh chi nhánh |
| `title` | String | | Tiêu đề cuộc hội thoại |
| `metadata` | JSON | | Metadata tuỳ chỉnh |
| `created_at` | Date | | |
| `updated_at` | Date | | |

### 14.2 Embedded Array

#### 📋 chat_messages

| Field | Type | Mô tả |
|-------|------|-------|
| `role` | String | `user` hoặc `assistant` |
| `content` | String | Nội dung tin nhắn |
| `timestamp` | Date | Thời điểm gửi |

---

## 15. Collection: CustomerCareRules & Automation

> Hệ thống quy tắc tự động (rule engine) để kích hoạt hành động chăm sóc khách hàng dựa trên các ngưỡng metric.

### 15.1 CustomerCareRules

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id` | |
| `category` | String | | Nhóm quy tắc |
| `rule_name` | String | | Tên quy tắc |
| `logic` | Number | 🔗 FK → `logic_rule.logic_id` | Điều kiện kích hoạt |
| `action` | Number | 🔗 FK → `action_rule.action_id` | Hành động thực thi |
| `is_active` | Boolean | | Trạng thái bật/tắt |

### 15.2 logic_rule (Lookup Table)

| Field | Type | Mô tả |
|-------|------|-------|
| `logic_id` | Number | 🔑 PK |
| `metric_name` | String | Tên chỉ số (VD: `dwell_time`, `people_count`) |
| `operator` | Enum | Toán tử so sánh (`>`, `<`, `>=`, `<=`, `==`) |
| `threshold` | Number | Ngưỡng giá trị |
| `unit` | String | Đơn vị (giây, người, ...) |

### 15.3 action_rule (Lookup Table)

| Field | Type | Mô tả |
|-------|------|-------|
| `action_id` | Number | 🔑 PK |
| `type_action` | String | Loại hành động (VD: `SEND_NOTIFICATION`, `ALERT_STAFF`) |
| `message_template` | String | Template nội dung tin nhắn |

### 15.4 Ví dụ quy tắc

```
NẾU   dwell_time_seconds > 600 (10 phút) tại Zone "Kệ hàng A"
THÌ   Gửi thông báo: "Khách cần hỗ trợ tại khu vực Giày thể thao"
```

---

## 16. Collection: Notifications

> Lưu trữ các thông báo được tạo ra từ hệ thống (quy tắc tự động, cảnh báo AI, ...).

### 16.1 Schema

| Field | Type | Ràng buộc | Mô tả |
|-------|------|-----------|-------|
| `_id` | ObjectId | 🔑 PK, 🔁 UNQ | |
| `location_id` | ObjectId | 🔗 FK → `Locations._id`, ✳️ REQ | |
| `rule_id` | ObjectId | 🔗 FK → `CustomerCareRules._id` (optional) | Quy tắc đã trigger |
| `session_id` | ObjectId | 🔗 FK → `Sessions._id` (optional) | Phiên liên quan |
| `type` | String | | `ALERT` \| `INFO` \| `WARNING` \| `CUSTOMER_CARE` |
| `title` | String | | Tiêu đề thông báo |
| `message` | String | | Nội dung thông báo |
| `is_read` | Boolean | | Đã đọc chưa |
| `created_at` | Date | | |

---

## 17. Quan hệ giữa các Collection (Relationships)

### 17.1 Bảng tổng hợp quan hệ

| Collection nguồn | Field | Collection đích | Loại quan hệ |
|-----------------|-------|----------------|-------------|
| `Users` | `location_id` | `Locations` | N → 1 |
| `Cameras` | `location_id` | `Locations` | N → 1 |
| `Zones` | `location_id` | `Locations` | N → 1 |
| `Zones` | `camera_id` | `Cameras` | N → 1 |
| `Assets` | `location_id` | `Locations` | N → 1 |
| `Sessions` | `location_id` | `Locations` | N → 1 |
| `Sessions` | `zone_sequence[].zone_id` | `Zones` | N → N (embedded) |
| `InteractionLogs` | `session_id` | `Sessions` | N → 1 |
| `InteractionLogs` | `location_id` | `Locations` | N → 1 |
| `InteractionLogs` | `zone_id` | `Zones` | N → 1 |
| `InteractionLogs` | `asset_id` | `Assets` | N → 1 |
| `BusinessEvents` | `location_id` | `Locations` | N → 1 |
| `BusinessEvents` | `event_details[].item_id` | `Assets` | N → N (embedded) |
| `Heatmap` | `location_id` | `Locations` | N → 1 |
| `Heatmap` | `camera_id` | `Cameras` | N → 1 |
| `LocationStats` | `location_id` | `Locations` | N → 1 |
| `LocationStats` | `top_assets[].asset_id` | `Assets` | N → N (embedded) |
| `ZoneStats` | `location_id` | `Locations` | N → 1 |
| `ZoneStats` | `zone_id` | `Zones` | N → 1 |
| `ZoneStats` | `performance.top_asset_id` | `Assets` | N → 1 |
| `FlowPatterns` | `location_id` | `Locations` | N → 1 |
| `ChatSessions` | `user_id` | `Users` | N → 1 |
| `ChatSessions` | `location_id` | `Locations` | N → 1 |
| `CustomerCareRules` | `location_id` | `Locations` | N → 1 |
| `CustomerCareRules` | `logic` | `logic_rule` | N → 1 |
| `CustomerCareRules` | `action` | `action_rule` | N → 1 |
| `Notifications` | `location_id` | `Locations` | N → 1 |
| `Notifications` | `session_id` | `Sessions` | N → 1 |
| `Notifications` | `rule_id` | `CustomerCareRules` | N → 1 |

### 17.2 Sơ đồ quan hệ tổng thể (Text-based ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LOCATIONS (Trung tâm)                       │
│  _id, location_code, name, type_model                               │
│  [manager_info], [business_hours]                                   │
└──────────┬──────────────────────────────────────────────────────────┘
           │ location_id (FK)
     ┌─────┼──────┬──────────┬──────────┬──────────┬──────────┐
     ▼     ▼      ▼          ▼          ▼          ▼          ▼
  USERS CAMERAS  ZONES     ASSETS   SESSIONS  BUSINESS   HEATMAP
                   │                    │      EVENTS
                   │ camera_id          │ zone_sequence
                   ▼                    ▼
                CAMERAS             ZONES
                                       │
                                       ▼
                              INTERACTION
                                  LOGS
                                  (session_id, zone_id, asset_id)
           │
     ┌─────┼──────────────────────────────────┐
     ▼     ▼                                  ▼
LOCATION  ZONE                          FLOW
  STATS   STATS                        PATTERNS
  [kpis]  [performance]
  [realtime]
  [chart_data]
  [top_assets]

USERS ──── CHAT SESSIONS ──── [chat_messages]

LOCATIONS ──── CUSTOMER CARE RULES ──── logic_rule
                                   └─── action_rule
                                              │
                                              ▼
                                       NOTIFICATIONS
```

---

## 18. Sơ đồ Luồng Dữ liệu

### 18.1 Luồng Tracking Khách hàng

```
[Camera phát hiện người]
         │
         ▼
   Tạo / Cập nhật Session
   (session_uuid, entry_time, reid_vector)
         │
         ├──► Ghi zone_sequence (người đi qua zone nào)
         │
         ├──► Tạo InteractionLog (dừng lại, cầm sản phẩm,...)
         │
         └──► Cập nhật Heatmap (mật độ vùng không gian)
```

### 18.2 Luồng Giao dịch POS

```
[Khách thanh toán tại POS]
         │
         ▼
   Tạo BusinessEvent
   (event_code, total_amount, event_details[])
         │
         ▼
   Aggregation hàng ngày
         │
         ├──► LocationStats.kpis.total_revenue
         ├──► LocationStats.top_assets
         └──► ZoneStats.performance.total_sales_value
```

### 18.3 Luồng Tự động hoá (Automation)

```
[Metric vượt ngưỡng]
   (VD: dwell_time > 600s)
         │
         ▼
   CustomerCareRule được match
   (logic_rule → operator → threshold)
         │
         ▼
   Thực thi action_rule
   (SEND_NOTIFICATION / ALERT_STAFF)
         │
         ▼
   Tạo Notification document
   (gắn session_id, rule_id)
```

### 18.4 Luồng Phân tích AI

```
[Dữ liệu Sessions tích luỹ]
         │
         ▼
   Association Rule Mining
   (Apriori / FP-Growth trên zone_sequence)
         │
         ▼
   Lưu FlowPatterns
   (antecedent_zones → consequent_zones, confidence, lift)
         │
         ▼
   Hiển thị trên Dashboard & GenAI Chat
   (ChatSessions / chat_messages)
```

---

## Phụ lục: Chỉ mục Index được khuyến nghị

| Collection | Index | Loại | Mục đích |
|-----------|-------|------|---------|
| `Locations` | `location_code` | Unique | Tra cứu nhanh theo mã |
| `Cameras` | `camera_code` | Unique | Tra cứu thiết bị |
| `Cameras` | `location_id` | Single | Filter theo chi nhánh |
| `Sessions` | `session_uuid` | Unique | Tra cứu phiên |
| `Sessions` | `(location_id, entry_time)` | Compound | Query theo ngày/địa điểm |
| `InteractionLogs` | `(session_id, start_time)` | Compound | Timeline tương tác |
| `InteractionLogs` | `(location_id, zone_id)` | Compound | Analytics theo zone |
| `BusinessEvents` | `event_code` | Unique | Tra cứu hóa đơn |
| `BusinessEvents` | `(location_id, date)` | Compound | Thống kê doanh thu |
| `Heatmap` | `(camera_id, date)` | Compound | Query heatmap theo ngày |
| `LocationStats` | `(location_id, date)` | Compound, Unique | Dashboard KPIs |
| `ZoneStats` | `(zone_id, date)` | Compound, Unique | Dashboard zone |
| `Notifications` | `(location_id, is_read)` | Compound | Thông báo chưa đọc |

---

*Tài liệu này được tạo tự động từ database schema. Mọi thay đổi schema cần được cập nhật tương ứng vào tài liệu này.*