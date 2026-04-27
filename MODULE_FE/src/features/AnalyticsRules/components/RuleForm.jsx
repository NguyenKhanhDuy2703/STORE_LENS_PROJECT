import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, METRIC_OPTIONS, OPERATOR_OPTIONS } from "../../../constants/ruleConfig";
import { Plus, Pencil, X } from "lucide-react";

const EMPTY_FORM = {
  category: "",
  ruleName: "",
  metricName: "",
  operator: ">",
  threshold: "",
  zoneName: "",
  action: "",
};

const RuleForm = ({
  onAdd,
  onUpdate,
  onCancelEdit,
  editingRule = null,       // rule đang được edit — null = create mode
  categories = ["retention"],
  zones = [],               // zones từ DB, truyền xuống từ parent
  showZoneField = true,
  requireZoneField = false,
}) => {
  const isEditMode = Boolean(editingRule);
  const normalizedCategories = Array.isArray(categories) && categories.length > 0 ? categories : ["retention"];
  const defaultCategory = normalizedCategories[0];

  const [formData, setFormData] = useState({ ...EMPTY_FORM, category: defaultCategory });

  // Khi editingRule thay đổi → pre-fill form
  useEffect(() => {
    if (editingRule) {
      setFormData({
        category:   editingRule.category   || defaultCategory,
        ruleName:   editingRule.ruleName   || "",
        metricName: editingRule.logic?.metricName || "",
        operator:   editingRule.logic?.operator   || ">",
        threshold:  editingRule.logic?.threshold  ?? "",
        zoneName:   editingRule.zoneId     || editingRule.zoneName || "",
        action:     editingRule.action     || "",
      });
    } else {
      setFormData({ ...EMPTY_FORM, category: defaultCategory });
    }
  }, [editingRule, defaultCategory]);

  // Reset category nếu không hợp lệ
  useEffect(() => {
    if (!normalizedCategories.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: defaultCategory, action: "" }));
    }
  }, [defaultCategory, formData.category, normalizedCategories]);

  const currentCategory = normalizedCategories.includes(formData.category) ? formData.category : defaultCategory;
  const config = CATEGORIES[currentCategory.toUpperCase()] || CATEGORIES.RETENTION;

  const selectedMetric = useMemo(
    () => METRIC_OPTIONS.find((item) => item.value === formData.metricName),
    [formData.metricName]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.ruleName || !formData.metricName || !formData.operator || formData.threshold === "" || !formData.action) return;
    if (requireZoneField && !formData.zoneName) return;

    const rulePayload = {
      ruleName:   formData.ruleName.trim(),
      metricName: formData.metricName,
      operator:   formData.operator,
      threshold:  Number(formData.threshold),
      zoneName:   formData.zoneName || "",
      zoneId:     formData.zoneName || "",
      action:     formData.action,
      category:   currentCategory.toLowerCase(),
      unit:       selectedMetric?.unit || "",
      isActive:   true,
    };

    if (isEditMode) {
      // Edit mode — truyền ruleId để upsert đúng rule
      onUpdate({ ...rulePayload, ruleId: editingRule.ruleId });
    } else {
      onAdd(rulePayload);
    }

    setFormData({ ...EMPTY_FORM, category: defaultCategory });
  };

  const inputClass = "w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-md sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <config.icon className={config.iconClass} size={18} />
          <h3 className="font-semibold text-foreground tracking-tight">
            {isEditMode ? `Sửa quy tắc ${config.label}` : `Thêm quy tắc ${config.label}`}
          </h3>
        </div>
        {/* Nút hủy edit */}
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
            title="Hủy chỉnh sửa"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category selector — chỉ hiện khi có nhiều category */}
        {normalizedCategories.length > 1 && (
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Nhóm quy tắc</label>
            <select
              className={inputClass}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value, action: "" })}
            >
              {normalizedCategories.map((key) => {
                const cat = CATEGORIES[key.toUpperCase()] || CATEGORIES.RETENTION;
                return <option key={key} value={key}>{cat.label}</option>;
              })}
            </select>
          </div>
        )}

        {/* Tên quy tắc */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Tên quy tắc</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ví dụ: Cảnh báo thời gian dừng khu vực"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
          />
        </div>

        {/* Metric */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Chỉ số đánh giá</label>
          <select
            className={inputClass}
            value={formData.metricName}
            onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
          >
            <option value="">Chọn chỉ số...</option>
            {METRIC_OPTIONS.map((metric) => (
              <option key={metric.value} value={metric.value}>{metric.label}</option>
            ))}
          </select>
        </div>

        {/* Operator + Threshold */}
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">So sánh</label>
            <select
              className={inputClass}
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
            >
              {OPERATOR_OPTIONS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
          <div className="col-span-8">
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Ngưỡng {selectedMetric ? `(${selectedMetric.unit})` : ""}
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder={config.valuePlaceholder}
              min="0"
              value={formData.threshold}
              onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
            />
          </div>
        </div>

        {/* Zone — dùng zones từ DB */}
        {showZoneField && (
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
              Khu vực {requireZoneField ? "*" : ""}
            </label>
            <select
              className={inputClass}
              value={formData.zoneName}
              onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
              required={requireZoneField}
            >
              <option value="">Chọn khu vực...</option>
              {zones.map((zone) => (
                <option key={zone.zone_id || zone.zoneId} value={zone.zone_id || zone.zoneId}>
                  {zone.zone_name || zone.zoneName || zone.zone_id || zone.zoneId}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Hành động — input tự do thay vì dropdown hardcode */}
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1.5">Hành động</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ví dụ: Liên hệ khách hàng để nhắc nhở"
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
          />
        </div>

        {/* Submit */}
        <div className="pt-1">
          <button
            type="submit"
            className={`w-full text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:scale-[0.98] ${
              isEditMode
                ? "bg-gradient-to-r from-amber-500 to-amber-400 hover:shadow-md"
                : "bg-gradient-accent hover:shadow-accent"
            }`}
          >
            {isEditMode ? <><Pencil size={16} /> Cập nhật quy tắc</> : <><Plus size={16} /> Thêm vào bảng</>}
          </button>
        </div>
      </form>

      {/* Preview điều kiện */}
      {selectedMetric && formData.threshold !== "" && (
        <div className="mt-5 p-3 bg-muted/50 rounded-xl border border-dashed border-border">
          <p className="text-muted-foreground leading-relaxed">
            Hệ thống sẽ{" "}
            <span className="text-accent font-medium">{formData.action || "..."}</span>{" "}
            khi{" "}
            <span className="text-foreground font-medium">{selectedMetric.label}</span>{" "}
            <span className="font-semibold">{formData.operator}</span>{" "}
            <span className="font-semibold tabular-nums">{formData.threshold || "0"}</span>{" "}
            {selectedMetric.unit}.
          </p>
        </div>
      )}
    </div>
  );
};

export default RuleForm;
