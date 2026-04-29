# Implementation Plan: FP-Growth Flow Mining

## Tổng quan

Tính năng **FP-Growth Flow Mining** khai phá các mẫu di chuyển của khách hàng qua các zone bằng thuật toán FP-Growth. Kiến trúc gồm hai lớp:

1. **Python Script** (`flow_miner.py`): Kết nối MongoDB, trích xuất zone sequences, chạy FP-Growth, xuất JSON ra stdout
2. **Node.js Layer**: Spawn Python script, parse output, lưu vào MongoDB, expose REST API

Thứ tự triển khai: Python script → Service → Controller → Routes.

---

## Tasks

- [x] 1. Triển khai Python Script và Dependencies
  - [x] 1.1 Tạo file `MODULE_BE/scripts/requirements.txt` với các dependencies cần thiết
    - Thêm `pymongo==4.7.2`, `mlxtend==0.23.1`, `pandas==2.2.2`, `python-dotenv==1.0.1`
    - _Requirements: 3.5_

  - [x] 1.2 Implement class `FPGrowthMiner` trong `MODULE_BE/scripts/flow_miner.py`
    - Implement `__init__(location_id, min_support, min_confidence, min_lift)`: Kết nối MongoDB qua `MONGODB_URI` env var
    - Implement `fetch_sequences()`: Query sessions theo location_id, trích xuất zone_sequence đã sort theo entry_time, lọc bỏ sequences có độ dài <= 1
    - Implement `preprocess(sequences)`: Dùng `TransactionEncoder` để encode sequences thành DataFrame boolean
    - Implement `run()`: Điều phối pipeline (fetch → preprocess → fpgrowth → association_rules → filter lift → format_final), trả về dict `{"patterns": [...], "error": null}`
    - Implement `format_final(rules)`: Chuyển DataFrame rules thành list pattern objects, convert frozenset → list[str]
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.3 Viết property test cho `fetch_sequences` - lọc theo location_id
    - **Property 1: Lọc session theo location_id**
    - **Validates: Requirements 1.2**

  - [ ]* 1.4 Viết property test cho `preprocess` - sắp xếp theo entry_time
    - **Property 2: Zone sequence được sắp xếp theo entry_time**
    - **Validates: Requirements 1.3**

  - [ ]* 1.5 Viết property test cho `preprocess` - lọc sequences ngắn
    - **Property 3: Lọc bỏ session có ít hơn 2 zones**
    - **Validates: Requirements 1.4**

  - [ ]* 1.6 Viết property test cho FP-Growth - tính đơn điệu của min_support
    - **Property 4: Tăng min_support không làm tăng số frequent itemsets**
    - **Validates: Requirements 2.2**

  - [ ]* 1.7 Viết property test cho filter lift
    - **Property 5: Tất cả rules trong output đều thỏa min_lift**
    - **Validates: Requirements 2.4**

  - [ ]* 1.8 Viết property test cho `format_final` - validate JSON schema
    - **Property 6: Output luôn là valid JSON với đầy đủ trường bắt buộc**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 1.9 Implement CLI interface và error handling
    - Parse command-line arguments: `<location_id> <min_support> <min_confidence> <min_lift>`
    - Xử lý các trường hợp lỗi: không có session, không có frequent itemset, lỗi MongoDB, lỗi thuật toán
    - Xuất JSON ra stdout theo format `{"patterns": [...], "error": null}`
    - _Requirements: 1.5, 2.5, 2.6, 3.5_

  - [ ]* 1.10 Viết unit tests cho Python script
    - Test empty sequences → `{"patterns": [], "error": null}`
    - Test no frequent itemsets → `{"patterns": [], "error": null}`
    - Test exception trong run → `{"patterns": [], "error": "..."}`
    - Test CLI argument parsing

- [x] 2. Checkpoint - Kiểm tra Python script hoạt động độc lập
  - Đảm bảo Python script có thể chạy độc lập với CLI arguments
  - Verify output JSON format đúng
  - Hỏi user nếu có vấn đề phát sinh

