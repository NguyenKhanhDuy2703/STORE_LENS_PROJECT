import { Routes, Route } from "react-router-dom";
import NotFound from "../components/common/NotFound";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
