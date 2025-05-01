import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Results() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('submitted_at', { ascending: false });

        if (error) throw error;

        const resultsData = data.map(item => ({
          id: item.id,
          ...item,
          status: item.score >= 60 ? 'Pass' : 'Fail',
          submittedAt: new Date(item.submitted_at)
        }));

        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">Exam Results</h2>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Exam Name</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Score</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4"><Skeleton width={150} /></td>
                      <td className="py-3 px-4"><Skeleton width={100} /></td>
                      <td className="py-3 px-4"><Skeleton width={50} /></td>
                      <td className="py-3 px-4"><Skeleton width={60} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            No exam results available yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Exam Name</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Score</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">{result.exam_name}</td>
                      <td className="py-3 px-4">
                        {result.submittedAt.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{result.score}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.status === 'Pass'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.status}
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
    </div>
  );
}
