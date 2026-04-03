import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "../components/functionComponent/NotFound";
import Dashboard from "../features/Dashboard/Dashboard";
import AnalyticsArea from "../features/AnalyticsArea/AnalyticsArea";
import AnalyticsRules from "../features/AnalyticsRules/AnalyticsRules";
import Heatmap from "../features/Heatmap/Heatmap";
import Downtime from "../features/Downtime/Downtime";
import ManagermentCameraPage from "../features/ManagermentCamera/ManagermentCameraPage";
import MemberSegmentation from "../features/MemberSegmentation/MemberSegmentation";

import Map from "../features/Map/Map";
import ManagerUser from "../features/ManagerUser/ManagerUser";
import { MainLayout } from "../layout/MainLayout";
import AssetManagement from "../features/AssetManagement/ManagementProduct"
import Authentication from "../features/Authentication/Authentication";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Authentication />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        {/* Các trang con */}
        <Route path="quan-ly-khach-hang" element={<MemberSegmentation />} />
        <Route path="management/area" element={<AnalyticsArea />} />
        <Route path="config/rules" element={<AnalyticsRules />} />
        <Route path="heatmap" element={<Heatmap />} />
        <Route path="dwell-time" element={<Downtime />} />
        <Route path="config/camera" element={<ManagermentCameraPage />} />
        <Route path="config/zone" element={<Map />} />
        <Route path="quan-ly-nguoi-dung" element={<ManagerUser />} />
        <Route path="management/asset" element={<AssetManagement />} />
        {/* Legacy redirects */}
        <Route path="management/customer" element={<Navigate to="/quan-ly-khach-hang" replace />} />
        <Route path="customer-management" element={<Navigate to="/quan-ly-khach-hang" replace />} />
        <Route path="user-management" element={<Navigate to="/quan-ly-nguoi-dung" replace />} />
        <Route path="management/users" element={<Navigate to="/quan-ly-nguoi-dung" replace />} />
        <Route path="settings" element={<Navigate to="/config/rules" replace />} />

        {/* Legacy paths */}
        <Route path="analytics/area" element={<Navigate to="/management/area" replace />} />
        <Route path="analytics/rules" element={<Navigate to="/config/rules" replace />} />
        

        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
  );
};

export default AppRouter;