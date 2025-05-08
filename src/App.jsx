import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Exams from './pages/Exams';
import Exam from './pages/Exam';
import Results from './pages/Results';
import Attendance from './pages/Attendance';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/exams" element={
            <PrivateRoute>
              <Exams />
            </PrivateRoute>
          } />

          <Route path="/results" element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          } />

          <Route path="/attendance" element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          } />

          <Route path="/exam/:examId" element={
            <PrivateRoute>
              <Exam />
            </PrivateRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Redirect any unknown routes to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
