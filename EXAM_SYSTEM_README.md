# Examino - Secure Exam System

This document provides an overview of the secure exam system implemented in Examino.

## Features

### Admin Features
- Create and manage exams
- Add multiple-choice questions with options
- Set exam duration
- Activate/deactivate exams
- View detailed exam results and analytics
- Export results to CSV

### Student Features
- View available exams
- Take exams in a secure environment
- Real-time answer saving
- View detailed exam results

## Security Measures

### Anti-Cheat Protections
1. **Fullscreen Enforcement**: Students must remain in fullscreen mode during the exam
2. **Tab/Window Change Detection**: Switching tabs or windows is detected and logged
3. **Copy/Paste Prevention**: Copy and paste functionality is disabled during exams
4. **Screenshot Prevention**: CSS techniques are used to prevent screenshots
5. **Violation Tracking**: After 3 violations, the exam is automatically submitted

### Data Security
1. **Encrypted Answers**: All answers are encrypted using AES-256 before storage
2. **Row-Level Security**: Supabase RLS policies ensure users can only access their own data
3. **Auto-Save**: Answers are automatically saved every 30 seconds
4. **Offline Recovery**: Answers are saved locally in case of connection issues

## Database Schema

### Tables
1. **exams**
   - id (UUID, primary key)
   - title (TEXT)
   - description (TEXT)
   - duration (INT) - in minutes
   - questions (JSONB) - array of question objects
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)
   - created_by (UUID, references auth.users)

2. **submissions**
   - id (UUID, primary key)
   - exam_id (UUID, references exams)
   - user_id (UUID, references auth.users)
   - answers (JSONB) - array of selected answers
   - score (INT) - percentage score
   - submitted_at (TIMESTAMP)

### Row-Level Security Policies
- Admins can create, update, and delete their own exams
- Everyone can view active exams
- Students can only create and view their own submissions
- Admins can view submissions for exams they created

## Components

### Admin Components
1. **ExamForm**: Create and edit exams with questions
2. **ExamList**: List and manage exams with activation toggle
3. **ExamResults**: View detailed exam results with analytics

### Student Components
1. **ExamLobby**: View available exams and start them
2. **ExamInterface**: Secure exam-taking interface with anti-cheat measures
3. **ResultsView**: View detailed exam results

## Usage

### Admin Workflow
1. Navigate to `/admin`
2. Create a new exam with questions
3. Activate the exam when ready for students
4. View results after students complete the exam

### Student Workflow
1. Navigate to `/exams`
2. Start an available exam
3. Complete the exam in the secure environment
4. View results after submission

## Implementation Details

### Exam Creation
```javascript
// Create a new exam
const { data, error } = await supabase
  .from('exams')
  .insert({
    title: 'Sample Exam',
    description: 'This is a sample exam',
    duration: 60,
    questions: [
      {
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      }
    ],
    created_by: userId
  });
```

### Exam Submission
```javascript
// Submit an exam
const { data, error } = await supabase
  .from('submissions')
  .insert({
    exam_id: examId,
    user_id: userId,
    answers: [1, 0, 2, 1], // Array of selected answer indices
    score: 75, // Calculated score
    submitted_at: new Date().toISOString()
  });
```

### Anti-Cheat Implementation
```javascript
// Fullscreen detection
useEffect(() => {
  const handleFullscreenChange = () => {
    if (!screenfull.isFullscreen) {
      handleViolation('fullscreen');
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
}, []);

// Tab/window visibility detection
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
```

## Future Enhancements

1. **AI Proctoring**: Implement webcam-based proctoring with eye-tracking
2. **Question Bank**: Create a question bank for random question selection
3. **Timed Questions**: Set time limits for individual questions
4. **Essay Questions**: Support for essay-type questions with manual grading
5. **Exam Templates**: Save and reuse exam templates

## Troubleshooting

### Common Issues
1. **Fullscreen Not Working**: Check browser permissions and compatibility
2. **Answers Not Saving**: Check network connection and Supabase configuration
3. **Exam Not Submitting**: Ensure the submission format matches the expected schema

### Support
For additional support, please contact the development team.
