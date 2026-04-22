import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts & Protection
import { MainLayout } from "../layout/MainLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import Loading from "../components/common/Loading";

// Components
import NotFound from "../components/functionComponent/NotFound";
import Authentication from "../features/Authentication/Authentication";
import SignUp from "../features/Authentication/components/SignUp";

// Features
import Dashboard from "../features/Dashboard/Dashboard";
import AnalyticsArea from "../features/AnalyticsArea/AnalyticsArea";
import AnalyticsRules from "../features/AnalyticsRules/AnalyticsRules";
import Heatmap from "../features/Heatmap/Heatmap";
import Downtime from "../features/Downtime/Downtime";
import ManagermentCameraPage from "../features/ManagermentCamera/ManagermentCameraPage";
import MemberSegmentation from "../features/MemberSegmentation/MemberSegmentation";
import Settings from "../features/Settings/Settings";
import CameraZoneManager from "../features/Map/CameraZoneManager";
import ManagerUser from "../features/ManagerUser/ManagerUser";
import AssetManagement from "../features/AssetManagement/AssetManagement";
import Notification from "../features/Notification/Notification";
const AppRouter = () => {
  const { isLogin, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (loading && !isAuthPage) {
    return <Loading isLoading={true} text="Đang kiểm tra phiên đăng nhập..." />;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isLogin ? <Navigate to="/dashboard" replace /> : <Authentication />} 
      />
      
      <Route path="/register" element={<SignUp />} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="management">
          <Route path="customers" element={<MemberSegmentation />} />
          <Route path="areas" element={<AnalyticsArea />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="users" element={<ManagerUser />} />
        </Route>

        <Route path="config">
          <Route path="rules" element={<AnalyticsRules />} />
          <Route path="cameras" element={<ManagermentCameraPage />} />
          <Route path="zones" element={<CameraZoneManager />} />
        </Route>

        <Route path="heatmap" element={<Heatmap />} />
        <Route path="dwell-time" element={<Downtime />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notification" element={<Notification />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;