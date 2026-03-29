import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";
import Dashboard from "../features/Dashboard/Dashboard";
import AnalyticsArea from "../features/AnalyticsArea/AnalyticsArea";
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analyticsArea" element={<AnalyticsArea/>}/>
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
