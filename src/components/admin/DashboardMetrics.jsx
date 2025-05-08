import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    examPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch total students
        const { count: totalStudents, error: studentsError } = await supabase
          .from('students')
          .select('count');
        
        if (studentsError) throw studentsError;
        
        // Fetch attendance rate
        const { data: attendanceData, error: attendanceError } = await supabase
          .rpc('get_attendance_rate');
        
        if (attendanceError) throw attendanceError;
        
        // Fetch exam performance
        const { data: examPerformance, error: examError } = await supabase
          .rpc('get_exam_performance');
        
        if (examError) throw examError;
        
        setMetrics({
          totalStudents: totalStudents || 0,
          attendanceRate: attendanceData || 0,
          examPerformance: examPerformance || []
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-8">
        {error}
      </div>
    );
  }
  
  // Prepare chart data
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [metrics.attendanceRate, 100 - metrics.attendanceRate],
        backgroundColor: ['#4ade80', '#f87171'],
        borderColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };
  
  const examData = {
    labels: metrics.examPerformance.map(exam => exam.exam_title),
    datasets: [
      {
        label: 'Average Score (%)',
        data: metrics.examPerformance.map(exam => exam.avg_score),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Pass Rate (%)',
        data: metrics.examPerformance.map(exam => exam.pass_rate),
        backgroundColor: '#34d399',
      },
    ],
  };
  
  const examOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Exam Performance',
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
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-6">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Students</h3>
          <p className="text-3xl font-bold">{metrics.totalStudents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Attendance Rate</h3>
          <p className="text-3xl font-bold">{metrics.attendanceRate.toFixed(1)}%</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Exam Score</h3>
          <p className="text-3xl font-bold">
            {metrics.examPerformance.length > 0
              ? (metrics.examPerformance.reduce((sum, exam) => sum + exam.avg_score, 0) / metrics.examPerformance.length).toFixed(1)
              : 'N/A'}%
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Attendance Overview</h3>
          <div className="h-64">
            <Pie data={attendanceData} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Exam Performance</h3>
          <div className="h-64">
            <Bar data={examData} options={examOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
