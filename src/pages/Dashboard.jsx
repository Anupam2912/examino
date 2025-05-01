import { useState, useEffect } from 'react';
import { supabase } from '../supabase/config';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import QuickActionCard from '../components/QuickActionCard';
import ResultsTable from '../components/ResultsTable';
import WebcamModal from '../components/WebcamModal';
import TailwindTest from '../components/TailwindTest';
import TailwindTestRed from '../components/TailwindTestRed';
import InlineStyleTest from '../components/InlineStyleTest';

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExams, setActiveExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  // Fetch recent results
  useEffect(() => {
    async function fetchResults() {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('submitted_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        const resultsData = data.map(item => ({
          id: item.id,
          ...item,
          status: item.score >= 60 ? 'Pass' : 'Fail'
        }));

        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [currentUser]);

  // Check for active exams
  useEffect(() => {
    async function checkActiveExams() {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        setActiveExams(data || []);
      } catch (error) {
        console.error('Error checking active exams:', error);
      } finally {
        setLoadingExams(false);
      }
    }

    checkActiveExams();
  }, []);

  const handleAttendanceClick = () => {
    // Check if user has reference image
    if (!userProfile?.referenceImage) {
      alert('Contact admin to register your face for attendance.');
      return;
    }

    // Check webcam permissions
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        setShowWebcamModal(true);
      })
      .catch(() => {
        alert('Enable camera access to mark attendance.');
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <QuickActionCard
            title="Mark Attendance"
            icon="📷"
            bgColor="bg-blue-100"
            hoverColor="hover:bg-blue-200"
            onClick={handleAttendanceClick}
          />

          <QuickActionCard
            title="Take Exam"
            icon="📝"
            bgColor="bg-green-100"
            hoverColor="hover:bg-green-200"
            linkTo="/exams"
            disabled={!activeExams || activeExams.length === 0 && !loadingExams}
            tooltipText={!activeExams || activeExams.length === 0 && !loadingExams ? "No active exams. Check back later." : ""}
          />
        </div>

        {/* Recent Results */}
        <ResultsTable results={results} loading={loading} />

        {/* Test Components */}
        <TailwindTest />
        <TailwindTestRed />
        <InlineStyleTest />
      </main>

      {/* Webcam Modal */}
      {showWebcamModal && (
        <WebcamModal onClose={() => setShowWebcamModal(false)} />
      )}
    </div>
  );
}
