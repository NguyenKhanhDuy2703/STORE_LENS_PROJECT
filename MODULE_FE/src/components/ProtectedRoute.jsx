import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Wraps protected routes and redirects to login if user is not authenticated
 * or if the app is still checking token validity
 */
export const ProtectedRoute = ({ children }) => {
  const { isLogin, isChecking } = useSelector((state) => state.auth);

  // While checking the token, show a loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-slate-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};
