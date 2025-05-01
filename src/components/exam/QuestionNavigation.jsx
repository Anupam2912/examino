import { useMemo } from 'react';

export default function QuestionNavigation({ 
  questions, 
  currentQuestionIndex, 
  answeredQuestions, 
  onQuestionSelect 
}) {
  const questionStatus = useMemo(() => {
    return questions.map((_, index) => {
      if (index === currentQuestionIndex) {
        return 'current';
      } else if (answeredQuestions.has(index)) {
        return 'answered';
      } else {
        return 'unanswered';
      }
    });
  }, [questions, currentQuestionIndex, answeredQuestions]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Questions</h3>
      <div className="grid grid-cols-5 gap-2">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionSelect(index)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium
              ${
                questionStatus[index] === 'current'
                  ? 'bg-blue-500 text-white'
                  : questionStatus[index] === 'answered'
                  ? 'border-2 border-green-500 text-green-800'
                  : 'border-2 border-gray-300 text-gray-700'
              }
              transition-colors duration-200 hover:bg-gray-100
              ${questionStatus[index] === 'current' ? 'hover:bg-blue-600' : ''}
            `}
            aria-label={`Question ${index + 1}${
              questionStatus[index] === 'current'
                ? ' (current)'
                : questionStatus[index] === 'answered'
                ? ' (answered)'
                : ' (unanswered)'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
