"""
database.py - Database Setup and Helper Functions
==================================================
This file handles all database operations for the application.
We use SQLite which stores data in a simple file (meetings.db).
"""

import sqlite3
import os

# Path to the database file (same folder as this script)
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'meetings.db')


def get_db():
    """
    Create and return a database connection.
    Each request gets its own connection.
    """
    conn = sqlite3.connect(DATABASE_PATH)
    # This lets us access columns by name (like a dictionary)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Initialize the database by creating all required tables.
    This runs when the Flask app starts up.
    'IF NOT EXISTS' ensures we don't get errors if tables already exist.
    """
    conn = get_db()
    cursor = conn.cursor()

    # ---- Users Table ----
    # Stores user accounts for login/signup
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')

    # ---- Meetings Table ----
    # Stores uploaded meeting notes and their summaries
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meetings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            transcript TEXT NOT NULL,
            summary TEXT,
            created_by INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')

    # ---- Tasks Table ----
    # Stores tasks assigned from meetings
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            assigned_to TEXT NOT NULL,
            due_date TEXT,
            status TEXT DEFAULT 'Pending',
            meeting_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (meeting_id) REFERENCES meetings (id)
        )
    ''')

    # Save changes and close connection
    conn.commit()
    conn.close()
    print("[OK] Database initialized successfully!")


def dict_from_row(row):
    """
    Convert a SQLite Row object to a regular Python dictionary.
    This makes it easy to return data as JSON in our API.
    """
    if row is None:
        return None
    return dict(row)
