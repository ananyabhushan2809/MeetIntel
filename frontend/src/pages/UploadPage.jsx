/**
 * UploadPage.jsx - Upload Meeting Notes
 * ========================================
 * Allows users to upload meeting transcripts (paste text or upload .txt file).
 * Generates a summary using the backend's simple text summarization.
 * Shows a list of past meetings with their summaries.
 */

import { useState, useEffect } from 'react';
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from 'react-icons/hi';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

function UploadPage() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchMeetings(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings');
      setMeetings(response.data.meetings);
    } catch (err) { console.error('Failed to fetch meetings:', err); }
    finally { setLoadingMeetings(false); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setToast({ type: 'error', message: 'Please upload a .txt file' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setTranscript(event.target.result);
      setToast({ type: 'success', message: 'File loaded successfully!' });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !transcript.trim()) {
      setToast({ type: 'error', message: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    setShowResult(false);
    try {
      const response = await api.post('/meetings', { title, transcript });
      setSummary(response.data.meeting.summary);
      setKeywords(response.data.keywords || []);
      setShowResult(true);
      fetchMeetings();
      setTitle('');
      setTranscript('');
      setToast({ type: 'success', message: 'Meeting uploaded and summarized!' });
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to upload meeting' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page-layout">
      <Sidebar />

      <main className="main-content">
        {/* Toast */}
        {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

        {/* Page Header */}
        <div className="page-header">
          <h1>Upload Meeting</h1>
          <p>Upload meeting transcripts to generate intelligent summaries.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
          {/* Upload Form */}
          <div>
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 24 }}>
                New Meeting Transcript
              </h3>

              <form onSubmit={handleSubmit}>
                {/* Meeting Title */}
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Meeting Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly Sprint Planning" className="input-field" id="meeting-title" />
                </div>

                {/* Transcript Textarea */}
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">Meeting Transcript</label>
                  <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your meeting notes here..." className="input-field"
                    rows={10} style={{ resize: 'vertical' }} id="meeting-transcript" />
                </div>

                {/* File Upload */}
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label">Or Upload a .txt File</label>
                  <div style={{
                    border: '2px dashed var(--border-color)', borderRadius: 10,
                    padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}>
                    <input type="file" accept=".txt" onChange={handleFileUpload}
                      style={{ display: 'none' }} id="file-upload-input" />
                    <label htmlFor="file-upload-input" style={{ cursor: 'pointer' }}>
                      <HiOutlineCloudUpload size={32} style={{ color: 'var(--text-light)', margin: '0 auto 10px' }} />
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                        Click to upload or drag a .txt file
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
                        Only .txt files are supported
                      </p>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="btn btn-primary"
                  style={{ width: '100%', padding: '13px 0', fontSize: 15, opacity: loading ? 0.7 : 1 }}
                  id="upload-submit">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                      Generating Summary...
                    </span>
                  ) : (
                    <><HiOutlineSparkles size={18} /> Upload & Generate Summary</>
                  )}
                </button>
              </form>
            </div>

            {/* Generated Summary Result */}
            {showResult && (
              <div className="card fade-in" style={{ marginTop: 24, borderLeft: '4px solid var(--success-green)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HiOutlineSparkles size={18} style={{ color: 'var(--success-green)' }} />
                  Generated Summary
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{summary}</p>

                {keywords.length > 0 && (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-gray)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Key Topics
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {keywords.map((kw, idx) => (
                        <span key={idx} style={{
                          padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          background: '#EFF6FF', color: '#2563EB',
                        }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Past Meetings List */}
          <div>
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 20 }}>
                Past Meetings
              </h3>

              {loadingMeetings ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <div className="spinner"></div>
                </div>
              ) : meetings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
                  {meetings.map((meeting) => (
                    <div key={meeting.id} style={{
                      padding: 14, borderRadius: 10, border: '1px solid var(--border-light)',
                      transition: 'box-shadow 0.2s ease',
                    }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <HiOutlineDocumentText size={18} style={{ color: 'var(--primary-blue)', marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {meeting.title}
                          </h4>
                          <p style={{ fontSize: 12, color: 'var(--text-gray)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {meeting.summary || 'No summary available'}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <HiOutlineDocumentText size={40} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                  <h3>No meetings yet</h3>
                  <p>Upload your first meeting to see it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadPage;
