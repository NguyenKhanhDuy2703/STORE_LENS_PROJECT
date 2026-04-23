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
const AnalyticsRules = () => {
  const [activeTab, setActiveTab] = useState("business");
  const [customerCareRules, setCustomerCareRules] = useState([]);
  const notifySuccess = (title, text) =>
    Swal.fire({
      icon: "success",
      title,
      text,
      confirmButtonText: "Đóng",
    });

  const notifyError = (title, text) =>
    Swal.fire({
      icon: "error",
      title,
      text,
      confirmButtonText: "Đóng",
    });

  const dispatch = useDispatch();
  const { locationId, userLocationId } = useSelector((state) => state.filter);
  const effectiveLocationId = locationId !== 'loc_all' ? locationId : userLocationId;
  const {rules} = useSelector((state) => state.customerRules);
  const zones = useSelector(selectZonesFromStore);
  useEffect(() => {
      if (!effectiveLocationId) return;

      const fetchRules = async () => {
        try{
          await dispatch(fetchCustomerRules({locationId : effectiveLocationId})).unwrap();
        }catch(error){
          console.error("Failed to fetch customer care rules:", error);
          notifyError("Không tải được quy tắc", error?.message || "Vui lòng thử lại sau.");
        }
      }
      fetchRules();
  },[dispatch, effectiveLocationId])

  useEffect(() => {
    if (Array.isArray(rules)) {
      setCustomerCareRules(rules);
    }
  }, [rules]);

  const addRule = async(newRule) => {
    if (!effectiveLocationId) return;

    const saveRule = {
      locationId: effectiveLocationId,
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
          if (!effectiveLocationId) return;
          return await dispatch(removeCustomerRule({locationId : effectiveLocationId , ruleId})).unwrap();
        }catch(error){
          Swal.showValidationMessage(`Lỗi khi xóa quy tắc: ${error?.message || "Không xác định"}`);
          throw error;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteRule(ruleId));
          notifySuccess('Đã xóa!', 'Quy tắc đã được xóa.');
        } catch (error) {
          notifyError('Xóa thất bại', error?.message || 'Không thể xóa quy tắc.');
        }
      }
    });
  };

  const handleToggleRule = (ruleId) => {
    dispatch(toggleRule(ruleId));
  };

  const activeRuleCount = customerCareRules.filter((rule) => rule.isActive).length;
 
 
 
  const handleCancel = async() => {
    if (!effectiveLocationId) return;
    try {
      await dispatch(fetchCustomerRules({locationId : effectiveLocationId})).unwrap();
      notifySuccess('Đã hủy thay đổi', 'Các thay đổi chưa lưu đã được hủy bỏ.');
    } catch (error) {
      notifyError('Hủy thất bại', error?.message || 'Không thể tải lại cấu hình gốc.');
    }
  };

  const handleSaveConfig = async () => {
    if (!effectiveLocationId) return;

    const confirmation = await Swal.fire({
    title: 'Lưu cấu hình?',
    text: 'Bạn có muốn lưu các thay đổi hiện tại không?',
    icon: 'question',
    allowOutsideClick: false, 
    showCancelButton: true,
    confirmButtonText: 'Xác nhận lưu',
    cancelButtonText: 'Hủy',
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        return await dispatch(addAndUpdateCustomerRule({locationId : effectiveLocationId , ruleData:rules})).unwrap();
      } catch (error) {
        Swal.showValidationMessage(`Lỗi khi lưu cấu hình: ${error?.message || "Không xác định"}`);
        throw error;
      }
    }
    });

    if (confirmation.isConfirmed) {
      notifySuccess('Lưu thành công', 'Cấu hình đã được lưu thành công.');
    }
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