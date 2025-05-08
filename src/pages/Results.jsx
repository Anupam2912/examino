import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Results() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchResults() {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, exams:exam_id(*)')
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

        // Check if we have a message from the location state (after exam submission)
        if (location.state?.message) {
          // Find the result for the exam that was just submitted
          if (location.state.examId) {
            const submittedResult = resultsData.find(r => r.exam_id === location.state.examId);
            if (submittedResult) {
              setSelectedResult(submittedResult);
              setShowDetails(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [currentUser, location]);

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedResult(null);

    // Clear location state
    if (location.state) {
      navigate(location.pathname, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {location.state?.message && (
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6">
            {location.state.message}
          </div>
        )}

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
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4"><Skeleton width={150} /></td>
                      <td className="py-3 px-4"><Skeleton width={100} /></td>
                      <td className="py-3 px-4"><Skeleton width={50} /></td>
                      <td className="py-3 px-4"><Skeleton width={60} /></td>
                      <td className="py-3 px-4"><Skeleton width={80} /></td>
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
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.id} className="border-b border-gray-200">
                      <td className="py-3 px-4">{result.exams?.title || 'Unknown Exam'}</td>
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
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(result)}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result Details Modal */}
        {showDetails && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    {selectedResult.exams?.title || 'Exam'} Results
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Score</h3>
                    <p className="text-2xl font-bold">{selectedResult.score}%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <p className={`text-2xl font-bold ${selectedResult.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedResult.status}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted</h3>
                    <p className="text-2xl font-bold">{selectedResult.submittedAt.toLocaleString()}</p>
                  </div>
                </div>

                {selectedResult.exams?.questions && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold">Questions & Answers</h3>

                    {selectedResult.exams.questions.map((question, index) => {
                      const userAnswer = selectedResult.answers[index];
                      const isCorrect = userAnswer === question.correctAnswer;

                      return (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium">Question {index + 1}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>

                          <p className="mb-4">{question.questionText}</p>

                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${optIndex === userAnswer ? 'bg-blue-100 border border-blue-300' : ''} ${
                                  optIndex === question.correctAnswer ? 'border border-green-500' : ''
                                }`}
                              >
                                {option}
                                {optIndex === question.correctAnswer && (
                                  <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
