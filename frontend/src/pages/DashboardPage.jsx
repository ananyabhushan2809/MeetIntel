/**
 * DashboardPage.jsx - Main Dashboard
 * =====================================
 * Shows overview stats, recent meetings, recent tasks,
 * and a productivity chart.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineTrendingUp,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import Sidebar from '../components/Sidebar';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
    } catch (err) { console.error('Failed to fetch analytics:', err); }
    finally { setLoading(false); }
  };

  const taskChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [
        analytics?.completed_tasks || 0,
        analytics?.in_progress_tasks || 0,
        analytics?.pending_tasks || 0,
      ],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
      borderColor: ['#D1FAE5', '#DBEAFE', '#FEF3C7'],
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { family: 'Inter', size: 12 },
          color: '#64748B',
        },
      },
    },
    cutout: '70%',
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
          <h1>Dashboard</h1>
          <p>Welcome back! Here&apos;s an overview of your workspace.</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard icon={<HiOutlineDocumentText size={22} />}
            value={analytics?.total_meetings || 0} label="Total Meetings"
            color="#2563EB" bgColor="#EFF6FF" />
          <StatCard icon={<HiOutlineClipboardList size={22} />}
            value={analytics?.pending_tasks || 0} label="Pending Tasks"
            color="#F59E0B" bgColor="#FEF3C7" />
          <StatCard icon={<HiOutlineCheckCircle size={22} />}
            value={analytics?.completed_tasks || 0} label="Completed Tasks"
            color="#10B981" bgColor="#D1FAE5" />
          <StatCard icon={<HiOutlineTrendingUp size={22} />}
            value={`${analytics?.productivity || 0}%`} label="Productivity"
            color="#4F46E5" bgColor="#EEF2FF" />
        </div>

        {/* Charts and Tables Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, marginBottom: 28 }}>
          {/* Task Distribution Chart */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 20 }}>
              Task Distribution
            </h3>
            <div style={{ height: 220 }}>
              {analytics?.total_tasks > 0 ? (
                <Doughnut data={taskChartData} options={chartOptions} />
              ) : (
                <div className="empty-state">
                  <p>No tasks yet. Create your first task!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Meetings */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
                Recent Meetings
              </h3>
              <button onClick={() => navigate('/upload')}
                style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <HiOutlineArrowRight size={14} />
              </button>
            </div>

            {analytics?.recent_meetings?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {analytics.recent_meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{meeting.title}</td>
                        <td>{new Date(meeting.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <h3>No meetings yet</h3>
                <p>Upload your first meeting transcript to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
              Recent Tasks
            </h3>
            <button onClick={() => navigate('/tasks')}
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View All <HiOutlineArrowRight size={14} />
            </button>
          </div>

          {analytics?.recent_tasks?.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Task</th><th>Assigned To</th><th>Due Date</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {analytics.recent_tasks.map((task) => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{task.task_name}</td>
                      <td>{task.assigned_to}</td>
                      <td>{task.due_date || '—'}</td>
                      <td>
                        <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Create tasks from the Tasks page to track your work.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
