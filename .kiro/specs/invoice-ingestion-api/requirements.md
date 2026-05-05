# Requirements Document

## Introduction

Tính năng này xây dựng một API endpoint trong MODULE_BE (Node.js/Express) để nhận dữ liệu hóa đơn từ cửa hàng và lưu vào collection `BusinessEvent` trong MongoDB theo `businessEventSchema` đã có sẵn. API tuân theo pattern Controller → Service → Schema hiện tại của dự án, hỗ trợ tạo mới và cập nhật hóa đơn (upsert theo `event_code`), truy vấn danh sách và chi tiết hóa đơn theo location, đồng thời đảm bảo xác thực dữ liệu đầu vào và xử lý lỗi nhất quán.

## Glossary

- **Invoice_API**: API endpoint xử lý các yêu cầu HTTP liên quan đến hóa đơn cửa hàng.
- **Invoice_Controller**: Lớp controller xử lý HTTP request/response cho hóa đơn, ủy thác logic nghiệp vụ cho Invoice_Service.
- **Invoice_Service**: Lớp service chứa logic nghiệp vụ cho hóa đơn, tương tác trực tiếp với BusinessEvent_Model.
- **BusinessEvent_Model**: Mongoose model ánh xạ tới collection `BusinessEvent` trong MongoDB, được định nghĩa bởi `businessEventSchema`.
- **event_code**: Mã định danh duy nhất của một hóa đơn trong hệ thống, dùng làm khóa upsert.
- **location_id**: Mã định danh của cửa hàng/địa điểm mà hóa đơn thuộc về.
- **event_details**: Mảng các mục hàng hóa trong hóa đơn, mỗi mục theo `eventDetailSchema`.
- **Upsert**: Thao tác tạo mới bản ghi nếu chưa tồn tại, hoặc cập nhật nếu đã tồn tại (dựa trên `event_code`).

---

## Requirements

### Requirement 1: Tạo mới hoặc cập nhật hóa đơn (Upsert)

**User Story:** As a cửa hàng tích hợp, I want to gửi dữ liệu hóa đơn lên API, so that hóa đơn được lưu vào hệ thống và có thể truy xuất sau này.

#### Acceptance Criteria

1. WHEN một request POST hợp lệ được gửi đến `/api/v1/business-event`, THE Invoice_API SHALL tạo mới hoặc cập nhật bản ghi BusinessEvent trong MongoDB theo `event_code` (upsert).
2. WHEN request POST chứa đầy đủ các trường bắt buộc (`location_id`, `event_code`, `date`), THE Invoice_Service SHALL lưu hóa đơn thành công và trả về bản ghi đã lưu.
3. WHEN request POST thiếu trường `location_id`, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả trường bị thiếu.
4. WHEN request POST thiếu trường `event_code`, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả trường bị thiếu.
5. WHEN request POST thiếu trường `date`, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả trường bị thiếu.
6. WHEN một `event_code` đã tồn tại trong MongoDB và request POST được gửi lại với cùng `event_code`, THE Invoice_Service SHALL cập nhật bản ghi hiện có thay vì tạo bản ghi mới.
7. WHEN trường `event_details` được cung cấp trong request, THE Invoice_Service SHALL lưu toàn bộ mảng các mục hàng hóa theo `eventDetailSchema`.
8. IF lỗi xảy ra trong quá trình lưu vào MongoDB, THEN THE Invoice_Service SHALL ném lỗi để Invoice_Controller xử lý và trả về HTTP 500.

---

### Requirement 2: Truy vấn danh sách hóa đơn theo location

**User Story:** As a quản lý cửa hàng, I want to lấy danh sách hóa đơn theo location, so that tôi có thể xem lịch sử giao dịch của cửa hàng.

#### Acceptance Criteria

