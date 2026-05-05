# Implementation Plan: Invoice Ingestion API

## Overview

Triển khai ba endpoint RESTful (`POST /`, `GET /`, `GET /:eventCode`) cho `business-event` theo pattern Controller → Service → Schema hiện có của dự án. Schema `businessEvent.schema.js` đã có sẵn — không sửa. Các file cần tạo: service, controller, routes, và cập nhật index route.

## Tasks

- [x] 1. Tạo Business Event Service
  - Tạo file `MODULE_BE/src/service/businessEvent.service.js`
  - Implement `upsertBusinessEvent(data)`: dùng `findOneAndUpdate` với `{ upsert: true, new: true, runValidators: true }` theo `event_code`
  - Implement `getBusinessEvents({ locationId, startDate, endDate, status })`: build filter động, `find(query).sort({ date: -1 })`
  - Implement `getBusinessEventDetail(eventCode)`: `findOne({ event_code: eventCode })`, ném `createError(404, 'Invoice not found')` nếu không tìm thấy
  - Import `BusinessEvent` từ `../schemas/businessEvent.schema`
  - Export ba functions theo pattern của `dashboard.service.js`
  - _Requirements: 1.1, 1.2, 1.6, 1.7, 1.8, 2.1, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2_

  - [ ]* 1.1 Viết property test cho upsert idempotency (Property 1)
    - **Property 1: Upsert idempotency** — POST cùng `event_code` hai lần → đúng 1 bản ghi trong DB, data phản ánh lần gửi thứ hai
    - Dùng `fc.record({ location_id, event_code, date, total_amount, discount })` với `mongodb-memory-server`
    - Tag: `// Feature: invoice-ingestion-api, Property 1: Upsert idempotency`
    - **Validates: Requirements 1.1, 1.6**

  - [ ]* 1.2 Viết property test cho upsert round-trip (Property 2)
    - **Property 2: Upsert round-trip** — POST payload → `getBusinessEventDetail(event_code)` → tất cả fields khớp, `event_details` đúng số phần tử và giá trị
    - Dùng `fc.record(...)` với `fc.array(fc.record({ item_name, quantity, unit_price }))` cho `event_details`
    - Tag: `// Feature: invoice-ingestion-api, Property 2: Upsert round-trip`
    - **Validates: Requirements 1.2, 1.7, 3.1, 3.3**

  - [ ]* 1.3 Viết property test cho date range filter (Property 5)
    - **Property 5: Date range filter** — với bất kỳ `startDate`/`endDate` hợp lệ, tất cả kết quả `getBusinessEvents` có `date` trong khoảng `[startDate, endDate]` và không bỏ sót bản ghi nào trong khoảng đó
    - Dùng `fc.tuple(fc.date(), fc.date())` để sinh cặp ngày
    - Tag: `// Feature: invoice-ingestion-api, Property 5: Date range filter`
    - **Validates: Requirements 2.3**

  - [ ]* 1.4 Viết property test cho sort date desc và location filter (Property 4)
    - **Property 4: Sort date desc + location filter** — GET `?locationId=X` trả về chỉ bản ghi có `location_id = X`, mọi cặp liền kề `a.date >= b.date`
    - Dùng `fc.array(fc.record({ location_id: fc.constantFrom('LOC_A', 'LOC_B'), date: fc.date() }))` để seed nhiều locations
    - Tag: `// Feature: invoice-ingestion-api, Property 4: Sort date desc and location filter`
    - **Validates: Requirements 2.1, 2.6**

  - [ ]* 1.5 Viết property test cho status filter (Property 6)
    - **Property 6: Status filter** — GET với `status=X` trả về chỉ bản ghi có `status = X`
    - Dùng `fc.string({ minLength: 1 })` cho status value
    - Tag: `// Feature: invoice-ingestion-api, Property 6: Status filter`
    - **Validates: Requirements 2.4**

