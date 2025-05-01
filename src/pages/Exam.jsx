import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import screenfull from 'screenfull';
import DOMPurify from 'dompurify';
import { encryptData, decryptData } from '../utils/encryption';
import '../styles/exam.css';

// Components
import NetworkStatus from '../components/exam/NetworkStatus';
import ExamTimer from '../components/exam/ExamTimer';
import QuestionNavigation from '../components/exam/QuestionNavigation';
import QuestionDisplay from '../components/exam/QuestionDisplay';
import WarningModal from '../components/exam/WarningModal';

export default function Exam() {
  const { examId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Refs
  const examContainerRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // State
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const [violationCount, setViolationCount] = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);

  // Fetch exam data
  useEffect(() => {
    async function fetchExam() {
      try {
        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*')
          .eq('id', examId)
          .eq('is_active', true)
          .single();

        if (examError) throw examError;
        if (!examData) {
          setError('Exam not found or not active');
          return;
        }

        // Fetch exam questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('exam_questions')
          .select('*')
          .eq('exam_id', examId)
          .order('question_number', { ascending: true });

        if (questionsError) throw questionsError;

        // Format questions
        const formattedQuestions = questionsData.map(q => ({
          id: q.id,
          text: q.question_text,
          options: JSON.parse(q.options),
          correctAnswer: q.correct_answer
        }));

        setExam(examData);
        setQuestions(formattedQuestions);

        // Check for existing answers (if student refreshes the page)
        const { data: submissionData, error: submissionError } = await supabase
          .from('exam_progress')
          .select('*')
          .eq('exam_id', examId)
          .eq('user_id', currentUser.id)
          .single();

        if (!submissionError && submissionData) {
          try {
            const decryptedAnswers = decryptData(submissionData.answers);

            setAnswers(decryptedAnswers);

            // Update answered questions set
            const answered = new Set();
            Object.keys(decryptedAnswers).forEach(qIndex => {
              if (decryptedAnswers[qIndex] !== null) {
                answered.add(parseInt(qIndex));
              }
            });
            setAnsweredQuestions(answered);
          } catch (e) {
            console.error('Error decrypting answers:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError('Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (currentUser) {
      fetchExam();
    }
  }, [examId, currentUser]);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = screenfull.isFullscreen;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && !loading && exam) {
        setModalState({ isOpen: true, type: 'fullscreen' });
        setTimerPaused(true);
        handleViolation();
      }
    };

    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
      }
    };
  }, [loading, exam]);

  // Handle tab/window visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !loading && exam) {
        handleViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, exam]);

  // Disable copy/paste
  useEffect(() => {
    const handleCopy = (e) => {
      e.preventDefault();
      handleViolation();
    };

    const handlePaste = (e) => {
      e.preventDefault();
      handleViolation();
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
    if (!loading && exam && Object.keys(answers).length > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        saveProgress();
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [loading, exam, answers]);

  // Enter fullscreen when exam loads
  useEffect(() => {
    if (!loading && exam && screenfull.isEnabled && !isFullscreen) {
      if (examContainerRef.current) {
        screenfull.request(examContainerRef.current);
      }
    }
  }, [loading, exam, isFullscreen]);

  // Handle violations
  const handleViolation = useCallback(() => {
    setViolationCount(prev => {
      const newCount = prev + 1;

      if (newCount >= 3) {
        // Auto-submit after 3 violations
        submitExam();
        return newCount;
      }

      setModalState({
        isOpen: true,
        type: 'violation'
      });

      return newCount;
    });
  }, []);

  // Save progress to database
  const saveProgress = async () => {
    if (!currentUser || !exam) return;

    try {
      // Encrypt answers before saving
      const encryptedAnswers = encryptData(answers);

      const { error } = await supabase
        .from('exam_progress')
        .upsert({
          user_id: currentUser.id,
          exam_id: examId,
          answers: encryptedAnswers,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id,exam_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
      // Continue exam even if save fails
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));

    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(currentQuestionIndex);
      return newSet;
    });
  };

  // Navigation handlers
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, show submit modal
      setModalState({ isOpen: true, type: 'submit' });
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Modal handlers
  const handleResumeExam = () => {
    setModalState({ isOpen: false, type: null });
    setTimerPaused(false);

    // Re-enter fullscreen if needed
    if (!isFullscreen && screenfull.isEnabled && examContainerRef.current) {
      screenfull.request(examContainerRef.current);
    }
  };

  // Timer handler
  const handleTimeUp = () => {
    submitExam();
  };

  // Submit exam
  const submitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Save progress one last time
      await saveProgress();

      // Calculate score
      let correctAnswers = 0;

      questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / questions.length) * 100);

      // Create submission record
      const { error } = await supabase
        .from('submissions')
        .insert({
          user_id: currentUser.id,
          exam_id: examId,
          exam_name: exam.title,
          score: score,
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      // Delete progress record
      await supabase
        .from('exam_progress')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('exam_id', examId);

      // Exit fullscreen
      if (screenfull.isEnabled && isFullscreen) {
        screenfull.exit();
      }

      // Redirect to results page
      navigate('/results', {
        state: {
          message: 'Exam submitted successfully!',
          examId: examId
        }
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Failed to submit exam. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/exams')}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={examContainerRef}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      {/* Anti-screenshot styles */}
      <style jsx>{`
        .question-card {
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          user-select: none;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gray-900 text-white py-3 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <h1 className="text-xl font-semibold">{exam.title}</h1>

        <div className="flex items-center space-x-6">
          <NetworkStatus />
          <ExamTimer
            durationMinutes={exam.duration}
            onTimeUp={handleTimeUp}
            isPaused={timerPaused}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16 pb-6 px-4">
        <div className="container mx-auto mt-6 flex flex-col md:flex-row gap-6">
          {/* Question navigation sidebar */}
          <div className="md:w-1/4">
            <QuestionNavigation
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              answeredQuestions={answeredQuestions}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>

          {/* Question display */}
          <div className="md:w-3/4">
            {questions.length > 0 && (
              <QuestionDisplay
                question={questions[currentQuestionIndex]}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                selectedAnswer={answers[currentQuestionIndex] !== undefined ? answers[currentQuestionIndex] : null}
                onAnswerSelect={handleAnswerSelect}
                onPrevious={handlePreviousQuestion}
                onNext={handleNextQuestion}
                isFirstQuestion={currentQuestionIndex === 0}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
              />
            )}
          </div>
        </div>
      </main>

      {/* Warning modal */}
      <WarningModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onResume={handleResumeExam}
        onSubmit={submitExam}
        violationCount={violationCount}
      />

      {/* Submit button (fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end">
        <button
          onClick={() => setModalState({ isOpen: true, type: 'submit' })}
          className="px-6 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Exam'}
        </button>
      </div>
    </div>
  );
}
