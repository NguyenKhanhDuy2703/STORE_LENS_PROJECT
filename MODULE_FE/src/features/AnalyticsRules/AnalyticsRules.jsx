import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import RuleForm from "./components/RuleForm";
import RuleTable from "./components/RuleTable";

const MOCK_CUSTOMER_CARE_RULES = [
  {
    id: 1,
    location_id: "demo-location",
    category: "retention",
    rule_name: "Chăm sóc nhóm đi tập ít",
    condition: "Nhóm đi tập ít",
    value: 6,
    unit: "ngày",
    action: "Nhắc lịch tập qua Zalo",
    isActive: true,
  },
  {
    id: 2,
    location_id: "demo-location",
    category: "zone",
    rule_name: "Cảnh báo khu máy chạy bộ",
    condition: "Khu máy chạy bộ",
    value: 20,
    unit: "người",
    action: "Thông báo quản lý",
    isActive: true,
  },
  {
    id: 3,
    location_id: "demo-location",
    category: "revenue",
    rule_name: "Phân tệp khách VIP",
    condition: "Chi tiêu tích lũy",
    value: 5000000,
    unit: "VNĐ",
    action: "Phân tệp VIP",
    isActive: true,
  },
];

const AnalyticsRules = () => {
  const [customerCareRules, setCustomerCareRules] = useState(MOCK_CUSTOMER_CARE_RULES);
  // Snapshot used as the "saved" baseline for cancel/dirty-check behaviors.
  const [savedRules, setSavedRules] = useState(MOCK_CUSTOMER_CARE_RULES);

  const addRule = (newRule) => {
    const rule = {
      ...newRule,
      id: Date.now(),
      location_id: "demo-location",
      rule_name: `${newRule.category} - ${newRule.condition}`,
      created_at: new Date().toISOString(),
    };

    setCustomerCareRules((prevRules) => [...prevRules, rule]);
  };

  const deleteRule = (id) => {
    if (window.confirm("Bạn muốn xóa quy tắc này?")) {
      setCustomerCareRules((prevRules) => prevRules.filter((rule) => rule.id !== id));
    }
  };

  const toggleRule = (id) => {
    setCustomerCareRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === id
          ? { ...rule, isActive: !rule.isActive }
          : rule
      )
    );
  };

  const activeRuleCount = customerCareRules.filter((rule) => rule.isActive).length;
  const hasAllRuleGroups = ["retention", "zone", "revenue"].every((group) =>
    customerCareRules.some((rule) => rule.category === group)
  );
  // Simple dirty-check for enabling/disabling action buttons.
  const hasChanges = JSON.stringify(customerCareRules) !== JSON.stringify(savedRules);

  const handleCancel = () => {
    setCustomerCareRules(savedRules.map((rule) => ({ ...rule })));
  };

  const handleSaveConfig = () => {
    if (!hasAllRuleGroups) {
      window.alert("Cần có đủ 3 nhóm quy tắc: Hội viên, Khu vực, Doanh thu trước khi lưu.");
      return;
    }

    setSavedRules(customerCareRules.map((rule) => ({ ...rule })));
    window.alert("Đã lưu cấu hình quy tắc.");
  };

  return (
    <div className="p-8 space-y-12 pb-28">
      {/* SECTION: RETENTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <RuleForm category="retention" onAdd={addRule} />
        </div>
        <div className="lg:col-span-8">
          <RuleTable 
            rules={customerCareRules.filter((rule) => rule.category === "retention")} 
            onDelete={deleteRule} 
            onToggle={toggleRule} 
          />
        </div>
      </section>

      {/* SECTION: ZONE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-100 pt-12">
        <div className="lg:col-span-4">
          <RuleForm category="zone" onAdd={addRule} />
        </div>
        <div className="lg:col-span-8">
          <RuleTable 
            rules={customerCareRules.filter((rule) => rule.category === "zone")} 
            onDelete={deleteRule} 
            onToggle={toggleRule} 
          />
        </div>
      </section>

      {/* SECTION: REVENUE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-100 pt-12">
        <div className="lg:col-span-4">
          <RuleForm category="revenue" onAdd={addRule} />
        </div>
        <div className="lg:col-span-8">
          <RuleTable 
            rules={customerCareRules.filter((rule) => rule.category === "revenue")} 
            onDelete={deleteRule} 
            onToggle={toggleRule} 
          />
        </div>
      </section>

      {/* Sticky action bar keeps primary actions visible while scrolling long forms/tables. */}
      <div className="sticky bottom-4 z-50 flex justify-end">
        <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="inline-flex items-center gap-2 text-slate-700">
            <SlidersHorizontal size={15} className="text-slate-500" />
            <span className="text-sm font-semibold">{activeRuleCount} quy tắc đang hoạt động</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasChanges}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={!hasChanges || !hasAllRuleGroups}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsRules;