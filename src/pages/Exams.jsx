import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ExamLobby from '../components/exam/ExamLobby';

export default function Exams() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">Available Exams</h2>

        <ExamLobby />
      </main>
    </div>
  );
}
