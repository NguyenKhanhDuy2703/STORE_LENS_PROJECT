# SpaceLens API Reference

Basic documentation for the SpaceLens AI Tracking system.

Base URL: http://localhost:8000/api/v1  
Auth: Bearer Token (JWT)  
Docs: Swagger | ReDoc

## Table of Contents

1. Authentication
2. Dashboard
3. Status Codes

## 1. Authentication

### 1.1 Login

POST /auth/login

Request:

```json
{
  "username": "admin",
  "password": "password"
}
```

Response (200 OK):

```json
{
  "access_token": "...",
  "token_type": "bearer"
}
```

## 2. Dashboard - KPI Cards

### 2.1 Get KPI Metrics

GET /dashboard/kpis

Description: Lấy các chỉ số KPI (Tổng Doanh Thu, Tổng Khách Hàng, Tỷ Lệ Chuyển Đổi, SL Khách Hiện Tại, SL Chờ Tại Quầy) theo lọc chi nhánh và khoảng thời gian.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |
| period | string | No | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, `this_week`, `last_month`, `this_month`, `last_year`, `this_year` |

Example Request:

```
GET /dashboard/kpis?location_id=LOC_TEST_001&period=this_week
GET /dashboard/kpis?location_id=LOC_TEST_001
GET /dashboard/kpis?period=last_month
GET /dashboard/kpis
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "KPI metrics retrieved successfully",
    "data": {
        "totalRevenue": 67970000,
        "totalCustomers": 3,
        "conversionRate": 66.67,
        "currentCustomers": 7,
        "queueCount": 1,
        "lastUpdated": "2026-04-04T13:31:50.354Z"
    },
    "meta": {}
}
```

Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| totalRevenue | number | Tổng doanh thu (sum) từ tất cả giao dịch trong period và locations |
| totalCustomers | number | Tổng số khách hàng (count sessions) trong period và locations |
| conversionRate | number | Tỷ lệ chuyển đổi = (totalPurchases / totalCustomers) * 100 (%) |
| currentCustomers | number | Số khách hàng hiện tại đang ở trong cửa hàng (sessions chưa có exit_time) |
| queueCount | number | Số lượng khách chờ tại quầy (từ dữ liệu realtime gần nhất) |
| lastUpdated | string | Thời điểm cập nhật dữ liệu (ISO 8601 format) |

### 2.2 Get Hourly Customer Flow

GET /dashboard/hourly-flow

Description: Lấy lưu lượng khách hàng theo giờ (hourly customer flow) theo lọc chi nhánh và khoảng thời gian. Dữ liệu được nhóm theo giờ trong ngày.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |
| period | string | No | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, `this_week`, `last_month`, `this_month`, `last_year`, `this_year` |

Example Request:

