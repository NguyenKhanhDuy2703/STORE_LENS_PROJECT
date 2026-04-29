# Requirements Document

## Introduction

Tính năng **FP-Growth Flow Mining** sử dụng thuật toán FP-Growth (thông qua thư viện `mlxtend`) để khai phá các mẫu di chuyển (flow patterns) của khách hàng qua các zone trong một location. Hệ thống trích xuất `zone_sequence` từ dữ liệu session trong MongoDB, chạy phân tích FP-Growth qua Python script, lưu kết quả (frequent patterns và association rules) vào collection `FlowPatterns`, và expose kết quả qua REST API để frontend hoặc các hệ thống khác có thể truy vấn.

## Glossary

- **FP-Growth_Miner**: Python script (`MODULE_BE/scripts/flow_miner.py`) thực hiện khai phá dữ liệu bằng thuật toán FP-Growth.
- **Flow_Pattern**: Một association rule hoặc frequent itemset mô tả mẫu di chuyển của khách hàng qua các zone, bao gồm `antecedent_zones`, `consequent_zones`, `support_score`, `confidence_score`, và `lift_score`.
- **Zone_Sequence**: Danh sách các `zone_id` theo thứ tự thời gian mà một khách hàng đã đi qua trong một session.
- **Session**: Một lần ghé thăm của khách hàng tại một location, được lưu trong collection `Session` của MongoDB.
- **Location**: Một địa điểm kinh doanh được định danh bằng `location_id`.
- **FlowPatterns_Service**: Node.js service (`flowPatterns.service.js`) điều phối việc gọi Python script và lưu/truy vấn kết quả từ MongoDB.
- **FlowPatterns_Controller**: Node.js controller (`flowPatterns.controller.js`) xử lý HTTP request và trả về HTTP response.
- **FlowPatterns_API**: REST API endpoint được mount tại `/api/v1/flow-patterns`.
- **Support_Score**: Tỷ lệ số session chứa một pattern so với tổng số session.
- **Confidence_Score**: Xác suất có điều kiện: nếu khách hàng đã đi qua `antecedent_zones` thì sẽ đi qua `consequent_zones`.
- **Lift_Score**: Độ mạnh của association rule so với sự xuất hiện ngẫu nhiên (lift > 1 là có ý nghĩa).
- **min_support**: Ngưỡng tối thiểu của support để một itemset được coi là frequent (mặc định: 0.1).
- **min_confidence**: Ngưỡng tối thiểu của confidence để một rule được giữ lại (mặc định: 0.5).
- **min_lift**: Ngưỡng tối thiểu của lift để một rule được giữ lại (mặc định: 1.0).

---

## Requirements

### Requirement 1: Trích xuất Zone Sequence từ MongoDB

**User Story:** Là một data analyst, tôi muốn hệ thống tự động trích xuất chuỗi di chuyển zone của khách hàng từ dữ liệu session, để có dữ liệu đầu vào sạch cho thuật toán FP-Growth.

#### Acceptance Criteria

1. WHEN `FP-Growth_Miner` được khởi tạo với một `location_id` hợp lệ, THE `FP-Growth_Miner` SHALL kết nối tới MongoDB bằng URI được cấu hình trong biến môi trường `MONGODB_URI`.
2. WHEN `FP-Growth_Miner` thực hiện truy vấn dữ liệu, THE `FP-Growth_Miner` SHALL chỉ lấy các session có `location_id` khớp với tham số đầu vào.
3. WHEN một session được truy vấn, THE `FP-Growth_Miner` SHALL trích xuất danh sách `zone_id` từ trường `zone_sequence` theo thứ tự `entry_time` tăng dần.
4. IF một session có `zone_sequence` rỗng hoặc chỉ chứa một zone duy nhất, THEN THE `FP-Growth_Miner` SHALL loại bỏ session đó khỏi tập dữ liệu đầu vào.
5. IF không có session nào thỏa mãn điều kiện lọc, THEN THE `FP-Growth_Miner` SHALL xuất ra stdout một JSON object với trường `patterns` là mảng rỗng và trường `error` là `null`.

---

### Requirement 2: Chạy thuật toán FP-Growth và sinh Association Rules

**User Story:** Là một data analyst, tôi muốn hệ thống chạy thuật toán FP-Growth trên dữ liệu zone sequence, để khai phá các mẫu di chuyển có ý nghĩa thống kê.