- [x] 2. Tạo Business Event Controller
  - Tạo file `MODULE_BE/src/controllers/businessEvent.controller.js`
  - Import `catchAsync` từ `../utils/catchAsync`, `{ success, error }` từ `../utils/response`, `{ StatusCodes }` từ `http-status-codes`
  - Import service functions từ `../service/businessEvent.service`
  - Implement `upsertBusinessEvent`: validate `location_id`, `event_code`, `date` có mặt; validate `date` parse được (`isNaN(new Date(date))`); validate `total_amount >= 0`, `discount >= 0`; validate từng phần tử `event_details` có `quantity >= 0`, `unit_price >= 0`; gọi `service.upsertBusinessEvent(req.body)`
  - Implement `getBusinessEvents`: validate `locationId` query param có mặt; gọi `service.getBusinessEvents(req.query)`
  - Implement `getBusinessEventDetail`: gọi `service.getBusinessEventDetail(req.params.eventCode)`
  - Tất cả functions wrap bằng `catchAsync`, trả về qua `success()` / `error()` theo pattern `flowPatterns.controller.js`
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.1 Viết property test cho validation từ chối giá trị âm (Property 3)
    - **Property 3: Negative values rejected** — payload với ít nhất 1 trường âm (`total_amount`, `discount`, `quantity`, `unit_price`) → controller trả về HTTP 400, không gọi service
    - Dùng `fc.record(...)` với `fc.integer({ max: -1 })` cho trường âm; mock service để verify không được gọi
    - Tag: `// Feature: invoice-ingestion-api, Property 3: Negative values rejected`
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [ ]* 2.2 Viết unit tests cho controller validation
    - Test thiếu `location_id` → 400
    - Test thiếu `event_code` → 400
    - Test thiếu `date` → 400
    - Test `date` không hợp lệ → 400
    - Test thiếu `locationId` trong GET list → 400
    - _Requirements: 1.3, 1.4, 1.5, 2.2, 4.1_

- [x] 3. Checkpoint — Đảm bảo service và controller hoạt động đúng
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Tạo Business Event Routes
  - Tạo file `MODULE_BE/src/routes/businessEvent.routes.js`
  - Import `express`, tạo `router = express.Router()`
  - Import `{ authenticationToken, ALLOWED_ALL }` từ `../middlewares/auth.middleware`
  - Import ba controller functions từ `../controllers/businessEvent.controller`
  - Đăng ký: `POST /` → `authenticationToken, ALLOWED_ALL, upsertBusinessEvent`
  - Đăng ký: `GET /` → `authenticationToken, ALLOWED_ALL, getBusinessEvents`
  - Đăng ký: `GET /:eventCode` → `authenticationToken, ALLOWED_ALL, getBusinessEventDetail`
  - Export `router`
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Đăng ký route vào index
  - Cập nhật `MODULE_BE/src/routes/index.route.js`
  - Thêm `const businessEventRoutes = require('./businessEvent.routes');` vào phần imports
  - Thêm `app.use(\`${version}/business-event\`, businessEventRoutes);` vào hàm `routes()`
  - Đặt sau dòng `flowPatternsRoutes` để nhất quán với thứ tự hiện có
  - _Requirements: 6.1, 6.2_

  - [ ]* 5.1 Viết integration tests cho routes (supertest)
    - Dùng `supertest` + `mongodb-memory-server` để test end-to-end qua HTTP
    - Test POST hợp lệ → 200 với data trả về
    - Test GET list với `locationId` → 200 với array
    - Test GET detail với `eventCode` tồn tại → 200
    - Test GET detail với `eventCode` không tồn tại → 404
    - Test request không có token → 401
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 5.1, 5.2_

- [x] 6. Final checkpoint — Đảm bảo toàn bộ test pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional — có thể bỏ qua để triển khai MVP nhanh hơn
- Schema `businessEvent.schema.js` đã có sẵn — **không sửa**
- Mỗi task tham chiếu requirements cụ thể để đảm bảo traceability
- Property tests dùng `fast-check` (cần cài thêm: `npm install --save-dev fast-check`) + `mongodb-memory-server` (đã có trong devDependencies)
- Pattern tham khảo: controller → `flowPatterns.controller.js`, service → `dashboard.service.js`, routes → `dashboard.routes.js`