```
GET /dashboard/hourly-flow?location_id=LOC_TEST_001&period=this_week
GET /dashboard/hourly-flow?location_id=LOC_TEST_001
GET /dashboard/hourly-flow?period=today
GET /dashboard/hourly-flow
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Hourly customer flow retrieved successfully",
    "data": {
        "hourly": [
            {
                "hour": 0,
                "customerCount": 12,
                "totalRevenue": 0
            },
            {
                "hour": 1,
                "customerCount": 15,
                "totalRevenue": 0
            },
            {
                "hour": 2,
                "customerCount": 19,
                "totalRevenue": 0
            },
            {
                "hour": 3,
                "customerCount": 1,
                "totalRevenue": 0
            },
            {
                "hour": 4,
                "customerCount": 9,
                "totalRevenue": 0
            },
            {
                "hour": 5,
                "customerCount": 5,
                "totalRevenue": 0
            },
            {
                "hour": 6,
                "customerCount": 12,
                "totalRevenue": 0
            },
            {
                "hour": 7,
                "customerCount": 2,
                "totalRevenue": 0
            },
            {
                "hour": 8,
                "customerCount": 10,
                "totalRevenue": 0
            },
            {
                "hour": 9,
                "customerCount": 9,
                "totalRevenue": 6627664
            },
            {
                "hour": 10,
                "customerCount": 14,
                "totalRevenue": 170536
            },
            {
                "hour": 11,
                "customerCount": 2,
                "totalRevenue": 9522021
            },
            {
                "hour": 12,
                "customerCount": 17,
                "totalRevenue": 5195734
            },
            {
                "hour": 13,
                "customerCount": 10,
                "totalRevenue": 6008654
            },
            {
                "hour": 14,
                "customerCount": 8,
                "totalRevenue": 7264011
            },
            {
                "hour": 15,
                "customerCount": 14,
                "totalRevenue": 1221907
            },
            {
                "hour": 16,
                "customerCount": 15,
                "totalRevenue": 1964964
            },
            {
                "hour": 17,
                "customerCount": 2,
                "totalRevenue": 4874543
            },
            {
                "hour": 18,
                "customerCount": 6,
                "totalRevenue": 3363285
            },
            {
                "hour": 19,
                "customerCount": 14,
                "totalRevenue": 1594051
            },
            {
                "hour": 20,
                "customerCount": 9,
                "totalRevenue": 8899872
            },
            {
                "hour": 21,
                "customerCount": 4,
                "totalRevenue": 0
            },
            {
                "hour": 22,
                "customerCount": 11,
                "totalRevenue": 0
            },
            {
                "hour": 23,
                "customerCount": 19,
                "totalRevenue": 0
            }
        ],
        "lastUpdated": "2026-04-04T13:55:31.469Z"
    },
    "meta": {}
}
```

Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| hourly | array | Mảng chứa dữ liệu lưu lượng khách theo giờ |
| hourly[].hour | number | Giờ trong ngày (0-23) |
| hourly[].customerCount | number | Tổng số khách hàng trong giờ đó |
| hourly[].totalRevenue | number | Tổng doanh thu trong giờ đó |
| lastUpdated | string | Thời điểm cập nhật dữ liệu (ISO 8601 format) |

### 2.3 Get Revenue Last 7 Days

GET /dashboard/revenue-7days

Description: Lấy doanh thu 7 ngày gần nhất (fixed, luôn 7 ngày từ hôm nay) theo lọc chi nhánh.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |

Example Request:

```
GET /dashboard/revenue-7days?location_id=LOC_TEST_001
GET /dashboard/revenue-7days
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Revenue for last 7 days retrieved successfully",
    "data": {
        "totalRevenue": 67970000,
        "daily": [
            {
                "date": "2026-04-04",
                "revenue": 67970000
            }
        ],
        "startDate": "2026-03-27T17:00:00.000Z",
        "endDate": "2026-04-04T16:59:59.999Z",
        "lastUpdated": "2026-04-04T14:04:31.585Z"
    },
    "meta": {}
}
```

Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| totalRevenue | number | Tổng doanh thu 7 ngày gần nhất |
| daily | array | Mảng chi tiết doanh thu theo từng ngày |
| daily[].date | string | Ngày (định dạng YYYY-MM-DD) |
| daily[].revenue | number | Doanh thu của ngày đó |
| startDate | string | Ngày bắt đầu (7 ngày trước, 00:00) |
| endDate | string | Ngày kết thúc (hôm nay, 23:59) |
| lastUpdated | string | Thời điểm cập nhật dữ liệu (ISO 8601 format) |

### 2.4 Get High Traffic Zones

GET /dashboard/high-traffic-zones

Description: Lấy danh sách khu vực (zones) có lưu lượng khách cao nhất, xếp hạng theo thứ tự từ cao đến thấp, với áp dụng lọc chi nhánh và khoảng thời gian.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |
| period | string | No | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, `this_week`, `last_month`, `this_month`, `last_year`, `this_year` |

Example Request:

```
GET /dashboard/high-traffic-zones?location_id=LOC_TEST_001&period=today
GET /dashboard/high-traffic-zones?period=last_week
GET /dashboard/high-traffic-zones?location_id=LOC_TEST_001
GET /dashboard/high-traffic-zones
```

Response (200 OK):

