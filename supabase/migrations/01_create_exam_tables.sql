-- Create exams table
CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration INT CHECK (duration > 0), -- in minutes
  questions JSONB NOT NULL, -- {questionText, options[], correctAnswer}
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id),
  user_id UUID REFERENCES auth.users(id),
  answers JSONB NOT NULL,
  score INT CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, user_id)
);

-- Enable Row-Level Security (RLS)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Exams RLS policies
CREATE POLICY "Admins can create exams" 
  ON exams FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update own exams" 
  ON exams FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can delete own exams" 
  ON exams FOR DELETE 
  USING (auth.uid() = created_by);

CREATE POLICY "Everyone can view active exams" 
  ON exams FOR SELECT 
  USING (is_active = true OR auth.uid() = created_by);

-- Submissions RLS policies
CREATE POLICY "Students can create own submissions" 
  ON submissions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can view own submissions" 
  ON submissions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" 
  ON submissions FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT created_by FROM exams WHERE id = exam_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_exam ON submissions(exam_id);
CREATE INDEX idx_exams_active ON exams(is_active) WHERE is_active = true;
CREATE INDEX idx_exams_created_by ON exams(created_by);
