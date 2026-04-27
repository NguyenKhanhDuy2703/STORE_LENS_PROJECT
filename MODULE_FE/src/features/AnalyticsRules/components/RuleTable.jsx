import { Users, MapPin, BarChart3, Trash2, Pencil } from "lucide-react";
import { METRIC_OPTIONS } from "../../../constants/ruleConfig";

const CATEGORIES = {
  RETENTION: { label: "Hội viên",  color: "indigo", icon: Users    },
  ZONE:      { label: "Khu vực",   color: "teal",   icon: MapPin   },
  REVENUE:   { label: "Doanh thu", color: "amber",  icon: BarChart3 },
};

// Lấy label metric từ constants — không hardcode
const getMetricLabel = (metricName) => {
  return METRIC_OPTIONS.find((m) => m.value === metricName)?.label || metricName || "Chỉ số";
};

const buildReadableCondition = (rule) => {
  const metricLabel = getMetricLabel(rule?.logic?.metricName);
  const operator  = rule?.logic?.operator  || "";
  const threshold = rule?.logic?.threshold ?? "";
  const unit      = rule?.logic?.unit ? ` ${rule.logic.unit}` : "";
  return `${metricLabel} ${operator} ${threshold}${unit}`.trim();
};

const RuleTable = ({ rules, onDelete, onToggle, onEdit }) => {
  const isZoneCategory = rules[0]?.category === "zone";

  return (
    <div className="bg-card border border-border rounded-2xl shadow-md overflow-hidden h-full">
      <table className="w-full text-left border-collapse">
        <thead className="border-b border-border">
          <tr>
            <th className="px-6 py-4 border-r border-border">Tên quy tắc</th>
            {isZoneCategory && (
              <th className="px-6 py-4 border-r border-border">Khu vực</th>
            )}
            <th className="px-6 py-4 border-r border-border">Điều kiện</th>
            <th className="px-6 py-4 border-r border-border">Trạng thái</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rules.length === 0 ? (
            <tr>
              <td
                colSpan={isZoneCategory ? 5 : 4}
                className="px-6 py-10 text-center text-muted-foreground italic"
              >
                Chưa có quy tắc nào được thiết lập
              </td>
            </tr>
          ) : (
            rules.map((rule) => {
              const cat = CATEGORIES[rule.category?.toUpperCase()] || CATEGORIES.RETENTION;
              return (
                <tr key={rule.ruleId} className="hover:bg-muted/40 transition-colors">
                  {/* Tên */}
                  <td className="px-6 py-4 border-r border-border">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full bg-${cat.color}-500 shrink-0`} />
                      <p className="font-semibold text-foreground">{rule.ruleName}</p>
                    </div>
                  </td>

                  {/* Zone name — chỉ hiện với category zone */}
                  {isZoneCategory && (
                    <td className="px-6 py-4 border-r border-border">
                      <p className="text-foreground">{rule.zoneName || rule.zoneId || "—"}</p>
                    </td>
                  )}

                  {/* Điều kiện */}
                  <td className="px-6 py-4 border-r border-border">
                    <p className="font-medium text-foreground">{buildReadableCondition(rule)}</p>
                    <p className="text-muted-foreground mt-0.5">Hành động: {rule.action}</p>
                  </td>

                  {/* Toggle */}
                  <td className="px-6 py-4 border-r border-border">
                    <button
                      onClick={() => onToggle(rule.ruleId)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${
                        rule.isActive ? "bg-accent" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          rule.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* Nút Sửa */}
                      <button
                        onClick={() => onEdit?.(rule)}
                        className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors duration-150"
                        title="Chỉnh sửa quy tắc"
                      >
                        <Pencil size={15} />
                      </button>
                      {/* Nút Xóa */}
                      <button
                        onClick={() => onDelete(rule.ruleId)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors duration-150"
                        title="Xóa quy tắc"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RuleTable;
