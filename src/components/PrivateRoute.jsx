import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6">
          <Skeleton height={40} className="mb-6" />
          <Skeleton count={3} className="mb-2" />
          <Skeleton height={100} className="mb-6" />
          <Skeleton height={40} width="50%" />
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}
