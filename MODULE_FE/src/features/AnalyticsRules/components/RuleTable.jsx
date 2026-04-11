import { Users, MapPin, BarChart3, Trash2 } from "lucide-react";

const METRIC_LABELS = {
  totalVisitors: "Total Visitors",
  avgDwell_time: "Average Dwell Time",
  avgBasket_value: "Average Basket Value",
};

const CATEGORIES = {
  RETENTION: {
    id: "retention",
    label: "Hội viên",
    icon: Users,
    color: "indigo",
  },
  ZONE: { id: "zone", label: "Khu vực", icon: MapPin, color: "teal" },
  REVENUE: {
    id: "revenue",
    label: "Doanh thu",
    icon: BarChart3,
    color: "amber",
  },
};

const buildReadableCondition = (rule) => {
  const metricLabel = METRIC_LABELS[rule?.logic?.metricName] || rule?.logic?.metricName || "Metric";
  const operator = rule?.logic?.operator || "";
  const threshold = rule?.logic?.threshold ?? "";
  const unit = rule?.logic?.unit ? ` ${rule.logic.unit}` : "";
  return `${metricLabel} ${operator} ${threshold}${unit}`.trim();
};

const RuleTable = ({ rules, onDelete, onToggle }) => {
  console.log("Rendering RuleTable with rules:", rules);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-medium text-slate-400 text-[10px] tracking-tight border-r border-slate-200">
              Tên quy tắc
            </th>
            { rules[0]?.category === "zone" && (
              <th className="px-6 py-4 font-medium text-slate-400 text-[10px] tracking-tight border-r border-slate-200">
              Tên vùng
            </th>
            )}
            <th className="px-6 py-4 font-medium text-slate-400 text-[10px] tracking-tight border-r border-slate-200">
              Điều kiện
            </th>
            <th className="px-6 py-4 font-medium text-slate-400 text-[10px] tracking-tight border-r border-slate-200">
              Trạng thái
            </th>
            <th className="px-6 py-4 font-medium text-slate-400 text-[10px] tracking-tight text-right">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rules.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="px-6 py-10 text-center text-slate-400 text-sm italic tracking-tight"
              >
                Chưa có quy tắc nào được thiết lập
              </td>
            </tr>
          ) : (
            rules.map((rule) => (
              <tr key={rule.ruleId} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 border-r border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1 h-8 rounded-full bg-${CATEGORIES[rule.category.toUpperCase()]?.color}-500`}
                    />
                    <div>
                      <p className="font-medium tracking-tight text-slate-900">{rule.ruleName}</p>
                    </div>
                  </div>
                </td>
                { rule.category === "zone" && (
                  <td className="px-6 py-4 border-r border-slate-100">
                    <p className="font-medium tracking-tight text-slate-900">{rule.zoneName}</p>
                  </td>
                )}
                <td className="px-6 py-4 border-r border-slate-100">
                  <p className="font-medium tracking-tight text-slate-900">{buildReadableCondition(rule)}</p>
                  <p className="text-xs text-slate-500 pt-1 tracking-tight">Hành động: {rule.action}</p>
                </td>
                <td className="px-6 py-4 border-r border-slate-100">
                  <button
                    onClick={() => onToggle(rule.ruleId)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${rule.isActive ? "bg-teal-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${rule.isActive ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(rule.ruleId)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default RuleTable;
