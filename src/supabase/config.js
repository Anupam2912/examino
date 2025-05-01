// Mock Supabase client for development
// import { createClient } from '@supabase/supabase-js';

// Mock data
const mockData = {
  profiles: [
    {
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'User',
      student_id: 'S12345',
      course: 'Computer Science',
      semester: '3',
      reference_image: 'https://via.placeholder.com/150',
    }
  ],
  exams: [
    {
      id: 'exam-1',
      title: 'Introduction to Programming',
      description: 'Basic concepts of programming',
      duration: 60,
      total_questions: 20,
      is_active: true,
    },
    {
      id: 'exam-2',
      title: 'Data Structures',
      description: 'Advanced data structures and algorithms',
      duration: 90,
      total_questions: 30,
      is_active: true,
    }
  ],
  submissions: [
    {
      id: 'submission-1',
      user_id: 'test-user-id',
      exam_id: 'exam-1',
      exam_name: 'Introduction to Programming',
      score: 85,
      submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'submission-2',
      user_id: 'test-user-id',
      exam_id: 'exam-2',
      exam_name: 'Data Structures',
      score: 72,
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ],
  attendance: [
    {
      id: 'attendance-1',
      user_id: 'test-user-id',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'verified',
    },
    {
      id: 'attendance-2',
      user_id: 'test-user-id',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'verified',
    }
  ],
  exam_questions: [
    {
      id: 'question-1',
      exam_id: 'exam-1',
      question_number: 1,
      question_text: 'What is the capital of France?',
      options: JSON.stringify(['London', 'Paris', 'Berlin', 'Madrid']),
      correct_answer: 1,
    },
    {
      id: 'question-2',
      exam_id: 'exam-1',
      question_number: 2,
      question_text: 'Which of the following is NOT a programming language?',
      options: JSON.stringify(['Java', 'Python', 'HTML', 'C++']),
      correct_answer: 2,
    }
  ]
};

// Mock Supabase client
const supabase = {
  auth: {
    signInWithPassword: ({ email, password }) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'test@example.com' && password === 'password123') {
            resolve({
              data: {
                user: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                }
              },
              error: null
            });
          } else {
            reject({ error: 'Invalid login credentials' });
          }
        }, 500);
      });
    },
    signOut: () => {
      return Promise.resolve({ error: null });
    },
    getSession: () => {
      return Promise.resolve({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
            }
          }
        }
      });
    },
    onAuthStateChange: (callback) => {
      // Mock auth state change listener
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table) => {
    return {
      select: (fields) => {
        return {
          eq: (field, value) => {
            return {
              single: () => {
                const item = mockData[table]?.find(item => item[field] === value);
                return Promise.resolve({ data: item || null, error: null });
              },
              order: (orderField, { ascending }) => {
                const items = mockData[table]?.filter(item => item[field] === value) || [];
                const sortedItems = [...items].sort((a, b) => {
                  if (ascending) {
                    return a[orderField] > b[orderField] ? 1 : -1;
                  } else {
                    return a[orderField] < b[orderField] ? 1 : -1;
                  }
                });
                return {
                  limit: (num) => {
                    return Promise.resolve({ data: sortedItems.slice(0, num), error: null });
                  }
                };
              }
            };
          },
          order: (orderField, { ascending }) => {
            const items = mockData[table] || [];
            const sortedItems = [...items].sort((a, b) => {
              if (ascending) {
                return a[orderField] > b[orderField] ? 1 : -1;
              } else {
                return a[orderField] < b[orderField] ? 1 : -1;
              }
            });
            return {
              limit: (num) => {
                return Promise.resolve({ data: sortedItems.slice(0, num), error: null });
              }
            };
          }
        };
      },
      insert: (data) => {
        return Promise.resolve({ data, error: null });
      },
      upsert: (data) => {
        return Promise.resolve({ data, error: null });
      },
      delete: () => {
        return {
          eq: () => {
            return Promise.resolve({ error: null });
          }
        };
      }
    };
  },
  storage: {
    from: (bucket) => {
      return {
        upload: (path, file) => {
          return Promise.resolve({ data: { path }, error: null });
        },
        getPublicUrl: (path) => {
          return { data: { publicUrl: `https://via.placeholder.com/150?text=${path}` } };
        }
      };
    }
  }
};

export { supabase };
