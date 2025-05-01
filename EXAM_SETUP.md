# Exam Interface Setup Guide for Examino

This guide will help you set up the secure exam interface for the Examino student dashboard application.

## 1. Database Setup

First, you need to update your Supabase database schema to include the necessary tables for the exam interface:

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of the `exam-schema-update.sql` file
4. Run the query to create the exam_questions and exam_progress tables

## 2. Create Sample Exam Questions

To test the exam interface, you need to create some sample exam questions:

1. First, create an exam in the exams table if you haven't already:

```sql
INSERT INTO exams (title, description, duration, total_questions, is_active)
VALUES ('Sample Exam', 'This is a sample exam for testing', 30, 5, true);
```

2. Note the UUID of the exam you just created
3. Update the sample questions in the `exam-schema-update.sql` file with the correct exam ID
4. Run the INSERT statements to create the sample questions

## 3. Install Required Dependencies

The exam interface requires several dependencies:

```bash
npm install screenfull dompurify
```

## 4. Configure Anti-Cheat Features

The exam interface includes several anti-cheat features:

1. **Fullscreen Enforcement**: The exam will automatically enter fullscreen mode and warn the user if they exit
2. **Tab/Window Change Detection**: The exam will detect if the user switches tabs or windows
3. **Clipboard Disabling**: Copy and paste functionality is disabled during the exam
4. **Screenshot Prevention**: CSS is used to prevent screenshots of the exam content

## 5. Testing the Exam Interface

To test the exam interface:

1. Start the application with `npm run dev`
2. Log in with a test user
3. Navigate to the Exams page
4. Click on "Start Exam" for one of the active exams
5. The exam should open in fullscreen mode
6. Test the following features:
   - Answering questions
   - Navigating between questions
   - Timer functionality
   - Anti-cheat measures
   - Submitting the exam

## 6. Customizing the Exam Interface

You can customize the exam interface by modifying the following files:

- `src/pages/Exam.jsx`: Main exam page
- `src/components/exam/*.jsx`: Individual exam components
- `src/styles/exam.css`: Exam-specific styles

## 7. Security Considerations

The exam interface includes several security features:

1. **Encrypted Answers**: All answers are encrypted using AES-256 before being stored
2. **Input Sanitization**: All user input is sanitized to prevent XSS attacks
3. **Auto-Save**: Answers are automatically saved every 30 seconds
4. **Violation Tracking**: The system tracks violations and can auto-submit after a certain number

## 8. Troubleshooting

- **Fullscreen Issues**: If fullscreen mode doesn't work, check browser permissions
- **Timer Issues**: If the timer doesn't work correctly, check for JavaScript errors in the console
- **Database Issues**: Verify that the exam_questions and exam_progress tables are properly created
- **Encryption Issues**: Make sure the encryption key is consistent across the application

For more help, refer to the [Supabase documentation](https://supabase.com/docs) or the [React documentation](https://reactjs.org/docs).
