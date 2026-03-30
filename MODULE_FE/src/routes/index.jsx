import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";
import Dashboard from "../features/Dashboard/Dashboard";
import MemberSegmentation from "../features/MemberSegmentation/MemberSegmentation";

import AnalyticsArea from "../features/AnalyticsArea/AnalyticsArea";
import AnalyticsRules from "../features/AnalyticsRules/AnalyticsRules";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route path="/analytics/member-segmentation" element={<MemberSegmentation />} />

      <Route path="/analytics/area" element={<AnalyticsArea/>}/>
      <Route path="/analytics/rules" element={<AnalyticsRules />} />
       <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRouter;
