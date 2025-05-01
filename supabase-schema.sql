-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  semester TEXT NOT NULL,
  reference_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  exam_id UUID REFERENCES exams NOT NULL,
  exam_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exam_id)
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed'))
);

-- Create RLS (Row Level Security) policies
-- Profiles: Users can only read/write their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Exams: Users can only read exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exams" 
  ON exams FOR SELECT 
  TO authenticated 
  USING (true);

-- Submissions: Users can only read/create their own submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions" 
  ON submissions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own submissions" 
  ON submissions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Attendance: Users can only read/create their own attendance records
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance" 
  ON attendance FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attendance" 
  ON attendance FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('attendance', 'attendance', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('reference', 'reference', false);

-- Set up storage policies
-- Attendance: Users can only upload to their own folder
CREATE POLICY "Users can upload to their own attendance folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attendance' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own attendance images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attendance' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Reference: Only admins can upload reference images
CREATE POLICY "Only admins can upload reference images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reference' AND
    auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
  );

CREATE POLICY "Users can view their own reference images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reference' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
