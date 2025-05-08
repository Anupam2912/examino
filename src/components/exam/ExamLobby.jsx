import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamLobby() {
  const { currentUser } = useAuth();
  const [activeExams, setActiveExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittedExams, setSubmittedExams] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchExams = async () => {
      try {
        // Fetch active exams
        const { data: exams, error: examsError } = await supabase
          .from('exams')
          .select('*')
          .eq('is_active', true);
        
        if (examsError) throw examsError;
        
        // Fetch user's submissions
        const { data: submissions, error: submissionsError } = await supabase
          .from('submissions')
          .select('exam_id')
          .eq('user_id', currentUser.id);
        
        if (submissionsError) throw submissionsError;
        
        // Filter out exams that the user has already submitted
        const submittedExamIds = submissions?.map(sub => sub.exam_id) || [];
        setSubmittedExams(submittedExamIds);
        
        setActiveExams(exams || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load available exams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [currentUser]);
  
  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
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
  
  if (activeExams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
          No active exams available at the moment. Please check back later.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Available Exams</h2>
      
      <div className="space-y-4">
        {activeExams.map(exam => {
          const hasSubmitted = submittedExams.includes(exam.id);
          
          return (
            <div 
              key={exam.id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{exam.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {exam.description || 'No description'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {exam.duration} minutes
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {exam.questions?.length || 0} questions
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleStartExam(exam.id)}
                  disabled={hasSubmitted}
                  className={`px-4 py-2 rounded-md ${
                    hasSubmitted
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {hasSubmitted ? 'Already Submitted' : 'Start Exam'}
                </button>
              </div>
              
              {hasSubmitted && (
                <div className="mt-3 bg-green-50 text-green-700 p-2 rounded text-sm">
                  You have already submitted this exam. View your results in the Results section.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
