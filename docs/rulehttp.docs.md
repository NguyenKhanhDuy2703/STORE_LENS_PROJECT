# 📋 Quy tắc xử lý HTTP - StoreLens Project

Tài liệu này mô tả các quy tắc chuẩn cho việc xử lý HTTP Request/Response trong hệ thống StoreLens Backend.

---

## 1. Cấu trúc phản hồi chuẩn

### ✅ Success Response

```json
{
  "status": "success",
  "code": 200,
  "message": "Lấy danh sách camera thành công",
  "data": [...],
  "meta": { "total": 100, "page": 1 }  // Tùy chọn
}
```

### ❌ Error Response

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Thiếu trường bắt buộc: camera_id"
}
```

---

## 2. HTTP Status Codes

**Thư viện:** `http-status-codes`

| Code | Tên | Khi nào sử dụng |
|------|-----|-----------------|
| `200` | OK | Truy vấn thành công (GET) |
| `201` | Created | Tạo mới thành công (POST) |
| `204` | No Content | Xóa thành công (DELETE) |
| `400` | Bad Request | Dữ liệu không hợp lệ, thiếu field |
| `401` | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| `403` | Forbidden | Không có quyền truy cập |
| `404` | Not Found | Không tìm thấy tài nguyên |
| `409` | Conflict | Email/Username đã tồn tại |
| `500` | Internal Server Error | Lỗi hệ thống, database |



**Tài liệu này được cập nhật lần cuối:** 10/02/2026  
**Người duy trì:** StoreLens Backend Team