-- Create exam_questions table
CREATE TABLE exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(exam_id, question_number)
);

-- Create exam_progress table for saving in-progress exams
CREATE TABLE exam_progress (
  user_id UUID REFERENCES auth.users NOT NULL,
  exam_id UUID REFERENCES exams NOT NULL,
  answers TEXT NOT NULL, -- Encrypted JSON string of answers
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, exam_id)
);

-- Add RLS policies for exam_questions
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exam questions" 
  ON exam_questions FOR SELECT 
  TO authenticated 
  USING (true);

-- Add RLS policies for exam_progress
ALTER TABLE exam_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exam progress" 
  ON exam_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own exam progress" 
  ON exam_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exam progress" 
  ON exam_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exam progress" 
  ON exam_progress FOR DELETE 
  USING (auth.uid() = user_id);

-- Sample data for testing
INSERT INTO exam_questions (exam_id, question_number, question_text, options, correct_answer)
VALUES 
  ('EXAM_ID_HERE', 1, 'What is the capital of France?', '["London", "Paris", "Berlin", "Madrid"]', 1),
  ('EXAM_ID_HERE', 2, 'Which of the following is NOT a programming language?', '["Java", "Python", "HTML", "C++"]', 2),
  ('EXAM_ID_HERE', 3, 'What is 2 + 2?', '["3", "4", "5", "6"]', 1),
  ('EXAM_ID_HERE', 4, 'Who painted the Mona Lisa?', '["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"]', 2),
  ('EXAM_ID_HERE', 5, 'Which planet is known as the Red Planet?', '["Venus", "Mars", "Jupiter", "Saturn"]', 1);

-- Note: Replace 'EXAM_ID_HERE' with an actual exam ID from your database
