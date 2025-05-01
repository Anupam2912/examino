import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onPrevious,
  onNext,
  isFirstQuestion,
  isLastQuestion
}) {
  const [localAnswer, setLocalAnswer] = useState(selectedAnswer);

  // Update local state when selectedAnswer prop changes
  useEffect(() => {
    setLocalAnswer(selectedAnswer);
  }, [selectedAnswer]);

  const handleAnswerChange = (optionIndex) => {
    setLocalAnswer(optionIndex);
    onAnswerSelect(optionIndex);
  };

  // Sanitize question text to prevent XSS
  const sanitizedQuestion = DOMPurify.sanitize(question.text);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 question-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Question {questionNumber} of {totalQuestions}
        </h3>
      </div>

      <div 
        className="mb-6 text-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedQuestion }}
      ></div>

      <div className="space-y-3 mb-8">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className="flex items-center"
          >
            <input
              type="radio"
              id={`option-${index}`}
              name={`question-${questionNumber}`}
              value={index}
              checked={localAnswer === index}
              onChange={() => handleAnswerChange(index)}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`option-${index}`}
              className="ml-3 text-gray-700 text-lg cursor-pointer select-none"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(option) 
              }}
            ></label>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`
            px-4 py-2 rounded-md font-medium
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
          onClick={onNext}
          className="px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600"
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
