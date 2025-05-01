import { createContext, useContext, useState, useEffect } from 'react';
// Mock authentication for development
// import { supabase } from '../supabase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Test credentials
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';
  const TEST_USER = {
    id: 'test-user-id',
    email: TEST_EMAIL,
  };
  const TEST_PROFILE = {
    id: 'test-user-id',
    first_name: 'Test',
    last_name: 'User',
    student_id: 'S12345',
    course: 'Computer Science',
    semester: '3',
    reference_image: 'https://via.placeholder.com/150',
  };

  async function login(email, password) {
    // Mock login for development
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === TEST_EMAIL && password === TEST_PASSWORD) {
          setCurrentUser(TEST_USER);
          setUserProfile(TEST_PROFILE);
          resolve({ user: TEST_USER });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // Simulate network delay
    });
  }

  async function logout() {
    // Mock logout for development
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentUser(null);
        setUserProfile(null);
        resolve();
      }, 500); // Simulate network delay
    });
  }

  useEffect(() => {
    // Mock initial auth check
    // For development, we'll auto-login with test credentials
    const initAuth = () => {
      // Uncomment the following lines to auto-login
      // setCurrentUser(TEST_USER);
      // setUserProfile(TEST_PROFILE);
      setLoading(false);
    };

    initAuth();

    return () => {
      // No cleanup needed for mock auth
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
