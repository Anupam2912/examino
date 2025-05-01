import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchExams() {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">Available Exams</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <Skeleton height={30} width="60%" className="mb-4" />
                <Skeleton count={2} className="mb-2" />
                <Skeleton width="40%" className="mb-4" />
                <Skeleton height={40} width="30%" />
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            No active exams available at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
                <p className="text-gray-600 mb-4">{exam.description}</p>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                    Duration: {exam.duration} mins
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    Questions: {exam.total_questions}
                  </div>
                </div>
                <button
                  onClick={() => handleStartExam(exam.id)}
                  className="btn btn-primary"
                >
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
