import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import WebcamModal from '../components/WebcamModal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Attendance() {
  const { currentUser, userProfile } = useAuth();
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendanceRecords() {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        const recordsData = data.map(item => ({
          id: item.id,
          ...item,
          timestamp: new Date(item.timestamp)
        }));

        setAttendanceRecords(recordsData);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendanceRecords();
  }, [currentUser, showWebcamModal]);

  const handleMarkAttendance = () => {
    // Check if user has reference image
    if (!userProfile?.reference_image) {
      alert('Contact admin to register your face for attendance.');
      return;
    }

    // Check webcam permissions
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setShowWebcamModal(true);
      })
      .catch(() => {
        alert('Enable camera access to mark attendance.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Attendance Records</h2>
          <button
            onClick={handleMarkAttendance}
            className="btn btn-primary"
          >
            Mark Attendance
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4"><Skeleton width={100} /></td>
                      <td className="py-3 px-4"><Skeleton width={80} /></td>
                      <td className="py-3 px-4"><Skeleton width={60} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            No attendance records found. Use the "Mark Attendance" button to record your attendance.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Time</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">
                        {record.timestamp.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status === 'verified'
                            ? 'Verified'
                            : record.status === 'pending'
                              ? 'Pending'
                              : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Webcam Modal */}
      {showWebcamModal && (
        <WebcamModal onClose={() => setShowWebcamModal(false)} />
      )}
    </div>
  );
}
