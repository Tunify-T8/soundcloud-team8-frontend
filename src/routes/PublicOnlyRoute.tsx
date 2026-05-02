import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../features/auth/utils/token.utils';

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAccessToken();
  if (token) {
    return <Navigate to="/discover" replace />;
  }
  return <>{children}</>;
};
export default PublicOnlyRoute;