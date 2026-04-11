import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import RuleForm from "./components/RuleForm";
import RuleTable from "./components/RuleTable";
import { fetchCustomerRules  ,addAndUpdateCustomerRule , removeCustomerRule} from "./analyticsRules.think";
import { useDispatch , useSelector } from "react-redux";
import {addAndUpdateRule , deleteRule , toggleRule} from "./analyticsRules.slice"
import Swal from 'sweetalert2';
const selectZonesFromStore = (state) => {
  const candidates = [
    state?.zones,
    state?.zone,
    state?.map,
    state?.mapZones,
    state?.area,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) return candidate;
    if (Array.isArray(candidate.zones)) return candidate.zones;
    if (Array.isArray(candidate.data)) return candidate.data;
  }

  return [];
};
const ALOCATION_ID = "LOC_TEST_001";
const AnalyticsRules = () => {
  const [activeTab, setActiveTab] = useState("business");
  const [customerCareRules, setCustomerCareRules] = useState([]);

  const dispatch = useDispatch();
  const {rules} = useSelector((state) => state.customerRules);
  const zones = useSelector(selectZonesFromStore);
  useEffect(() => {
      const fetchRules = async () => {
        try{
          await dispatch(fetchCustomerRules({locationId : ALOCATION_ID})).unwrap();
        }catch(error){
          console.error("Failed to fetch customer care rules:", error);
        }
      }
      fetchRules();
  },[dispatch])

  useEffect(() => {
    if (Array.isArray(rules)) {
      setCustomerCareRules(rules);
    }
  }, [rules]);

  const addRule = async(newRule) => {
    const saveRule = {
      locationId: ALOCATION_ID,
      category: newRule.category,
      ruleId: `TEMP_${Date.now()}`,
      ruleName: newRule.ruleName,
      zoneId: newRule.zoneId || "",
      logic: {
        metricName: newRule.metricName,
        threshold: newRule.threshold,
        operator: newRule.operator,
        unit: newRule.unit,
      },
      zoneId: newRule.zoneId || "",
      nameZone: newRule.zoneName,
      action: newRule.action,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    dispatch(addAndUpdateRule(saveRule)); 
  };

  const handleDeleteRules = (ruleId) => {
    console.log("Attempting to delete rule with ID:", ruleId);
    Swal.fire({
      title: 'Bạn có chắc muốn xóa quy tắc này?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      preConfirm: async () =>{
        try {
          return await dispatch(removeCustomerRule({locationId : ALOCATION_ID , ruleId})).unwrap();
        }catch(error){
          Swal.showValidationMessage(`Lỗi khi xóa quy tắc: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteRule(ruleId));
        Swal.fire(
          'Đã xóa!',
          'Quy tắc đã được xóa.',
          'success'
        );
      }
    });
  };

  const handleToggleRule = (ruleId) => {
    dispatch(toggleRule(ruleId));
  };

  const activeRuleCount = customerCareRules.filter((rule) => rule.isActive).length;
 
 
 
  const handleCancel = async() => {
    await dispatch(fetchCustomerRules({locationId : ALOCATION_ID})).unwrap();
    Swal.fire({
      title: 'Đã hủy thay đổi',
      text: 'Các thay đổi chưa lưu đã được hủy bỏ.',
    })
  };

  const handleSaveConfig = async () => {
    await dispatch(addAndUpdateCustomerRule({locationId : ALOCATION_ID ,ruleData: rules})).unwrap();
    Swal.fire({
    title: 'Đang lưu cấu hình...',
    text: 'Vui lòng xác nhận để lưu các thay đổi của bạn.',
    allowOutsideClick: false, 
    showCancelButton: true,
    confirmButtonText: 'Xác nhận lưu',
    showLoaderOnConfirm: true,
    icon: 'warning',

    preConfirm: async () => {
      try {
        return await dispatch(addAndUpdateCustomerRule({locationId : ALOCATION_ID , ruleData:rules})).unwrap();
      } catch (error) {
        Swal.showValidationMessage(`Lỗi khi lưu cấu hình: ${error.message}`);
      }
    }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Lưu thành công',
          text: 'Cấu hình đã được lưu thành công.',
          icon: 'success',
        });
      }
    });
  };

  const tabConfig = {
    business: {
      title: "Quy tắc Doanh thu & Khách hàng",
      categories: ["retention", "revenue"],
      showZoneField: false,
      requireZoneField: false,
    },
    zone: {
      title: "Quy tắc Khu vực (Zone)",
      categories: ["zone"],
      showZoneField: true,
      requireZoneField: true,
    },
  };

  const currentTab = tabConfig[activeTab];
  const filteredRules = customerCareRules.filter((rule) =>
    currentTab.categories.includes(rule.category)
  );
  const retentionRules = customerCareRules.filter((rule) => rule.category === "retention");
  const revenueRules = customerCareRules.filter((rule) => rule.category === "revenue");

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 pb-28">
      <div className="mb-6">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("business")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "business"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Doanh thu & Khach hang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("zone")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "zone"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Zone
          </button>
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-3">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{currentTab.title}</h2>
        </div>

        {activeTab === "business" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <RuleForm
                  categories={["retention"]}
                  onAdd={addRule}
                  zones={zones}
                  showZoneField={false}
                  requireZoneField={false}
                />
              </div>
              <div className="lg:col-span-8">  
                <RuleTable
                  rules={retentionRules}
                  onDelete={handleDeleteRules}
                  onToggle={handleToggleRule}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-slate-200 pt-6">
              <div className="lg:col-span-4">
                <RuleForm
                  categories={["revenue"]}
                  onAdd={addRule}
                  zones={zones}
                  showZoneField={false}
                  requireZoneField={false}
                />
              </div>
              <div className="lg:col-span-8">
              
                <RuleTable
                  rules={revenueRules}
                  onDelete={handleDeleteRules}
                  onToggle={handleToggleRule}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <RuleForm
                categories={currentTab.categories}
                onAdd={addRule}
                zones={zones}
                showZoneField={currentTab.showZoneField}
                requireZoneField={currentTab.requireZoneField}
              />
            </div>
            <div className="lg:col-span-8">
              <RuleTable
                rules={filteredRules}
                onDelete={handleDeleteRules}
                onToggle={handleToggleRule}
              />
            </div>
          </div>
        )}
      </section>

      {/* Sticky action bar */}
      <div className="sticky bottom-4 z-50 flex justify-end">
        <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-6 py-3 shadow-lg backdrop-blur">
          <div className="inline-flex items-center gap-2 text-slate-700">
            <SlidersHorizontal size={16} className="text-slate-500" />
            <span className="text-sm font-medium tracking-tight">{activeRuleCount} quy tắc đang hoạt động</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium tracking-tight text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
        
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium tracking-tight text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-slate-300"
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