```json
{
    "success": true,
    "code": 200,
    "message": "High traffic zones retrieved successfully",
    "data": {
        "zones": [
            {
                "rank": 1,
                "zoneId": "zone_001",
                "zoneName": "Lối vào chính",
                "customerCount": 890,
                "previousCustomerCount": 820,
                "diff": 70,
                "trend": "up"
            },
            {
                "rank": 2,
                "zoneId": "zone_002",
                "zoneName": "Quầy thanh toán",
                "customerCount": 756,
                "previousCustomerCount": 780,
                "diff": -24,
                "trend": "down"
            },
            {
                "rank": 3,
                "zoneId": "zone_003",
                "zoneName": "Khu vực giảm giá",
                "customerCount": 723,
                "previousCustomerCount": 700,
                "diff": 23,
                "trend": "up"
            },
            {
                "rank": 4,
                "zoneId": "zone_004",
                "zoneName": "Mỹ phẩm cao cấp",
                "customerCount": 654,
                "previousCustomerCount": 640,
                "diff": 14,
                "trend": "up"
            },
            {
                "rank": 5,
                "zoneId": "zone_005",
                "zoneName": "Đồ chơi trẻ em",
                "customerCount": 521,
                "previousCustomerCount": 500,
                "diff": 21,
                "trend": "up"
            }
        ],
        "total": 5,
        "lastUpdated": "2026-04-04T15:00:00.000Z"
    },
    "meta": {}
}

```

### 2.5 Get Zone Performance Details

GET /dashboard/performance-details

Description: Lấy chi tiết hiệu suất từng zone theo lọc chi nhánh và khoảng thời gian. Trả về tên zone, zone ID, tỷ lệ chuyển đổi, thời gian dừng trung bình và màu sắc cho mỗi zone.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |
| period | string | No | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, `this_week`, `last_month`, `this_month`, `last_year`, `this_year` |

Example Request:

```
GET /dashboard/performance-details?location_id=LOC_TEST_001&period=today
GET /dashboard/performance-details?period=this_week
GET /dashboard/performance-details
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Zone performance details retrieved successfully",
    "data": {
        "zones": [
            {
                "rank": 1,
                "zoneId": "Zone_A",
                "zoneName": "Zone_A",
                "conversionRate": 33,
                "dwellTime": "0 phút",
                "color": "#0d9488"
            }
        ],
        "total": 1,
        "lastUpdated": "2026-04-04T14:48:46.171Z"
    },
    "meta": {}
}
```

Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| zones | array | Mảng chi tiết hiệu suất từng zone |
| zones[].rank | number | Thứ hạng zone theo lượt truy cập |
| zones[].zoneId | string | ID của zone |
| zones[].zoneName | string | Tên zone |
| zones[].conversionRate | number | Tỷ lệ chuyển đổi theo zone (phần trăm) |
| zones[].dwellTime | string | Thời gian dừng trung bình của zone (phút) |
| zones[].color | string | Màu sắc hiển thị riêng cho zone |
| total | number | Tổng số zone được trả về |
| lastUpdated | string | Thời điểm cập nhật dữ liệu (ISO 8601 format) |

## 3. Area Management

### 3.1 Get Area Management Metrics

GET /area-management/kpis

Description: Lấy dữ liệu quản lý khu vực theo lọc chi nhánh, khu vực và khoảng thời gian. Phù hợp cho màn hình quản lý khu vực với Tổng lưu lượng ngày, Số khách hiện tại, Thời gian dừng TB và Hiệu suất khu vực.

Query Parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| location_id | string | No | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả locations. |
| zone_id | string | No | Zone ID để lọc khu vực cụ thể. Nếu không có, lấy tất cả khu vực. |
| period | string | No | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, `this_week`, `last_month`, `this_month`, `last_year`, `this_year` |

Example Request:

