# MeetIntel — Enterprise Meeting Intelligence & Workflow Automation Platform

A beginner-friendly full-stack meeting management platform for task tracking, meeting summarization, and workflow organization.

## 🚀 Features

- **User Authentication** — Signup & Login with JWT tokens
- **Dashboard** — Overview of meetings, tasks, and productivity metrics
- **Meeting Upload** — Paste or upload (.txt) meeting transcripts
- **Auto Summarization** — Simple keyword-based text summarization (no AI/ML)
- **Task Management** — Create, assign, and track tasks with status updates
- **Analytics Dashboard** — Bar, Doughnut, and Line charts with Chart.js

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS v4, Chart.js |
| Backend | Flask, Flask-CORS, Flask-JWT-Extended |
| Database | SQLite |
| Auth | JWT (JSON Web Tokens) |
| HTTP Client | Axios |

## 📁 Folder Structure

```
PROJECT1/
├── backend/
│   ├── app.py              # Main Flask app with all API routes
│   ├── database.py          # Database setup & helpers
│   ├── summarizer.py        # Simple text summarization
│   ├── requirements.txt     # Python dependencies
│   └── meetings.db          # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Axios instance with JWT
│   │   ├── context/AuthContext.jsx  # Auth state management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── StatCard.jsx      # Dashboard stat card
│   │   │   └── ProtectedRoute.jsx # Auth guard
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Login & Signup
│   │   │   ├── DashboardPage.jsx # Main dashboard
│   │   │   ├── UploadPage.jsx    # Upload meetings
│   │   │   ├── TaskPage.jsx      # Task management
│   │   │   └── AnalyticsPage.jsx # Charts & analytics
│   │   ├── App.jsx               # Router setup
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── INTERVIEW_GUIDE.md
```

## 📦 Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary Key, Auto-increment |
| name | TEXT | User's full name |
| email | TEXT | Unique email address |
| password | TEXT | Hashed with Werkzeug |

### meetings
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary Key |
| title | TEXT | Meeting title |
| transcript | TEXT | Full meeting notes |
| summary | TEXT | Auto-generated summary |
| created_by | INTEGER | FK → users.id |
| created_at | TIMESTAMP | Auto-set |

### tasks
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary Key |
| task_name | TEXT | Task description |
| assigned_to | TEXT | Team member name |
| due_date | TEXT | Due date string |
| status | TEXT | Pending / In Progress / Completed |
| meeting_id | INTEGER | FK → meetings.id |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/signup | Register a new user |
| POST | /api/login | Login & get JWT token |
| GET | /api/meetings | Get all user meetings |
| POST | /api/meetings | Upload new meeting |
| GET | /api/meetings/:id | Get a specific meeting |
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/:id | Update task status |
| GET | /api/analytics | Get dashboard analytics |

## 🏗️ Setup Guide

### Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- npm or yarn

### Step 1: Clone or Download
```bash
cd PROJECT1
```

### Step 2: Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs at: `http://localhost:5000`

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

### Step 4: Use the App
1. Open `http://localhost:3000` in your browser
2. Create an account (Sign Up)
3. Log in with your credentials
4. Upload meeting notes, create tasks, view analytics!

## 📝 How the Summarizer Works

The summarizer uses **simple word frequency analysis** (no ML/AI):

1. Splits text into sentences
2. Counts word frequencies (ignoring common words like "the", "is", etc.)
3. Scores each sentence based on the important words it contains
4. Picks the top 3 highest-scoring sentences as the summary

## 📄 License

This project is for educational purposes. Free to use and modify.
