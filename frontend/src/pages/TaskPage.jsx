/**
 * TaskPage.jsx - Task Management Page
 * ======================================
 * Create, view, and update tasks.
 * Includes creation form, status filters, and inline status updates.
 */

import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineClipboardList } from 'react-icons/hi';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchTasks(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks);
    } catch (err) { console.error('Failed to fetch tasks:', err); }
    finally { setLoadingTasks(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskName.trim() || !assignedTo.trim()) {
      setToast({ type: 'error', message: 'Task name and assignee are required' }); return;
    }
    setSubmitting(true);
    try {
      await api.post('/tasks', { task_name: taskName, assigned_to: assignedTo, due_date: dueDate });
      setTaskName(''); setAssignedTo(''); setDueDate(''); setShowForm(false);
      fetchTasks();
      setToast({ type: 'success', message: 'Task created successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to create task' });
    } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      setToast({ type: 'success', message: `Task marked as ${newStatus}` });
    } catch (err) { setToast({ type: 'error', message: 'Failed to update status' }); }
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter((t) => t.status === filter);
  const statusCounts = {
    All: tasks.length,
    Pending: tasks.filter((t) => t.status === 'Pending').length,
    'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
    Completed: tasks.filter((t) => t.status === 'Completed').length,
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>Tasks</h1>
            <p style={{ fontSize: 14, color: 'var(--text-gray)' }}>Create, assign, and track tasks for your team.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" id="create-task-button">
            <HiOutlinePlus size={18} /> New Task
          </button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="card fade-in" style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 24 }}>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label className="form-label">Task Name</label>
                  <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Enter task name" className="input-field" id="task-name-input" />
                </div>
                <div>
                  <label className="form-label">Assign To</label>
                  <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Team member name" className="input-field" id="assigned-to-input" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label className="form-label">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input-field" id="due-date-input" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, opacity: submitting ? 0.7 : 1 }} id="submit-task">
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button key={status} onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: 6,
                background: filter === status ? '#EFF6FF' : 'transparent',
                color: filter === status ? 'var(--primary-blue)' : 'var(--text-gray)',
                border: `1px solid ${filter === status ? '#BFDBFE' : 'var(--border-color)'}`,
              }}>
              {status}
              <span style={{
                padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: filter === status ? '#DBEAFE' : 'var(--bg-primary)',
                color: filter === status ? '#1E40AF' : 'var(--text-light)',
              }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Tasks Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loadingTasks ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}><div className="spinner"></div></div>
          ) : filteredTasks.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Task</th><th>Assigned To</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-dark)' }}>{task.task_name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--secondary-indigo)', color: 'white', fontSize: 12, fontWeight: 600,
                          }}>{task.assigned_to.charAt(0).toUpperCase()}</div>
                          {task.assigned_to}
                        </div>
                      </td>
                      <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>{task.status}</span></td>
                      <td>
                        <select value={task.status} onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                          className="input-field"
                          style={{ width: 'auto', minWidth: 130, padding: '7px 10px', fontSize: 13 }}
                          id={`task-status-${task.id}`}>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '64px 24px' }}>
              <HiOutlineClipboardList size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
              <h3>No tasks found</h3>
              <p>{filter === 'All' ? 'Create your first task to get started.' : `No ${filter.toLowerCase()} tasks.`}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TaskPage;
