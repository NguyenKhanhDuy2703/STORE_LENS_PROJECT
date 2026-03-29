import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";
import Dashboard from "../features/Dashboard/Dashboard";
import MemberSegmentation from "../features/MemberSegmentation/MemberSegmentation";
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/memberSegmentation" element={<MemberSegmentation />} />
      <Route path="/phan-tich-thanh-vien" element={<MemberSegmentation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
