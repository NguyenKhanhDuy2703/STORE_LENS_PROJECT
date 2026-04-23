import { BrowserRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import store from "./redux/store";
import AppRouter from "./routes";
import { checkAuthThunk } from "./features/Authentication/auth.thunk";

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const hasInitializedAuthCheck = useRef(false);

  useEffect(() => {
    if (hasInitializedAuthCheck.current) {
      return;
    }

    hasInitializedAuthCheck.current = true;
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    if (isAuthPage) {
      return;
    }

    dispatch(checkAuthThunk());
  }, [dispatch, location.pathname]);

  useEffect(() => {
    const handleUnauthorized = () => {
      const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

      if (isAuthPage) {
        return;
      }

      dispatch(checkAuthThunk());
    };

    window.addEventListener("app:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("app:unauthorized", handleUnauthorized);
    };
  }, [dispatch, location.pathname]);

  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>  
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
