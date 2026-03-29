import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";
import AnalyticsRules from "../features/AnalyticsRules/AnalyticsRules";
const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/analytics-rules" element={<AnalyticsRules />} />
    </Routes>
  );
};

export default AppRouter;