#### Acceptance Criteria

1. WHEN `FP-Growth_Miner` nhận được tập zone sequences đã được tiền xử lý, THE `FP-Growth_Miner` SHALL sử dụng `mlxtend.preprocessing.TransactionEncoder` để mã hóa dữ liệu thành ma trận boolean.
2. WHEN `FP-Growth_Miner` chạy thuật toán, THE `FP-Growth_Miner` SHALL gọi `mlxtend.frequent_patterns.fpgrowth` với tham số `min_support` nhận từ đầu vào (mặc định: 0.1) và `use_colnames=True`.
3. WHEN `FP-Growth_Miner` sinh association rules, THE `FP-Growth_Miner` SHALL gọi `mlxtend.frequent_patterns.association_rules` với metric `confidence` và `min_threshold` nhận từ đầu vào (mặc định: 0.5).
4. WHEN association rules được sinh ra, THE `FP-Growth_Miner` SHALL lọc và chỉ giữ lại các rules có `lift` lớn hơn hoặc bằng `min_lift` nhận từ đầu vào (mặc định: 1.0).
5. IF `mlxtend` không tìm thấy frequent itemset nào với `min_support` đã cho, THEN THE `FP-Growth_Miner` SHALL xuất ra stdout một JSON object với trường `patterns` là mảng rỗng và trường `error` là `null`.
6. IF xảy ra lỗi trong quá trình chạy thuật toán, THEN THE `FP-Growth_Miner` SHALL xuất ra stdout một JSON object với trường `error` chứa thông báo lỗi dạng chuỗi và trường `patterns` là mảng rỗng.

---

### Requirement 3: Định dạng và xuất kết quả ra stdout

**User Story:** Là một Node.js service, tôi muốn nhận kết quả khai phá dưới dạng JSON chuẩn qua stdout, để có thể parse và lưu vào MongoDB mà không cần xử lý thêm.

#### Acceptance Criteria

1. WHEN `FP-Growth_Miner` hoàn thành phân tích, THE `FP-Growth_Miner` SHALL xuất ra stdout một JSON object hợp lệ (parseable bởi `JSON.parse`) chứa trường `patterns` là một mảng các pattern object.
2. THE `FP-Growth_Miner` SHALL đảm bảo mỗi pattern object trong mảng `patterns` chứa đầy đủ các trường: `pattern_type` (chuỗi), `antecedent_zones` (mảng chuỗi), `consequent_zones` (mảng chuỗi), `support_score` (số thực), `confidence_score` (số thực), `lift_score` (số thực).
3. THE `FP-Growth_Miner` SHALL đặt giá trị `pattern_type` là `"association_rule"` cho tất cả các rule được sinh ra từ `association_rules`.
4. WHEN `FP-Growth_Miner` xuất kết quả, THE `FP-Growth_Miner` SHALL chuyển đổi `frozenset` của `mlxtend` thành mảng chuỗi (`list`) trước khi serialize sang JSON.
5. THE `FP-Growth_Miner` SHALL nhận `location_id`, `min_support`, `min_confidence`, và `min_lift` dưới dạng tham số dòng lệnh (command-line arguments) khi được gọi từ Node.js.

---

### Requirement 4: Node.js Service - Gọi Python Script và Lưu Kết Quả

**User Story:** Là một backend developer, tôi muốn Node.js service tự động gọi Python script và lưu kết quả vào MongoDB, để quá trình phân tích được tích hợp liền mạch vào hệ thống.

#### Acceptance Criteria

