import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function AdminDashboard() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>

          <div className="mb-6">
            <p className="text-gray-700">
              You are logged in as: <span className="font-semibold">{currentUser?.email}</span>
            </p>
            {userProfile && (
              <p className="text-gray-700 mt-2">
                Name: <span className="font-semibold">{userProfile.first_name} {userProfile.last_name}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Exam Management</h3>
              <p className="text-blue-700 mb-4">Create and manage exams, view results, and analyze student performance.</p>
              <p className="text-sm text-blue-600">Coming soon</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Student Management</h3>
              <p className="text-green-700 mb-4">Manage student profiles, register face data, and view attendance records.</p>
              <p className="text-sm text-green-600">Coming soon</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Attendance Logs</h3>
              <p className="text-purple-700 mb-4">View and export attendance records, filter by date and student.</p>
              <p className="text-sm text-purple-600">Coming soon</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Analytics Dashboard</h3>
              <p className="text-yellow-700 mb-4">View attendance rates, exam performance, and other key metrics.</p>
              <p className="text-sm text-yellow-600">Coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
