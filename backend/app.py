from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

DATABASE = 'tasks.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with tasks table"""
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status INTEGER DEFAULT 0,
            priority TEXT NOT NULL,
            created_date TEXT NOT NULL,
            due_date TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/', methods=['GET'])
def home():
    """Root endpoint - API information"""
    return jsonify({
        'message': 'Magenta Insights Task Manager API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/tasks': 'Get all tasks',
            'GET /api/tasks/<id>': 'Get a specific task',
            'POST /api/tasks': 'Create a new task',
            'PUT /api/tasks/<id>': 'Update a task',
            'DELETE /api/tasks/<id>': 'Delete a task'
        }
    }), 200

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    try:
        conn = get_db()
        cursor = conn.execute('SELECT * FROM tasks ORDER BY created_date DESC')
        tasks = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Convert status to boolean
        for task in tasks:
            task['status'] = bool(task['status'])
        
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a single task by ID"""
    try:
        conn = get_db()
        cursor = conn.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        conn.close()
        
        if task is None:
            return jsonify({'error': 'Task not found'}), 404
        
        task_dict = dict(task)
        task_dict['status'] = bool(task_dict['status'])
        
        return jsonify(task_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    try:
        data = request.get_json()
        
        # Validation
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'title' not in data or not data['title'].strip():
            return jsonify({'error': 'Title is required'}), 400
        
        if 'priority' not in data or data['priority'] not in ['Low', 'Medium', 'High']:
            return jsonify({'error': 'Valid priority is required (Low, Medium, High)'}), 400
        
        # Set defaults
        title = data['title'].strip()
        description = data.get('description', '').strip()
        priority = data['priority']
        created_date = datetime.now().strftime('%Y-%m-%d')
        due_date = data.get('due_date', '')
        status = 0  # Default: incomplete
        
        # Insert into database
        conn = get_db()
        cursor = conn.execute(
            '''INSERT INTO tasks (title, description, status, priority, created_date, due_date)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (title, description, status, priority, created_date, due_date)
        )
        conn.commit()
        task_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'id': task_id,
            'title': title,
            'description': description,
            'status': False,
            'priority': priority,
            'created_date': created_date,
            'due_date': due_date
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        conn = get_db()
        cursor = conn.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        
        if task is None:
            conn.close()
            return jsonify({'error': 'Task not found'}), 404
        
        # Get current values
        task_dict = dict(task)
        
        # Update fields if provided
        title = data.get('title', task_dict['title']).strip()
        description = data.get('description', task_dict['description'])
        priority = data.get('priority', task_dict['priority'])
        due_date = data.get('due_date', task_dict['due_date'])
        
        # Handle status update
        if 'status' in data:
            status = 1 if data['status'] else 0
        else:
            status = task_dict['status']
        
        # Validation
        if not title:
            conn.close()
            return jsonify({'error': 'Title cannot be empty'}), 400
        
        if priority not in ['Low', 'Medium', 'High']:
            conn.close()
            return jsonify({'error': 'Valid priority is required (Low, Medium, High)'}), 400
        
        # Update database
        conn.execute(
            '''UPDATE tasks 
               SET title = ?, description = ?, status = ?, priority = ?, due_date = ?
               WHERE id = ?''',
            (title, description, status, priority, due_date, task_id)
        )
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': task_id,
            'title': title,
            'description': description,
            'status': bool(status),
            'priority': priority,
            'created_date': task_dict['created_date'],
            'due_date': due_date
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        conn = get_db()
        cursor = conn.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        
        if task is None:
            conn.close()
            return jsonify({'error': 'Task not found'}), 404
        
        conn.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)