# Supabase Setup Guide for Examino

This guide will help you set up Supabase for the Examino student dashboard application.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "examino")
4. Set a secure database password
5. Choose a region closest to your users
6. Wait for your project to be created (this may take a few minutes)

## 2. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of the `supabase-schema.sql` file
4. Run the query to create all necessary tables and security policies

## 3. Set Up Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Under "Email Auth", make sure "Enable Email Signup" is turned on
3. Optionally, configure email templates for confirmation, invitation, and magic link emails

## 4. Create Storage Buckets

The SQL script already creates the necessary storage buckets, but verify they exist:

1. Go to Storage in your Supabase dashboard
2. You should see two buckets:
   - `attendance`: For storing attendance images (public)
   - `reference`: For storing reference images (private)

## 5. Update Configuration

1. Go to Settings > API in your Supabase dashboard
2. Copy the "URL" and "anon public" key
3. Update the `src/supabase/config.js` file with these values:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
```

## 6. Create Test Users

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Enter an email and password for your test user
4. After creating the user, note the user's UUID
5. Go to the SQL Editor and run:

```sql
INSERT INTO profiles (id, first_name, last_name, student_id, course, semester)
VALUES (
  'USER_UUID',
  'John',
  'Doe',
  'S12345',
  'Computer Science',
  '3'
);
```

Replace `USER_UUID` with the actual UUID of the user you created.

## 7. Add Reference Images (Optional)

To enable face recognition for attendance:

1. Upload a reference image to the `reference` bucket for each user
2. Update the user's profile with the reference image URL:

```sql
UPDATE profiles
SET reference_image = 'URL_TO_REFERENCE_IMAGE'
WHERE id = 'USER_UUID';
```

## 8. Create Test Exams

Create some test exams in the database:

```sql
INSERT INTO exams (title, description, duration, total_questions, is_active)
VALUES 
  ('Introduction to Programming', 'Basic concepts of programming', 60, 20, true),
  ('Data Structures', 'Advanced data structures and algorithms', 90, 30, true);
```

## 9. Test the Application

1. Start the application with `npm run dev`
2. Navigate to the login page
3. Log in with the test user credentials
4. Verify that all features work correctly

## Troubleshooting

- **Authentication Issues**: Check the browser console for errors. Verify that the Supabase URL and anon key are correct.
- **Database Errors**: Check the RLS policies to ensure they're properly configured.
- **Storage Issues**: Verify that the storage buckets exist and have the correct permissions.

For more help, refer to the [Supabase documentation](https://supabase.com/docs).
