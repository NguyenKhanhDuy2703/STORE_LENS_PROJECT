import { Users, MapPin, BarChart3, Plus } from "lucide-react";
const METRIC_OPTIONS = [
  { value: "total_visitors", label: "Total Visitors", unit: "visitors/day" },
  { value: "avg_dwell_time", label: "Average Dwell Time", unit: "minutes" },
  { value: "avg_basket_value", label: "Average Basket Value", unit: "VND" },
];

const OPERATOR_OPTIONS = [">", "<", "=", ">=", "<="];
const ZONE_OPTIONS = [
  { zoneId: "zone_a", zoneName: "Vùng A (gần cửa ra vào)" },
  { zoneId: "zone_b", zoneName: "Vùng B (khu vực máy tập cardio)" },
  { zoneId: "zone_c", zoneName: "Vùng C (khu vực máy tập tạ)" },
];

const CATEGORIES = {
  RETENTION: {
    id: "retention",
    label: "Hội viên",
    icon: Users,
    iconClass: "text-indigo-500",
    valuePlaceholder: "Ví dụ: 8",
    actionOptions: [
      "Nhắc lịch tập qua Zalo",
      "Gọi điện tư vấn lộ trình tập",
      "Tặng ưu đãi gói PT cá nhân",
    ],
  },
  ZONE: {
    id: "zone",
    label: "Khu vực",
    icon: MapPin,
    iconClass: "text-teal-500",
    valuePlaceholder: "Ví dụ: 20",
    actionOptions: [
      "Thông báo quản lý",
      "Điều phối thêm nhân sự",
      "Mở thêm quầy phục vụ",
    ],
  },
  REVENUE: {
    id: "revenue",
    label: "Doanh thu ",
    icon: BarChart3,
    iconClass: "text-amber-500",
    valuePlaceholder: "Ví dụ: 5000000",
    actionOptions: [
      "Phân tệp VIP",
      "Phân tệp Tiềm năng",
      "Phân tệp Cần kích hoạt lại",
    ],
  },
};
export { CATEGORIES, METRIC_OPTIONS, OPERATOR_OPTIONS , ZONE_OPTIONS };