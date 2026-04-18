import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loading from './common/Loading';

export const ProtectedRoute = ({ children }) => {
  const { isLogin, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loading isLoading={true} text="Đang kiểm tra xác thực..." />;
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