```
GET /area-management/kpis?location_id=LOC_TEST_001&period=this_week
GET /area-management/kpis?location_id=LOC_TEST_001&zone_id=zone_001&period=today
GET /area-management/kpis?period=last_month
GET /area-management/kpis
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Area management metrics retrieved successfully",
    "data": {
        "totalDailyTraffic": {
            "value": 1,
            "previous": 0,
            "diff": 1,
            "percentChange": 0,
            "trend": "up"
        },
        "currentCustomers": {
            "value": 0
        },
        "averageStopTime": {
            "value": 4,
            "previous": 0,
            "diff": 4,
            "percentChange": 0,
            "trend": "up"
        },
        "areaPerformance": {
            "value": 25,
            "previous": 0,
            "diff": 25,
            "percentChange": 0,
            "trend": "up"
        },
        "lastUpdated": "2026-04-05T09:47:33.710Z"
    },
    "meta": {}
}
```

Response Fields:

| Field | Type | Description |
|-------|------|-------------|
| totalDailyTraffic | object | Tổng lưu lượng trong khoảng thời gian, bao gồm giá trị hiện tại và so sánh với kỳ trước |
| currentCustomers  | object | Số khách hiện tại đang còn active (sessions chưa có exit_time)                          |
| averageStopTime   | object | Thời gian dừng trung bình (phút), bao gồm so sánh với kỳ trước                          |
| areaPerformance   | object | Hiệu suất khu vực (%), bao gồm so sánh với kỳ trước                                     |
| lastUpdated       | string | Thời điểm cập nhật dữ liệu (ISO 8601 format)                                            |
| value         | number | Giá trị hiện tại                   |
| previous      | number | Giá trị của khoảng thời gian trước |
| diff          | number | Chênh lệch giữa hiện tại và trước  |
| percentChange | number | % thay đổi so với trước            |
| trend         | string | Xu hướng: `up`, `down`, `same`     |
| value | number | Số khách hiện tại |

### 3.2 Get Hourly Area Traffic

GET /area-management/hourly-traffic

Description: Lấy lưu lượng biến động theo giờ (hourly traffic) của khu vực, lọc theo chi nhánh (location_id), khu vực (zone_id) và khoảng thời gian (period). Dữ liệu trả về số lượt truy cập theo từng giờ.

Query Parameters:

| Parameter   | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| location_id | string | No       | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả |
| zone_id     | string | No       | Zone ID để lọc khu vực cụ thể. Nếu không có, lấy tất cả khu vực             |
| period      | string | No       | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, ...         |

Example Request:

```
GET /area-management/hourly-traffic?location_id=LOC_TEST_001&period=this_week
GET /area-management/hourly-traffic?location_id=LOC_TEST_001&zone_id=ZONE_PHONE_633134&period=today
GET /area-management/hourly-traffic?period=last_month
GET /area-management/hourly-traffic
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Hourly traffic retrieved successfully",
    "data": [
        { "hour": "2026-04-05 09:00", "count": 1 }
    ],
    "meta": {}
}
```

Response Fields:

| Field | Type   | Description                                 |
|-------|--------|---------------------------------------------|
| hour  | string | Giờ (theo định dạng YYYY-MM-DD HH:00)       |
| count | number | Số lượt truy cập khu vực trong giờ đó        |

> Ví dụ thực tế: Nếu dữ liệu session như sau (zone_id=ZONE_PHONE_633134, location_id=LOC_TEST_001, entry_time=2026-04-05T02:10:00.000Z),
> thì trả về: `[ { "hour": "2026-04-05 09:00", "count": 1 } ]` nếu server đặt timezone +07:00.

### 3.3 Get Area Movement Paths

GET /area-management/movement-paths

Description: Lấy danh sách các tuyến đường di chuyển phổ biến giữa các khu vực (zones) trong cửa hàng, kèm theo độ tin cậy (tỷ lệ phần trăm số lượt di chuyển trên tổng số lượt vào zone xuất phát). Có thể lọc theo location_id, zone_id xuất phát, zone_id đích và khoảng thời gian.

Query Parameters:

| Parameter   | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| location_id | string | No       | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả |
| from_zone_id| string | No       | Zone ID xuất phát. Nếu không có, lấy tất cả                                 |
| to_zone_id  | string | No       | Zone ID đích. Nếu không có, lấy tất cả                                      |
| period      | string | No       | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, ...         |

Example Request:

