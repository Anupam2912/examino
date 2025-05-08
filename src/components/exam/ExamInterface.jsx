import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';
import screenfull from 'screenfull';
import CryptoJS from 'crypto-js';

export default function ExamInterface({ exam }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [violations, setViolations] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  
  // Initialize answers
  useEffect(() => {
    if (exam.questions) {
      const initialAnswers = {};
      exam.questions.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setAnswers(initialAnswers);
    }
  }, [exam]);
  
  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
      
      if (!screenfull.isFullscreen) {
        handleViolation('fullscreen');
      }
    };
    
    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
      
      // Enter fullscreen when component mounts
      if (containerRef.current && !isFullscreen) {
        screenfull.request(containerRef.current);
      }
    }
    
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
      }
    };
  }, [isFullscreen]);
  
  // Tab/window visibility change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('tab');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Disable copy/paste
  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      handleViolation('copy');
    };
    
    const handlePaste = (e) => {
      e.preventDefault();
      handleViolation('paste');
    };
    
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCopy);
    
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCopy);
    };
  }, []);
  
  // Auto-save answers every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveProgress();
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [answers]);
  
  const handleViolation = (type) => {
    setWarningType(type);
    setShowWarning(true);
    
    setViolations(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        // Auto-submit after 3 violations
        handleSubmit();
      }
      return newCount;
    });
  };
  
  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const saveProgress = async () => {
    try {
      setAutoSaveStatus('Saving...');
      
      // Encrypt answers
      const encryptedAnswers = CryptoJS.AES.encrypt(
        JSON.stringify(answers),
        'EXAMINO_SECURE_KEY'
      ).toString();
      
      // Save to local storage as backup
      localStorage.setItem(`exam_progress_${exam.id}`, encryptedAnswers);
      
      // Save to database if online
      if (navigator.onLine) {
        await supabase
          .from('exam_progress')
          .upsert({
            user_id: currentUser.id,
            exam_id: exam.id,
            answers: encryptedAnswers,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'user_id,exam_id'
          });
      }
      
      setAutoSaveStatus('Saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setAutoSaveStatus('Failed to save');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }
  };
  
  const handleSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    try {
      // Calculate score
      let correctAnswers = 0;
      let totalAnswered = 0;
      
      Object.entries(answers).forEach(([index, answer]) => {
        if (answer !== null) {
          totalAnswered++;
          if (answer === exam.questions[index].correctAnswer) {
            correctAnswers++;
          }
        }
      });
      
      const score = Math.round((correctAnswers / exam.questions.length) * 100);
      
      // Encrypt answers for submission
      const encryptedAnswers = CryptoJS.AES.encrypt(
        JSON.stringify(answers),
        'EXAMINO_SECURE_KEY'
      ).toString();
      
      // Submit to database
      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: currentUser.id,
          exam_id: exam.id,
          answers: Object.values(answers),
          score,
          submitted_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Clean up local storage
      localStorage.removeItem(`exam_progress_${exam.id}`);
      
      // Exit fullscreen
      if (screenfull.isEnabled && isFullscreen) {
        screenfull.exit();
      }
      
      // Redirect to results
      navigate('/results', { 
        state: { 
          message: 'Exam submitted successfully!',
          examId: exam.id
        } 
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Your answers have been saved locally. Please try again.');
      setSubmitting(false);
    }
  };
  
  const handleResumeExam = () => {
    setShowWarning(false);
    
    // Re-enter fullscreen if needed
    if (!isFullscreen && screenfull.isEnabled && containerRef.current) {
      screenfull.request(containerRef.current);
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isTimeWarning = timeLeft <= 300; // 5 minutes or less
  
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Anti-screenshot styles */}
      <style jsx>{`
        .question-content {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          user-select: none;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-gray-900 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-semibold truncate">{exam.title}</h1>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <span className={`font-mono ${isTimeWarning ? 'text-red-400 animate-pulse' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                navigator.onLine ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-sm">
              {navigator.onLine ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="container mx-auto flex flex-col md:flex-row gap-6">
          {/* Question navigation */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Questions</h2>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 text-white'
                          : answers[index] !== null
                          ? 'border-2 border-green-500 text-green-800'
                          : 'border-2 border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Current Question</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-green-500 mr-2"></div>
                  <span className="text-sm">Answered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2"></div>
                  <span className="text-sm">Unanswered</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setShowWarning(true)}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Exam
                </button>
                
                {autoSaveStatus && (
                  <div className="mt-2 text-center text-sm text-gray-500">
                    {autoSaveStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Question display */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6 question-content">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </h2>
                
                {violations > 0 && (
                  <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm">
                    Violations: {violations}/3
                  </div>
                )}
              </div>
              
              <div className="mb-6 text-lg">
                {currentQuestion.questionText}
              </div>
              
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-center"
                  >
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestionIndex}`}
                      checked={answers[currentQuestionIndex] === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`option-${index}`}
                      className="ml-3 text-gray-700 text-lg cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={isFirstQuestion}
                  className={`
                    px-4 py-2 rounded-md
                    ${
                      isFirstQuestion
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                >
                  Previous
                </button>
                
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {isLastQuestion ? 'Review Answers' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Warning modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              {warningType === 'fullscreen' && 'Fullscreen Mode Required'}
              {warningType === 'tab' && 'Warning: Tab Change Detected'}
              {warningType === 'copy' && 'Warning: Copy/Paste Detected'}
              {warningType === 'paste' && 'Warning: Copy/Paste Detected'}
              {!warningType && 'Submit Exam'}
            </h2>
            
            <p className="text-gray-700 mb-6">
              {warningType === 'fullscreen' && 'Please return to fullscreen mode to continue the exam.'}
              {warningType === 'tab' && 'Switching tabs or windows during the exam is not allowed.'}
              {warningType === 'copy' && 'Copying content during the exam is not allowed.'}
              {warningType === 'paste' && 'Pasting content during the exam is not allowed.'}
              {!warningType && 'Are you sure you want to submit your exam? This action cannot be undone.'}
            </p>
            
            {violations > 0 && warningType && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">
                Warning: You have {violations} violation(s). After 3 violations, your exam will be automatically submitted.
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              {!warningType ? (
                <>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Exam'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleResumeExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Resume Exam
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
