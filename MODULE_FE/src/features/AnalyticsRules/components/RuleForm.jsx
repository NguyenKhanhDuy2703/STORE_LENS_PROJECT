
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, METRIC_OPTIONS, OPERATOR_OPTIONS , ZONE_OPTIONS} from "../../../constants/ruleConfig";
import { Plus } from "lucide-react";

const RuleForm = ({onAdd,
  categories = ["retention"],
  zones = [],
  showZoneField = true,
  requireZoneField = false,
}) => {

  const normalizedCategories = Array.isArray(categories) && categories.length > 0 ? categories : ["retention"];
  const defaultCategory = normalizedCategories[0];

  const [formData, setFormData] = useState({
    category: defaultCategory,
    ruleName: "",
    metricName: "",
    operator: ">",
    threshold: "",
    zoneName: "",
    action: "",
  });

  const currentCategory = normalizedCategories.includes(formData.category) ? formData.category : defaultCategory;
  const config = CATEGORIES[currentCategory.toUpperCase()] || CATEGORIES.RETENTION;

  useEffect(() => {
    if (!normalizedCategories.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: defaultCategory, action: "" }));
    }
  }, [defaultCategory, formData.category, normalizedCategories]);

  const selectedMetric = useMemo(
    () => METRIC_OPTIONS.find((item) => item.value === formData.metricName),
    [formData.metricName]
  );

  const selectedAction = formData.action;


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ruleName || !formData.metricName || !formData.operator || !formData.threshold || !selectedAction) return;
    if (requireZoneField && !formData.zoneName) return;

    onAdd({
      ruleName: formData.ruleName.trim(),
      metricName: formData.metricName,
      operator: formData.operator,
      threshold: Number(formData.threshold),
      zoneName: formData.zoneName || "",
      action: selectedAction,
      zoneId: formData.zoneName || "",
      category: currentCategory.toLowerCase(),
      unit: selectedMetric?.unit || "",

      isActive: true,
    });
    setFormData({
      category: defaultCategory,
      ruleName: "",
      metricName: "",
      operator: ">",
      threshold: "",
      zoneId: "",
      zoneName: "",
      action: "",
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-4">
      <div className="flex items-center gap-2 mb-6">
        <config.icon className={config.iconClass} size={20} />
        <h3 className="font-medium tracking-tight text-slate-900">Thêm quy tắc {config.label}</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {normalizedCategories.length > 1 && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Nhóm quy tắc</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, action: "" })}
            >
              {normalizedCategories.map((categoryKey) => {
                const categoryConfig = CATEGORIES[categoryKey.toUpperCase()] || CATEGORIES.RETENTION;
                return (
                  <option key={categoryKey} value={categoryKey}>
                    {categoryConfig.label}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Tên quy tắc</label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
            placeholder="Ví dụ: Zone dwell time warning"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Metric</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
            value={formData.metricName}
            onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
          >
            <option value="">Chọn metric...</option>
            {METRIC_OPTIONS.map((metric) => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Operator</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
            >
              {OPERATOR_OPTIONS.map((operator) => (
                <option key={operator} value={operator}>{operator}</option>
              ))}
            </select>
          </div>
          <div className="col-span-8">
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Ngưỡng</label>
            <input 
              type="number"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm tabular-nums tracking-tight outline-none focus:ring-1 focus:ring-teal-500"
              placeholder={config.valuePlaceholder}
              min="0"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: e.target.value})}
            />
          </div>
        </div>

        {showZoneField && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">
              Vùng {requireZoneField ? "*" : ""}
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
              value={formData.zoneName}
              onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
              required={requireZoneField}
            >
              <option value="">Chọn vùng...</option>
              {ZONE_OPTIONS.map((zone) => (
                <option key={zone.zoneName} value={zone.zoneId}>{zone.zoneName}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2 tracking-tight">Hành động</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 tracking-tight"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
          >
            <option value="">Chọn hành động...</option>
            {config.actionOptions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-100 tracking-tight">
            <Plus size={18} /> Thêm vào bảng
          </button>
        </div>
      </form>

      {/* Rule preview in natural language */}
      {selectedMetric && formData.threshold && (
        <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <p className="text-xs text-slate-500 tracking-tight">
            "Hệ thống sẽ <span className="text-teal-600 font-medium">{selectedAction || "..."}</span> khi <span className="text-indigo-600 font-medium">{selectedMetric.label}</span> <span className="font-medium">{formData.operator}</span> <span className="font-medium tabular-nums tracking-tight">{formData.threshold || "0"}</span> {selectedMetric.unit}."
          </p>
        </div>
      )}
    </div>
  );
};
export default RuleForm;