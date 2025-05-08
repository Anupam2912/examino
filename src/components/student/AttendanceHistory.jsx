import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';

export default function AttendanceHistory() {
  const { currentUser } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    rate: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchAttendance = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', currentUser.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        setAttendanceRecords(data || []);

        // Calculate stats
        if (data && data.length > 0) {
          const total = data.length;
          const present = data.filter(record => record.status).length;
          const rate = (present / total) * 100;

          setStats({
            total,
            present,
            rate
          });
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Attendance History</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-1">Total Records</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-700 mb-1">Present</h3>
          <p className="text-2xl font-bold text-green-900">{stats.present}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-700 mb-1">Attendance Rate</h3>
          <p className="text-2xl font-bold text-purple-900">{stats.rate.toFixed(1)}%</p>
        </div>
      </div>

      {attendanceRecords.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
          No attendance records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.status ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {record.confidence
                      ? `${(record.confidence * 100).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
