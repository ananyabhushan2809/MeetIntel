"""
app.py - Main Flask Application
================================
This is the main backend file that handles all API routes.
It connects to the SQLite database, handles user authentication,
and provides endpoints for meetings, tasks, and analytics.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
from database import get_db, init_db, dict_from_row
from summarizer import generate_summary, extract_keywords

# ============================================================
# APP SETUP
# ============================================================

# Create the Flask app
app = Flask(__name__)

# Allow frontend (React) to make requests to this backend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Secret key for JWT tokens (in production, use a proper secret!)
app.config['JWT_SECRET_KEY'] = 'meeting-platform-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

# Initialize JWT
jwt = JWTManager(app)

# Initialize the database when the app starts
init_db()


# ============================================================
# HEALTH CHECK ROUTE - Root URL
# ============================================================

@app.route('/', methods=['GET'])
def home():
    """
    Health check endpoint for the root URL.
    Confirms that the backend API is online.
    """
    return jsonify({
        "status": "online",
        "service": "MeetIntel API Backend",
        "message": "Backend server is running successfully!",
        "version": "1.0.0"
    }), 200


# ============================================================
# AUTH ROUTES - Signup and Login
# ============================================================

@app.route('/api/signup', methods=['POST'])
def signup():
    """
    Register a new user.
    Expects JSON: { name, email, password }
    Returns: success message or error
    """
    data = request.get_json()

    # Get user details from the request
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validate inputs
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Check if email already exists
    db = get_db()
    existing_user = db.execute(
        'SELECT id FROM users WHERE email = ?', (email,)
    ).fetchone()

    if existing_user:
        db.close()
        return jsonify({'error': 'Email already registered'}), 409

    # Hash the password for security
    hashed_password = generate_password_hash(password)

    # Insert new user into database
    db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        (name, email, hashed_password)
    )
    db.commit()
    db.close()

    return jsonify({'message': 'Account created successfully!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    """
    Log in an existing user.
    Expects JSON: { email, password }
    Returns: JWT token and user info
    """
    data = request.get_json()

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    # Validate inputs
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Find the user in the database
    db = get_db()
    user = db.execute(
        'SELECT * FROM users WHERE email = ?', (email,)
    ).fetchone()
    db.close()

    # Check if user exists and password matches
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid email or password'}), 401

    # Create a JWT token for the user
    token = create_access_token(identity=str(user['id']))

    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }
    }), 200


# ============================================================
# MEETING ROUTES - Upload and View Meetings
# ============================================================

@app.route('/api/meetings', methods=['GET'])
@jwt_required()
def get_meetings():
    """
    Get all meetings for the logged-in user.
    Returns: List of meetings with summaries
    """
    user_id = get_jwt_identity()

    db = get_db()
    meetings = db.execute(
        'SELECT * FROM meetings WHERE created_by = ? ORDER BY created_at DESC',
        (user_id,)
    ).fetchall()
    db.close()

    # Convert each row to a dictionary
    meetings_list = [dict_from_row(m) for m in meetings]

    return jsonify({'meetings': meetings_list}), 200


@app.route('/api/meetings', methods=['POST'])
@jwt_required()
def create_meeting():
    """
    Upload a new meeting transcript and generate a summary.
    Expects JSON: { title, transcript }
    Returns: The created meeting with its summary
    """
    user_id = get_jwt_identity()
    data = request.get_json()

    title = data.get('title', '').strip()
    transcript = data.get('transcript', '').strip()

    # Validate inputs
    if not title or not transcript:
        return jsonify({'error': 'Title and transcript are required'}), 400

    # Generate summary using our simple summarizer
    summary = generate_summary(transcript)
    keywords = extract_keywords(transcript)

    # Save to database
    db = get_db()
    cursor = db.execute(
        'INSERT INTO meetings (title, transcript, summary, created_by) VALUES (?, ?, ?, ?)',
        (title, transcript, summary, user_id)
    )
    meeting_id = cursor.lastrowid
    db.commit()

    # Fetch the created meeting
    meeting = db.execute(
        'SELECT * FROM meetings WHERE id = ?', (meeting_id,)
    ).fetchone()
    db.close()

    return jsonify({
        'message': 'Meeting uploaded successfully!',
        'meeting': dict_from_row(meeting),
        'keywords': keywords
    }), 201


@app.route('/api/meetings/<int:meeting_id>', methods=['GET'])
@jwt_required()
def get_meeting(meeting_id):
    """
    Get a specific meeting by its ID.
    Returns: Meeting details with summary
    """
    user_id = get_jwt_identity()

    db = get_db()
    meeting = db.execute(
        'SELECT * FROM meetings WHERE id = ? AND created_by = ?',
        (meeting_id, user_id)
    ).fetchone()
    db.close()

    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404

    return jsonify({'meeting': dict_from_row(meeting)}), 200


# ============================================================
# TASK ROUTES - Create and Manage Tasks
# ============================================================

@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """
    Get all tasks.
    Optional query param: ?status=Pending (filter by status)
    Returns: List of tasks
    """
    status_filter = request.args.get('status')

    db = get_db()
    if status_filter:
        tasks = db.execute(
            'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC',
            (status_filter,)
        ).fetchall()
    else:
        tasks = db.execute(
            'SELECT * FROM tasks ORDER BY created_at DESC'
        ).fetchall()
    db.close()

    tasks_list = [dict_from_row(t) for t in tasks]

    return jsonify({'tasks': tasks_list}), 200


@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """
    Create a new task.
    Expects JSON: { task_name, assigned_to, due_date, meeting_id (optional) }
    Returns: The created task
    """
    data = request.get_json()

    task_name = data.get('task_name', '').strip()
    assigned_to = data.get('assigned_to', '').strip()
    due_date = data.get('due_date', '')
    meeting_id = data.get('meeting_id')

    # Validate inputs
    if not task_name or not assigned_to:
        return jsonify({'error': 'Task name and assignee are required'}), 400

    # Save to database
    db = get_db()
    cursor = db.execute(
        'INSERT INTO tasks (task_name, assigned_to, due_date, status, meeting_id) VALUES (?, ?, ?, ?, ?)',
        (task_name, assigned_to, due_date, 'Pending', meeting_id)
    )
    task_id = cursor.lastrowid
    db.commit()

    # Fetch the created task
    task = db.execute(
        'SELECT * FROM tasks WHERE id = ?', (task_id,)
    ).fetchone()
    db.close()

    return jsonify({
        'message': 'Task created successfully!',
        'task': dict_from_row(task)
    }), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """
    Update a task's status.
    Expects JSON: { status } (Pending, In Progress, or Completed)
    Returns: The updated task
    """
    data = request.get_json()
    new_status = data.get('status', '').strip()

    # Validate status
    valid_statuses = ['Pending', 'In Progress', 'Completed']
    if new_status not in valid_statuses:
        return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 400

    # Update in database
    db = get_db()
    db.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        (new_status, task_id)
    )
    db.commit()

    # Fetch the updated task
    task = db.execute(
        'SELECT * FROM tasks WHERE id = ?', (task_id,)
    ).fetchone()
    db.close()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    return jsonify({
        'message': 'Task updated successfully!',
        'task': dict_from_row(task)
    }), 200


# ============================================================
# ANALYTICS ROUTE - Dashboard Statistics
# ============================================================

@app.route('/api/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    """
    Get analytics data for charts and dashboard.
    Returns: Counts and statistics for meetings and tasks
    """
    user_id = get_jwt_identity()

    db = get_db()

    # Count total meetings for this user
    total_meetings = db.execute(
        'SELECT COUNT(*) as count FROM meetings WHERE created_by = ?',
        (user_id,)
    ).fetchone()['count']

    # Count tasks by status
    pending_tasks = db.execute(
        "SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending'"
    ).fetchone()['count']

    in_progress_tasks = db.execute(
        "SELECT COUNT(*) as count FROM tasks WHERE status = 'In Progress'"
    ).fetchone()['count']

    completed_tasks = db.execute(
        "SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed'"
    ).fetchone()['count']

    total_tasks = pending_tasks + in_progress_tasks + completed_tasks

    # Calculate productivity percentage
    productivity = 0
    if total_tasks > 0:
        productivity = round((completed_tasks / total_tasks) * 100, 1)

    # Get recent meetings (last 5)
    recent_meetings = db.execute(
        'SELECT id, title, created_at FROM meetings WHERE created_by = ? ORDER BY created_at DESC LIMIT 5',
        (user_id,)
    ).fetchall()

    # Get recent tasks (last 5)
    recent_tasks = db.execute(
        'SELECT id, task_name, assigned_to, status, due_date FROM tasks ORDER BY created_at DESC LIMIT 5'
    ).fetchall()

    # Get meetings per day (for line chart) - last 7 entries
    meetings_by_date = db.execute(
        '''SELECT DATE(created_at) as date, COUNT(*) as count 
           FROM meetings WHERE created_by = ? 
           GROUP BY DATE(created_at) 
           ORDER BY date DESC LIMIT 7''',
        (user_id,)
    ).fetchall()

    db.close()

    return jsonify({
        'total_meetings': total_meetings,
        'total_tasks': total_tasks,
        'pending_tasks': pending_tasks,
        'in_progress_tasks': in_progress_tasks,
        'completed_tasks': completed_tasks,
        'productivity': productivity,
        'recent_meetings': [dict_from_row(m) for m in recent_meetings],
        'recent_tasks': [dict_from_row(t) for t in recent_tasks],
        'meetings_by_date': [dict_from_row(m) for m in meetings_by_date]
    }), 200


# ============================================================
# RUN THE APP
# ============================================================

if __name__ == '__main__':
    # Run the Flask development server
    # debug=True auto-restarts when you change code
    print("Starting Meeting Intelligence Platform API...")
    print("Server running at: http://localhost:5000")
    app.run(debug=True, port=5000)