```
GET /area-management/movement-paths?location_id=LOC_TEST_001&period=today
GET /area-management/movement-paths?location_id=LOC_TEST_001&from_zone_id=zone_001&period=this_week
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Movement paths retrieved successfully",
    "data": [
        {
            "from": "Lối vào chính",
            "to": "Quầy thanh toán",
            "fromZoneId": "zone_001",
            "toZoneId": "zone_002",
            "confidence": 45.8
        },
        {
            "from": "Lối vào chính",
            "to": "Khu vực giảm giá",
            "fromZoneId": "zone_001",
            "toZoneId": "zone_003",
            "confidence": 12.3
        }
    ],
    "meta": {}
}
```

Response Fields:

| Field       | Type    | Description                                                      |
|-------------|---------|------------------------------------------------------------------|
| from        | string  | Tên zone xuất phát                                               |
| to          | string  | Tên zone đích                                                    |
| fromZoneId  | string  | ID zone xuất phát                                                |
| toZoneId    | string  | ID zone đích                                                     |
| confidence  | number  | Độ tin cậy (tỷ lệ % số lượt di chuyển trên tổng lượt vào from)  |

> Ví dụ: "Lối vào chính → Quầy thanh toán" có confidence 45.8% nghĩa là 45.8% lượt vào Lối vào chính sẽ đi tiếp đến Quầy thanh toán.

### 3.4 Get Area Zone Details

GET /area-management/zone-details

Description: Lấy trạng thái chi tiết từng khu vực (zone) gồm: Tên khu vực, Camera ID, Số Người Hiện Tại, Số Người Hôm Nay, Số Lượng So Với Hôm Qua, Thời Gian Dừng TB. Có thể lọc theo location_id và period.

Query Parameters:

| Parameter   | Type   | Required | Description                                                                 |
|-------------|--------|----------|-----------------------------------------------------------------------------|
| location_id | string | No       | Location ID của chi nhánh (ví dụ: `LOC_TEST_001`). Nếu không có, lấy tất cả |
| period      | string | No       | Khoảng thời gian: `today` (mặc định), `yesterday`, `last_week`, ...         |

Example Request:

```
GET /area-management/zone-details?location_id=LOC_TEST_001&period=today
GET /area-management/zone-details?period=last_week
```

Response (200 OK):

```json
{
    "status": "success",
    "code": 200,
    "message": "Zone details retrieved successfully",
    "data": [
        {
            "zoneId": "ZONE_PHONE_633134",
            "zoneName": "Smartphone Display",
            "cameraId": "69d21511280d7133034e1b7e",
            "currentCount": 0,
            "todayCount": 1,
            "diff": 1,
            "avgDwellTime": 4
        },
        {
            "zoneId": "ZONE_LAPTOP_633134",
            "zoneName": "Laptop Shelf",
            "cameraId": "69d21511280d7133034e1b7e",
            "currentCount": 0,
            "todayCount": 1,
            "diff": 1,
            "avgDwellTime": 8
        },
        {
            "zoneId": "ZONE_CHECKOUT_633134",
            "zoneName": "Checkout Counter",
            "cameraId": "69d21511280d7133034e1b7f",
            "currentCount": 0,
            "todayCount": 2,
            "diff": 2,
            "avgDwellTime": 6
        }
    ],
    "meta": {}
}
```

Response Fields:

| Field         | Type    | Description                                             |
|---------------|---------|---------------------------------------------------------|
| zoneId        | string  | ID của khu vực (zone)                                   |
| zoneName      | string  | Tên khu vực                                             |
| cameraId      | string  | Camera ID gắn với khu vực                               |
| currentCount  | number  | Số người hiện tại đang ở trong khu vực                  |
| todayCount    | number  | Tổng số lượt vào khu vực trong ngày (hoặc period)       |
| diff          | number  | Chênh lệch lượt vào so với hôm qua (hoặc kỳ trước)      |
| avgDwellTime  | number  | Thời gian dừng trung bình (phút) trong khu vực          |

## 4. Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

Last Updated: {{Date}}  
By: SpaceLens Team

## How to use this for the team

Keep this file in your root directory as API.md.

When someone finishes a feature (for example, Heatmaps), they go to Section 2, copy the template, and fill in the details.

Commit the changes to Git.