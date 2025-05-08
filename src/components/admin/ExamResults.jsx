import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ExamResults({ exam }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    passingRate: 0,
    questionStats: []
  });
  
  useEffect(() => {
    if (!exam) return;
    
    const fetchSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .select('*, profiles:user_id(first_name, last_name)')
          .eq('exam_id', exam.id)
          .order('submitted_at', { ascending: false });
        
        if (error) throw error;
        
        setSubmissions(data || []);
        calculateStats(data || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load exam results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubmissions();
  }, [exam]);
  
  const calculateStats = (submissions) => {
    if (!submissions.length) {
      setStats({
        totalSubmissions: 0,
        averageScore: 0,
        passingRate: 0,
        questionStats: []
      });
      return;
    }
    
    // Calculate basic stats
    const totalSubmissions = submissions.length;
    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    const averageScore = totalScore / totalSubmissions;
    const passingSubmissions = submissions.filter(sub => sub.score >= 60).length;
    const passingRate = (passingSubmissions / totalSubmissions) * 100;
    
    // Calculate per-question stats
    const questionStats = [];
    
    if (exam.questions && exam.questions.length > 0) {
      for (let i = 0; i < exam.questions.length; i++) {
        const correctCount = submissions.reduce((count, sub) => {
          return count + (sub.answers[i] === exam.questions[i].correctAnswer ? 1 : 0);
        }, 0);
        
        const correctRate = (correctCount / totalSubmissions) * 100;
        
        questionStats.push({
          questionText: exam.questions[i].questionText,
          correctRate
        });
      }
    }
    
    setStats({
      totalSubmissions,
      averageScore,
      passingRate,
      questionStats
    });
  };
  
  const exportToCSV = () => {
    if (!submissions.length) return;
    
    // Create CSV header
    const headers = ['Student Name', 'Score', 'Submission Date'];
    
    // Create CSV rows
    const rows = submissions.map(sub => [
      `${sub.profiles?.first_name || ''} ${sub.profiles?.last_name || ''}`,
      sub.score,
      new Date(sub.submitted_at).toLocaleString()
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exam.title}_results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  const pieData = {
    labels: ['Pass', 'Fail'],
    datasets: [
      {
        data: [stats.passingRate, 100 - stats.passingRate],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };
  
  const barData = {
    labels: stats.questionStats.map((q, i) => `Q${i + 1}`),
    datasets: [
      {
        label: 'Correct Answer Rate (%)',
        data: stats.questionStats.map(q => q.correctRate),
        backgroundColor: '#60a5fa',
      },
    ],
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Question Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Results: {exam.title}</h2>
        <button
          onClick={exportToCSV}
          disabled={submissions.length === 0}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>
      
      {submissions.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
          No submissions yet for this exam.
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Total Submissions</h3>
              <p className="text-2xl font-bold text-blue-900">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-700 mb-1">Average Score</h3>
              <p className="text-2xl font-bold text-green-900">{stats.averageScore.toFixed(1)}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-700 mb-1">Passing Rate</h3>
              <p className="text-2xl font-bold text-purple-900">{stats.passingRate.toFixed(1)}%</p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-2">Pass/Fail Distribution</h3>
              <div className="h-64">
                <Pie data={pieData} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Question Performance</h3>
              <div className="h-64">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </div>
          
          {/* Question Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Question Analysis</h3>
            <div className="space-y-3">
              {stats.questionStats.map((q, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-medium">Q{i + 1}: {q.questionText}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      q.correctRate >= 70 
                        ? 'bg-green-100 text-green-800' 
                        : q.correctRate >= 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {q.correctRate.toFixed(1)}% correct
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        q.correctRate >= 70 
                          ? 'bg-green-600' 
                          : q.correctRate >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-600'
                      }`}
                      style={{ width: `${q.correctRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Submissions Table */}
          <div>
            <h3 className="text-lg font-medium mb-3">Individual Submissions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {submission.profiles?.first_name} {submission.profiles?.last_name}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {submission.score}%
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          submission.score >= 60 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {submission.score >= 60 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
