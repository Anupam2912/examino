# Examino - Student Dashboard System

This document provides an overview of the student dashboard system implemented in Examino.

## Features

### Admin Dashboard
- Overview metrics (total students, attendance rate, exam performance)
- Face data upload for student recognition
- Student management
- Attendance logs with filtering and export
- Exam management (create, edit, activate/deactivate)
- Exam results analytics with charts

### Student Dashboard
- Mark attendance with face recognition
- View attendance history
- Take secure exams with anti-cheat measures
- View exam results with detailed feedback

## Database Schema

### Tables
1. **students**
   - id (UUID, primary key, references auth.users)
   - first_name (TEXT)
   - last_name (TEXT)
   - student_id (TEXT, unique)
   - course (TEXT)
   - semester (TEXT)
   - face_data (TEXT) - Encrypted face descriptor
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. **attendance**
   - id (UUID, primary key)
   - student_id (UUID, references students)
   - timestamp (TIMESTAMP)
   - status (BOOLEAN)
   - image_url (TEXT)
   - confidence (FLOAT)
   - device_info (JSONB)

3. **exams**
   - id (UUID, primary key)
   - title (TEXT)
   - description (TEXT)
   - duration (INT) - in minutes
   - questions (JSONB) - array of question objects
   - is_active (BOOLEAN)
   - created_at (TIMESTAMP)
   - created_by (UUID, references auth.users)

4. **exam_results**
   - id (UUID, primary key)
   - exam_id (UUID, references exams)
   - student_id (UUID, references students)
   - answers (JSONB) - array of selected answers
   - score (INT) - percentage score
   - submitted_at (TIMESTAMP)
   - duration_taken (INT) - in seconds

## Setup Instructions

### 1. Database Setup
1. Run the SQL scripts in the `supabase/migrations` directory:
   - `01_create_exam_tables.sql`
   - `02_create_additional_tables.sql`

2. Set up Supabase storage buckets:
   - Create a `students` bucket with public read access
   - Create folders: `reference` and `attendance`

### 2. Face Recognition Setup
1. Download face-api.js models:
   ```bash
   mkdir -p public/models
   # Download models from https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   ```

2. Place the following models in the `public/models` directory:
   - `ssd_mobilenetv1_model-weights_manifest.json`
   - `ssd_mobilenetv1_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`

### 3. Install Required Dependencies
```bash
npm install react-webcam face-api.js date-fns screenfull chart.js react-chartjs-2 react-hook-form
```

## Usage

### Admin Workflow
1. Navigate to `/admin`
2. Use the sidebar to access different sections:
   - Dashboard: View overall metrics
   - Exam Management: Create and manage exams
   - Student Management: Register face data for students
   - Attendance Logs: View and export attendance records

### Student Workflow
1. Navigate to `/attendance` to mark attendance
2. Navigate to `/exams` to take available exams
3. Navigate to `/results` to view exam results

## Implementation Details

### Face Recognition
```javascript
// Register face data
const faceDescriptor = Array.from(detections.descriptor);
const encryptedFaceData = encryptData(JSON.stringify(faceDescriptor));

// Verify face
const storedDescriptorString = decryptData(userProfile.face_data);
const storedDescriptor = new Float32Array(JSON.parse(storedDescriptorString));
const distance = faceapi.euclideanDistance(detections.descriptor, storedDescriptor);
const match = distance < threshold;
```

### Exam Anti-Cheat Measures
```javascript
// Fullscreen enforcement
useEffect(() => {
  const handleFullscreenChange = () => {
    if (!screenfull.isFullscreen) {
      handleViolation('fullscreen');
    }
  };
  
  if (screenfull.isEnabled) {
    screenfull.on('change', handleFullscreenChange);
  }
}, []);

// Tab/window visibility detection
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      handleViolation('tab');
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

## Security Considerations

1. **Face Data**: All face descriptors are encrypted using AES-256 before storage
2. **Row-Level Security**: Supabase RLS policies ensure users can only access their own data
3. **Anti-Cheat Measures**: Multiple techniques to prevent cheating during exams
4. **Input Sanitization**: All user input is sanitized to prevent XSS attacks

## Future Enhancements

1. **Liveness Detection**: Enhance face recognition with liveness detection
2. **Batch Upload**: Allow admin to upload student data in batch
3. **Mobile App**: Create a dedicated mobile app for attendance marking
4. **Offline Mode**: Support offline exam taking with sync when online
5. **Advanced Analytics**: Add more detailed analytics for student performance

## Troubleshooting

### Common Issues
1. **Face Recognition Not Working**: Check camera permissions and lighting conditions
2. **Exam Not Submitting**: Check network connection and browser compatibility
3. **Charts Not Displaying**: Ensure Chart.js is properly initialized

### Support
For additional support, please contact the development team.
