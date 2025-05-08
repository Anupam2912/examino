import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

export default function Attendance() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'history'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-6">Attendance</h2>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-lg text-gray-700">
            Attendance marking feature is coming soon. This will allow you to mark your attendance using facial recognition.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="bg-blue-100 text-blue-800 p-4 rounded-md max-w-md">
              <h3 className="font-semibold mb-2">How it will work:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Your face will be registered by an administrator</li>
                <li>You'll be able to mark attendance by scanning your face</li>
                <li>The system will verify your identity and record your attendance</li>
                <li>You'll be able to view your attendance history</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
