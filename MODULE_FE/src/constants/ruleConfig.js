import { Users, MapPin, BarChart3 } from "lucide-react";

// Metric options — khớp với metric_name trong CustomerCareRule schema
const METRIC_OPTIONS = [
  { value: "total_sessions",          label: "Tổng số lượt ghé",          unit: "lượt" },
  { value: "days_since_last_visit",   label: "Số ngày chưa ghé",           unit: "ngày" },
  { value: "days_since_join",         label: "Số ngày kể từ khi tham gia", unit: "ngày" },
  { value: "visits_last_30_days",     label: "Lượt ghé trong 30 ngày",     unit: "lượt" },
  { value: "dwell_time",              label: "Thời gian dừng",             unit: "giây" },
];

const OPERATOR_OPTIONS = [">", "<", ">=", "<="];

// ZONE_OPTIONS được lấy động từ DB — không hardcode ở đây
// Truyền zones từ Redux state xuống RuleForm qua prop

const CATEGORIES = {
  RETENTION: {
    id: "retention",
    label: "Hội viên",
    icon: Users,
    iconClass: "text-indigo-500",
    valuePlaceholder: "Ví dụ: 30",
  },
  ZONE: {
    id: "zone",
    label: "Khu vực",
    icon: MapPin,
    iconClass: "text-teal-500",
    valuePlaceholder: "Ví dụ: 30",
  },
  REVENUE: {
    id: "revenue",
    label: "Doanh thu",
    icon: BarChart3,
    iconClass: "text-amber-500",
    valuePlaceholder: "Ví dụ: 50",
  },
};

export { CATEGORIES, METRIC_OPTIONS, OPERATOR_OPTIONS };