- [x] 3. Triển khai Node.js Service Layer
  - [x] 3.1 Implement `saveFlowPatterns` trong `MODULE_BE/src/service/flowPatterns.service.js`
    - Spawn Python script với `child_process.spawn`, truyền locationId và các tham số
    - Thu thập stdout và parse JSON
    - Nếu `patterns` không rỗng: deleteMany theo location_id, gán location_id + update_at, insertMany patterns mới
    - Xử lý lỗi: Python exit code != 0, invalid JSON, error field != null
    - Trả về mảng FlowPattern documents đã lưu
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.2 Viết property test cho `saveFlowPatterns` - thay thế patterns cũ
    - **Property 7: Save patterns thay thế hoàn toàn patterns cũ**
    - **Validates: Requirements 4.3**

  - [ ]* 3.3 Viết property test cho `saveFlowPatterns` - gán location_id và update_at
    - **Property 8: Mỗi pattern được lưu đều có location_id và update_at đúng**
    - **Validates: Requirements 4.4**

  - [x] 3.4 Implement `getFlowPatterns` trong `MODULE_BE/src/service/flowPatterns.service.js`
    - Query `FlowPatterns.find({ location_id }).sort({ create_at: -1 })`
    - Trả về mảng FlowPattern documents
    - _Requirements: 4.7_

  - [ ]* 3.5 Viết property test cho `getFlowPatterns` - sắp xếp theo create_at
    - **Property 9: getFlowPatterns trả về kết quả theo thứ tự create_at giảm dần**
    - **Validates: Requirements 4.7**

  - [ ]* 3.6 Viết unit tests cho service layer
    - Mock spawn trả về valid JSON → verify deleteMany + insertMany
    - Mock spawn trả về `{error: "..."}` → verify throw Error
    - Mock spawn exit code 1 → verify throw Error
    - Mock spawn trả về `{patterns: []}` → verify không gọi deleteMany
    - Mock find().sort() → verify trả về đúng kết quả

- [x] 4. Triển khai Node.js Controller Layer
  - [x] 4.1 Implement `analyzeFlowPatternsController` trong `MODULE_BE/src/controllers/flowPatterns.controller.js`
    - Lấy locationId từ `req.params`
    - Lấy `{ minSupport, minConfidence, minLift }` từ `req.body` (optional)
    - Gọi `flowPatternsService.saveFlowPatterns(...)`
    - Trả về `success({ res, data, message: "Flow patterns analyzed successfully", code: 200 })`
    - Xử lý lỗi: locationId thiếu → HTTP 400, service throws → catchAsync trả về 500
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 6.1, 6.2_

  - [x] 4.2 Implement `getFlowPatternsController` trong `MODULE_BE/src/controllers/flowPatterns.controller.js`
    - Lấy locationId từ `req.params`
    - Gọi `flowPatternsService.getFlowPatterns(...)`
    - Trả về `success({ res, data, message: "Flow patterns retrieved successfully", code: 200 })`
    - Xử lý lỗi: locationId thiếu → HTTP 400
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.3 Viết property test cho controller - default values
    - **Property 10: Default values được áp dụng khi thiếu tham số**
    - **Validates: Requirements 6.3, 6.4, 6.5**

  - [ ]* 4.4 Viết unit tests cho controller layer
    - Test missing locationId → verify HTTP 400
    - Test service success → verify HTTP 200 với data
    - Test service throws → verify catchAsync trả về 500

- [x] 5. Triển khai Routes và Integration
  - [x] 5.1 Tạo file `MODULE_BE/src/routes/flowPatterns.routes.js`
    - Định nghĩa route `POST /analyze/:locationId` → `analyzeFlowPatternsController`
    - Định nghĩa route `GET /:locationId` → `getFlowPatternsController`
    - Export router
    - _Requirements: 5.1, 5.3_

  - [x] 5.2 Update `MODULE_BE/src/routes/index.route.js`
    - Import `flowPatternsRoutes`
    - Mount route: `app.use(\`\${version}/flow-patterns\`, flowPatternsRoutes)`
    - _Requirements: 5.7_

  - [ ]* 5.3 Viết integration tests cho API endpoints
    - Test POST /analyze/:locationId với valid params → verify HTTP 200
    - Test POST /analyze/:locationId với missing locationId → verify HTTP 400
    - Test GET /:locationId → verify HTTP 200 với data
    - Test GET /:locationId với missing locationId → verify HTTP 400

- [x] 6. Checkpoint cuối - Đảm bảo tất cả tests pass
  - Chạy tất cả tests (Python + Node.js)
  - Verify API endpoints hoạt động đúng
  - Hỏi user nếu có vấn đề phát sinh

---

## Ghi chú

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai nhanh MVP
- Mỗi task tham chiếu đến requirements cụ thể để đảm bảo traceability
- Checkpoints đảm bảo validation từng bước
- Property tests validate các đặc tính đúng đắn phổ quát
- Unit tests validate các ví dụ cụ thể và edge cases
- Code phải ngắn gọn, có comment, theo pattern hiện tại của dự án (catchAsync, success/error utils, StatusCodes)
