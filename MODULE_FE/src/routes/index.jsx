import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";
import Dashboard from "../features/Dashboard/Dashboard";
import AnalyticsArea from "../features/AnalyticsArea/AnalyticsArea";
import AnalyticsRules from "../features/AnalyticsRules/AnalyticsRules";
import Heatmap from "../features/Heatmap/HeatmapPage";
import Downtime from "../features/AnalyticsDwellTime/AnalyticsDwellTime";
import { CameraZoneConfig } from "../features/CameraZoneConfig/CameraZoneConfig";
import { ZoneConfig } from "../features/ZoneConfig/ZoneConfig";
import { CustomerManagement } from "../features/UserManagement/CustomerManagement";
// Chú ý: Thêm dấu { } nếu MainLayout là named export
import { MainLayout } from "../components/common/layout/MainLayout";

const AppRouter = () => {
  return (
    <Routes>
      {/* LỖI CŨ: element={MainLayout} -> PHẢI LÀ: element={<MainLayout />} */}
      <Route path="/" element={<MainLayout />}>
        {/* Trang mặc định khi vào "/" */}
        <Route index element={<Dashboard />} />
        
        {/* Các trang con */}
        <Route path="analytics/area" element={<AnalyticsArea />} />
        <Route path="analytics/rules" element={<AnalyticsRules />} />
        <Route path="heatmap" element={<Heatmap />} />
        <Route path="dwell-time" element={<Downtime />} />
        <Route path="camera-config" element={<CameraZoneConfig />} />
        <Route path="zone-config" element={<ZoneConfig />} />
        <Route path="customer-management" element={<CustomerManagement />} />
        {/* Trang 404 lồng bên trong layout để vẫn giữ Header/Footer */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;