1. WHEN một request GET hợp lệ được gửi đến `/api/v1/business-event?locationId=...`, THE Invoice_API SHALL trả về danh sách các hóa đơn thuộc `location_id` tương ứng.
2. WHEN request GET không cung cấp `locationId`, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi yêu cầu `locationId`.
3. WHEN request GET cung cấp tham số `startDate` và `endDate`, THE Invoice_Service SHALL lọc danh sách hóa đơn theo khoảng thời gian của trường `date`.
4. WHEN request GET cung cấp tham số `status`, THE Invoice_Service SHALL lọc danh sách hóa đơn theo giá trị `status`.
5. WHEN không có hóa đơn nào khớp với điều kiện lọc, THE Invoice_API SHALL trả về HTTP 200 với mảng rỗng.
6. THE Invoice_Service SHALL sắp xếp danh sách hóa đơn trả về theo trường `date` giảm dần (mới nhất trước).

---

### Requirement 3: Truy vấn chi tiết một hóa đơn

**User Story:** As a quản lý cửa hàng, I want to xem chi tiết một hóa đơn cụ thể, so that tôi có thể kiểm tra thông tin giao dịch đầy đủ bao gồm các mục hàng hóa.

#### Acceptance Criteria

1. WHEN một request GET hợp lệ được gửi đến `/api/v1/business-event/:eventCode`, THE Invoice_API SHALL trả về thông tin đầy đủ của hóa đơn bao gồm `event_details`.
2. WHEN `eventCode` không tồn tại trong MongoDB, THE Invoice_Service SHALL ném lỗi với HTTP status 404 và thông báo "Invoice not found".
3. WHEN `eventCode` được cung cấp hợp lệ, THE Invoice_Controller SHALL trả về HTTP 200 với dữ liệu hóa đơn đầy đủ.

---

### Requirement 4: Xác thực dữ liệu đầu vào

**User Story:** As a hệ thống, I want to xác thực dữ liệu hóa đơn trước khi lưu, so that chỉ dữ liệu hợp lệ được lưu vào MongoDB.

#### Acceptance Criteria

1. WHEN trường `date` được cung cấp với giá trị không phải định dạng ngày hợp lệ, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả định dạng ngày không hợp lệ.
2. WHEN trường `total_amount` được cung cấp với giá trị âm, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả giá trị không hợp lệ.
3. WHEN trường `discount` được cung cấp với giá trị âm, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả giá trị không hợp lệ.
4. WHEN một phần tử trong `event_details` có `quantity` nhỏ hơn 0, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả giá trị không hợp lệ.
5. WHEN một phần tử trong `event_details` có `unit_price` nhỏ hơn 0, THE Invoice_Controller SHALL trả về HTTP 400 với thông báo lỗi mô tả giá trị không hợp lệ.

---

### Requirement 5: Xác thực quyền truy cập

**User Story:** As a hệ thống bảo mật, I want to yêu cầu xác thực token cho tất cả các endpoint hóa đơn, so that chỉ người dùng được phép mới có thể truy cập và thao tác dữ liệu hóa đơn.

#### Acceptance Criteria

1. THE Invoice_API SHALL yêu cầu middleware `authenticationToken` cho tất cả các route của `/api/v1/business-event`.
2. WHEN request không có token xác thực hợp lệ, THE Invoice_API SHALL trả về HTTP 401 trước khi xử lý logic nghiệp vụ.
3. WHERE cấu hình cho phép tất cả vai trò truy cập (`ALLOWED_ALL`), THE Invoice_API SHALL cho phép mọi người dùng đã xác thực thực hiện thao tác đọc và ghi hóa đơn.

---

### Requirement 6: Đăng ký route vào hệ thống

**User Story:** As a developer, I want to đăng ký route hóa đơn vào index route, so that API endpoint có thể được truy cập thông qua prefix `/api/v1/business-event`.

#### Acceptance Criteria

1. THE Invoice_API SHALL được đăng ký trong `src/routes/index.route.js` với prefix `${version}/business-event`.
2. THE Invoice_API SHALL sử dụng `version` từ config (`/api/v1`) nhất quán với các route hiện có trong hệ thống.
