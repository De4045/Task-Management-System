# Task-Management-System
A full-stack task management application built with Flask (Python) backend and React (JavaScript) frontend.

## Features

### Core Features 
- Create, read, update, and delete tasks
- Mark tasks as complete/incomplete
- Set task priority (Low, Medium, High)
- Add due dates to tasks
- Persistent SQLite database storage
- RESTful API architecture
- Modern, responsive UI with Tailwind CSS
- Real-time feedback for all operations

### Additional Features 
- Task Statistics Dashboard - View total, completed, pending tasks and completion rate
-Smart Filtering - Filter tasks by status (All/Active/Completed) or priority (High/Medium/Low)
- Color-Coded Priority System- Visual distinction for task priorities
-Fully Responsive Design - Works seamlessly on desktop, tablet, and mobile

# Tech Stack

**Backend:**
- Python 3.8+
- Flask 3.0.0
- Flask-CORS 4.0.0
- SQLite3

**Frontend:**
- React 18.3.1
- Tailwind CSS 3.4.18
- Lucide React (icons)
- Fetch API for HTTP requests

## Project Structure

```
c1/
├── backend/
│   ├── app.py              # Flask application with API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── tasks.db           # SQLite database (auto-created)
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   ├── index.css      # Tailwind CSS directives
│   │   └── output.css     # Compiled Tailwind CSS
│   ├── package.json       # Node dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   ├── craco.config.js    # Create React App configuration
│   └── jsconfig.json      # JavaScript configuration
└── README.md              # This file
```
