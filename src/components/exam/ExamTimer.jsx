import { useState, useEffect, useCallback } from 'react';

export default function ExamTimer({ 
  durationMinutes, 
  onTimeUp,
  isPaused = false
}) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  // Format time as mm:ss
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    // Reset timer if duration changes
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    // Set warning state when 5 minutes or less remain
    setIsWarning(timeLeft <= 300);
  }, [timeLeft]);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUp, isPaused]);

  return (
    <div className="flex items-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 mr-2" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span 
        className={`font-mono font-medium ${
          isWarning ? 'text-red-500 animate-pulse' : ''
        }`}
        aria-label="Time remaining"
      >
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}
