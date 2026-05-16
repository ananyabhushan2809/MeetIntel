/**
 * AnalyticsPage.jsx - Analytics Dashboard
 * ==========================================
 * Displays charts and statistics using Chart.js.
 * Shows meetings over time, task distribution, and productivity trends.
 */

import { useState, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineTrendingUp, HiOutlineClock } from 'react-icons/hi';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setAnalytics(res.data);
    } catch (err) { console.error('Failed to fetch analytics:', err); }
    finally { setLoading(false); }
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { padding: 20, usePointStyle: true, pointStyleWidth: 8, font: { family: 'Inter', size: 12 }, color: '#64748B' },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' } },
      y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#94A3B8' }, beginAtZero: true },
    },
  };

  const taskDoughnut = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [analytics?.completed_tasks || 0, analytics?.in_progress_tasks || 0, analytics?.pending_tasks || 0],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      borderColor: ['#D1FAE5', '#DBEAFE', '#FEF3C7'],
      borderWidth: 2, hoverOffset: 6,
    }],
  };

  const taskBar = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      label: 'Tasks',
      data: [analytics?.completed_tasks || 0, analytics?.in_progress_tasks || 0, analytics?.pending_tasks || 0],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)'],
      borderRadius: 6, borderSkipped: false, barThickness: 40,
    }],
  };

  const meetingDates = (analytics?.meetings_by_date || []).reverse();
  const meetingsLine = {
    labels: meetingDates.map((m) => { const d = new Date(m.date); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }),
    datasets: [{
      label: 'Meetings',
      data: meetingDates.map((m) => m.count),
      borderColor: '#2563EB', backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#2563EB', pointBorderColor: '#fff', pointBorderWidth: 2,
    }],
  };

  if (loading) {
    return (
      <div className="page-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>Analytics</h1>
          <p>Insights and metrics for your meetings and tasks.</p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard icon={<HiOutlineDocumentText size={22} />} value={analytics?.total_meetings || 0} label="Total Meetings" color="#2563EB" bgColor="#EFF6FF" />
          <StatCard icon={<HiOutlineClock size={22} />} value={analytics?.pending_tasks || 0} label="Pending Tasks" color="#F59E0B" bgColor="#FEF3C7" />
          <StatCard icon={<HiOutlineCheckCircle size={22} />} value={analytics?.completed_tasks || 0} label="Completed Tasks" color="#10B981" bgColor="#D1FAE5" />
          <StatCard icon={<HiOutlineTrendingUp size={22} />} value={`${analytics?.productivity || 0}%`} label="Productivity Rate" color="#4F46E5" bgColor="#EEF2FF" />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
          {/* Task Distribution */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 24 }}>Task Distribution</h3>
            <div style={{ height: 260 }}>
              {analytics?.total_tasks > 0 ? (
                <Doughnut data={taskDoughnut} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { family: 'Inter', size: 12 }, color: '#64748B' } } } }} />
              ) : (
                <div className="empty-state"><p>No task data available yet.</p></div>
              )}
            </div>
          </div>

          {/* Task Completion Bar */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 24 }}>Task Status Overview</h3>
            <div style={{ height: 260 }}>
              {analytics?.total_tasks > 0 ? (
                <Bar data={taskBar} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
              ) : (
                <div className="empty-state"><p>No task data available yet.</p></div>
              )}
            </div>
          </div>
        </div>

        {/* Meetings Over Time */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 24 }}>Meetings Over Time</h3>
          <div style={{ height: 280 }}>
            {meetingDates.length > 0 ? (
              <Line data={meetingsLine} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } }} />
            ) : (
              <div className="empty-state"><p>Upload meetings to see trends over time.</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;
