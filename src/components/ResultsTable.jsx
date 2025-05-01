import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ResultsTable({ results, loading }) {
  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Exam Name</th>
                <th className="py-3 px-4 text-left">Score</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4"><Skeleton width={150} /></td>
                  <td className="py-3 px-4"><Skeleton width={50} /></td>
                  <td className="py-3 px-4"><Skeleton width={60} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
        <p className="text-gray-500">No exam results available yet.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Exam Name</th>
              <th className="py-3 px-4 text-left">Score</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="border-b border-gray-200">
                <td className="py-3 px-4">{result.examName}</td>
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
      <div className="mt-4 text-right">
        <Link to="/results" className="text-brand hover:underline">
          View All Results
        </Link>
      </div>
    </div>
  );
}
