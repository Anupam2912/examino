export default function WarningModal({ 
  isOpen, 
  type, 
  onResume, 
  onSubmit,
  violationCount = 0
}) {
  if (!isOpen) return null;

  let title = '';
  let message = '';

  switch (type) {
    case 'fullscreen':
      title = 'Fullscreen Mode Required';
      message = 'Please return to fullscreen mode to continue the exam.';
      break;
    case 'tab':
      title = 'Warning: Tab Change Detected';
      message = 'Switching tabs or windows during the exam is not allowed.';
      break;
    case 'submit':
      title = 'Submit Exam';
      message = 'Are you sure you want to submit your exam? This action cannot be undone.';
      break;
    case 'violation':
      title = 'Exam Violation Warning';
      message = `You have ${violationCount} violation(s). After 3 violations, your exam will be automatically submitted.`;
      break;
    default:
      title = 'Warning';
      message = 'Please continue with your exam.';
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-4">
          {type === 'submit' && (
            <button
              onClick={onResume}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={type === 'submit' ? onSubmit : onResume}
            className={`
              px-4 py-2 rounded-md font-medium
              ${
                type === 'submit'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            {type === 'submit' ? 'Submit Now' : 'Resume Exam'}
          </button>
        </div>
      </div>
    </div>
  );
}
