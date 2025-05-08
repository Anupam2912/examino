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
      questions: [
        {
          questionText: 'What is the capital of France?',
          options: ['London', 'Paris', 'Berlin', 'Madrid'],
          correctAnswer: 1
        },
        {
          questionText: 'Which of the following is NOT a programming language?',
          options: ['Java', 'Python', 'HTML', 'C++'],
          correctAnswer: 2
        },
        {
          questionText: 'What does HTML stand for?',
          options: ['Hyper Text Markup Language', 'High Tech Multi Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
          correctAnswer: 0
        },
        {
          questionText: 'Which symbol is used for comments in JavaScript?',
          options: ['#', '//', '<!-- -->', '/* */'],
          correctAnswer: 1
        },
        {
          questionText: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var x = 5;', 'variable x = 5;', 'x = 5;', 'int x = 5;'],
          correctAnswer: 0
        }
      ],
      is_active: true,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'test-user-id'
    },
    {
      id: 'exam-2',
      title: 'Data Structures',
      description: 'Advanced data structures and algorithms',
      duration: 90,
      questions: [
        {
          questionText: 'Which data structure uses LIFO?',
          options: ['Queue', 'Stack', 'Linked List', 'Tree'],
          correctAnswer: 1
        },
        {
          questionText: 'What is the time complexity of binary search?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctAnswer: 2
        },
        {
          questionText: 'Which sorting algorithm has the best average time complexity?',
          options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'],
          correctAnswer: 2
        }
      ],
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'test-user-id'
    }
  ],
  submissions: [
    {
      id: 'submission-1',
      user_id: 'test-user-id',
      exam_id: 'exam-1',
      answers: [
        1, // Paris
        2, // HTML
        0, // Hyper Text Markup Language
        1, // //
        0  // var x = 5;
      ],
      score: 85,
      submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'submission-2',
      user_id: 'test-user-id',
      exam_id: 'exam-2',
      answers: [
        1, // Stack
        2, // O(log n)
        2  // Quick Sort
      ],
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
