-- Create students table with face data
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  course TEXT NOT NULL,
  semester TEXT NOT NULL,
  face_data TEXT, -- Encrypted face descriptor
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  confidence FLOAT,
  device_info JSONB
);

-- Create exam_results table (renamed from submissions for clarity)
CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id),
  student_id UUID REFERENCES students(id),
  answers JSONB NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_taken INTEGER, -- in seconds
  UNIQUE(exam_id, student_id)
);

-- Enable Row-Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view own profile" 
  ON students FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Students can update own profile" 
  ON students FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all students" 
  ON students FOR SELECT 
  USING (auth.jwt() ->> 'is_admin' = 'true');

CREATE POLICY "Admins can update all students" 
  ON students FOR UPDATE 
  USING (auth.jwt() ->> 'is_admin' = 'true');

-- RLS Policies for attendance table
CREATE POLICY "Students can view own attendance" 
  ON attendance FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own attendance" 
  ON attendance FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all attendance" 
  ON attendance FOR SELECT 
  USING (auth.jwt() ->> 'is_admin' = 'true');

-- RLS Policies for exam_results table
CREATE POLICY "Students can view own exam results" 
  ON exam_results FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own exam results" 
  ON exam_results FOR INSERT 
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all exam results" 
  ON exam_results FOR SELECT 
  USING (auth.jwt() ->> 'is_admin' = 'true');

-- Create indexes for performance
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_timestamp ON attendance(timestamp);
CREATE INDEX idx_exam_results_student ON exam_results(student_id);
CREATE INDEX idx_exam_results_exam ON exam_results(exam_id);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_attendance_rate(start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL, end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS FLOAT AS $$
DECLARE
  rate FLOAT;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE status = TRUE) * 100.0 / NULLIF(COUNT(*), 0) INTO rate
  FROM attendance
  WHERE 
    (start_date IS NULL OR timestamp >= start_date) AND
    (end_date IS NULL OR timestamp <= end_date);
  
  RETURN COALESCE(rate, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_exam_performance()
RETURNS TABLE (exam_id UUID, exam_title TEXT, avg_score FLOAT, pass_rate FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    AVG(er.score)::FLOAT,
    COUNT(*) FILTER (WHERE er.score >= 60) * 100.0 / NULLIF(COUNT(*), 0) AS pass_rate
  FROM 
    exams e
    LEFT JOIN exam_results er ON e.id = er.exam_id
  GROUP BY 
    e.id, e.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