1. WHEN `FlowPatterns_Service` nhận yêu cầu `saveFlowPatterns` với `locationId` hợp lệ, THE `FlowPatterns_Service` SHALL gọi `FP-Growth_Miner` thông qua Node.js `child_process.spawn` với đường dẫn script và các tham số cần thiết.
2. WHEN `FP-Growth_Miner` xuất dữ liệu ra stdout, THE `FlowPatterns_Service` SHALL thu thập toàn bộ output từ stdout và parse thành JSON object.
3. WHEN JSON output được parse thành công và trường `patterns` là mảng không rỗng, THE `FlowPatterns_Service` SHALL xóa tất cả các `FlowPattern` cũ có cùng `location_id` trước khi lưu kết quả mới.
4. WHEN `FlowPatterns_Service` lưu patterns mới, THE `FlowPatterns_Service` SHALL gán `location_id` và `update_at` (thời điểm hiện tại) cho mỗi pattern trước khi gọi `FlowPatterns.insertMany`.
5. IF `FP-Growth_Miner` trả về JSON với trường `error` khác `null`, THEN THE `FlowPatterns_Service` SHALL ném ra một Error object với thông báo từ trường `error` đó.
6. IF `child_process.spawn` thất bại hoặc Python script thoát với exit code khác 0, THEN THE `FlowPatterns_Service` SHALL ném ra một Error object với thông báo mô tả lỗi từ stderr.
7. WHEN `FlowPatterns_Service` nhận yêu cầu `getFlowPatterns` với `locationId` hợp lệ, THE `FlowPatterns_Service` SHALL truy vấn collection `FlowPatterns` theo `location_id` và trả về mảng kết quả được sắp xếp theo `create_at` giảm dần.

---

### Requirement 5: REST API - Phân tích và Truy vấn Flow Patterns

**User Story:** Là một frontend developer, tôi muốn có REST API để kích hoạt phân tích và truy vấn kết quả flow patterns, để hiển thị thông tin khai phá dữ liệu cho người dùng cuối.

#### Acceptance Criteria

1. WHEN `FlowPatterns_API` nhận HTTP POST request tới `/api/v1/flow-patterns/analyze/:locationId`, THE `FlowPatterns_Controller` SHALL gọi `FlowPatterns_Service.saveFlowPatterns` với `locationId` từ route params và các params tùy chọn từ request body.
2. WHEN `FlowPatterns_Service.saveFlowPatterns` hoàn thành thành công, THE `FlowPatterns_Controller` SHALL trả về HTTP response với status code 200 và JSON body chứa trường `data` là danh sách patterns đã lưu.
3. WHEN `FlowPatterns_API` nhận HTTP GET request tới `/api/v1/flow-patterns/:locationId`, THE `FlowPatterns_Controller` SHALL gọi `FlowPatterns_Service.getFlowPatterns` với `locationId` từ route params.
4. WHEN `FlowPatterns_Service.getFlowPatterns` trả về kết quả, THE `FlowPatterns_Controller` SHALL trả về HTTP response với status code 200 và JSON body chứa trường `data` là mảng flow patterns.
5. IF `locationId` không được cung cấp trong route params, THEN THE `FlowPatterns_Controller` SHALL trả về HTTP response với status code 400 và thông báo lỗi `"Location ID is required"`.
6. IF `FlowPatterns_Service` ném ra lỗi, THEN THE `FlowPatterns_Controller` SHALL để `catchAsync` middleware xử lý và trả về HTTP response với status code 500.
7. THE `FlowPatterns_API` SHALL được mount vào Express application tại prefix `/api/v1/flow-patterns` trong file `index.route.js`.

---

### Requirement 6: Tham số phân tích có thể cấu hình

**User Story:** Là một data analyst, tôi muốn có thể điều chỉnh các ngưỡng `min_support`, `min_confidence`, và `min_lift` khi gọi API phân tích, để linh hoạt trong việc khai phá patterns ở các mức độ khác nhau.

#### Acceptance Criteria

1. WHEN `FlowPatterns_API` nhận HTTP POST request tới `/api/v1/flow-patterns/analyze/:locationId` với body chứa `min_support`, `min_confidence`, hoặc `min_lift`, THE `FlowPatterns_Controller` SHALL truyền các giá trị này xuống `FlowPatterns_Service.saveFlowPatterns`.
2. WHEN `FlowPatterns_Service.saveFlowPatterns` nhận các tham số tùy chọn, THE `FlowPatterns_Service` SHALL truyền chúng làm command-line arguments cho `FP-Growth_Miner`.
3. IF `min_support` không được cung cấp trong request body, THEN THE `FlowPatterns_Service` SHALL sử dụng giá trị mặc định `0.1` khi gọi `FP-Growth_Miner`.
4. IF `min_confidence` không được cung cấp trong request body, THEN THE `FlowPatterns_Service` SHALL sử dụng giá trị mặc định `0.5` khi gọi `FP-Growth_Miner`.
5. IF `min_lift` không được cung cấp trong request body, THEN THE `FlowPatterns_Service` SHALL sử dụng giá trị mặc định `1.0` khi gọi `FP-Growth_Miner`.
