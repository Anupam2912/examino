import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Profile() {
  const { currentUser, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogout() {
    setError('');
    setLoading(true);

    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out. Please try again.');
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Profile</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Name:</div>
              <div>
                {userProfile ? (
                  `${userProfile.first_name} ${userProfile.last_name}`
                ) : (
                  <Skeleton width={200} />
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Email:</div>
              <div>
                {currentUser ? currentUser.email : <Skeleton width={200} />}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Student ID:</div>
              <div>
                {userProfile ? userProfile.student_id : <Skeleton width={120} />}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Course:</div>
              <div>
                {userProfile ? userProfile.course : <Skeleton width={150} />}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Semester:</div>
              <div>
                {userProfile ? userProfile.semester : <Skeleton width={80} />}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center">
              <div className="font-medium w-32">Face Recognition:</div>
              <div>
                {userProfile ? (
                  userProfile.reference_image ? (
                    <span className="text-green-600">Registered</span>
                  ) : (
                    <span className="text-red-600">Not Registered</span>
                  )
                ) : (
                  <Skeleton width={100} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="btn bg-red-500 text-white hover:bg-red-600"
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
