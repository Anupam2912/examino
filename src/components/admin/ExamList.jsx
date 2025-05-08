import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamList({ onEdit, onView }) {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('created_by', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setExams(data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
        setError('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
    
    // Set up real-time subscription
    const subscription = supabase
      .from('exams')
      .on('*', payload => {
        if (payload.new && payload.new.created_by === currentUser.id) {
          setExams(current => {
            // Check if the exam already exists in the list
            const exists = current.some(exam => exam.id === payload.new.id);
            
            if (exists) {
              // Update existing exam
              return current.map(exam => 
                exam.id === payload.new.id ? payload.new : exam
              );
            } else {
              // Add new exam
              return [payload.new, ...current];
            }
          });
        } else if (payload.old && payload.old.created_by === currentUser.id) {
          // Remove deleted exam
          setExams(current => 
            current.filter(exam => exam.id !== payload.old.id)
          );
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser]);
  
  const toggleExamStatus = async (examId, currentStatus) => {
    if (updatingId) return;
    
    setUpdatingId(examId);
    
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_active: !currentStatus })
        .eq('id', examId);
      
      if (error) throw error;
      
      // Optimistic UI update
      setExams(current => 
        current.map(exam => 
          exam.id === examId 
            ? { ...exam, is_active: !exam.is_active } 
            : exam
        )
      );
    } catch (err) {
      console.error('Error toggling exam status:', err);
      // Revert optimistic update on error
      setExams(current => [...current]);
    } finally {
      setUpdatingId(null);
    }
  };
  
  const deleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
      
      if (error) throw error;
      
      // Optimistic UI update
      setExams(current => current.filter(exam => exam.id !== examId));
    } catch (err) {
      console.error('Error deleting exam:', err);
      alert('Failed to delete exam. Please try again.');
    }
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
  
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">No exams found. Create your first exam to get started.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Exams</h2>
      
      <div className="space-y-4">
        {exams.map(exam => (
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
                  <span className={`text-xs px-2 py-1 rounded ${
                    exam.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => onView(exam)}
                  className="text-blue-600 hover:text-blue-800"
                  title="View Results"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => onEdit(exam)}
                  className="text-yellow-600 hover:text-yellow-800"
                  title="Edit Exam"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleExamStatus(exam.id, exam.is_active)}
                  disabled={updatingId === exam.id}
                  className={`${
                    exam.is_active 
                      ? 'text-orange-600 hover:text-orange-800' 
                      : 'text-green-600 hover:text-green-800'
                  } ${updatingId === exam.id ? 'opacity-50' : ''}`}
                  title={exam.is_active ? 'Deactivate Exam' : 'Activate Exam'}
                >
                  {updatingId === exam.id ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : exam.is_active ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => deleteExam(exam.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Exam"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
