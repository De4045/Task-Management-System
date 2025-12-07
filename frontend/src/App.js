import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('All');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        due_date: ''
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            if (!response.ok) throw new Error('Failed to fetch tasks');
            const data = await response.json();
            setTasks(data);
            setIsLoading(false);
        } catch (err) {
            setError('Unable to load tasks. Make sure the backend is running.');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }

        try {
            const url = editingTask
                ? `${API_URL}/tasks/${editingTask.id}`
                : `${API_URL}/tasks`;

            const method = editingTask ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Operation failed');
            }

            setSuccess(editingTask ? 'Task updated successfully' : 'Task created successfully');
            fetchTasks();
            resetForm();
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setSuccess('Task deleted successfully');
            fetchTasks();
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const toggleComplete = async (task) => {
        try {
            const response = await fetch(`${API_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: !task.status })
            });

            if (!response.ok) throw new Error('Failed to update task');

            fetchTasks();
        } catch (err) {
            setError('Failed to update task status');
        }
    };

    const startEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            due_date: task.due_date || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            priority: 'Medium',
            due_date: ''
        });
        setEditingTask(null);
        setShowForm(false);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Calculate statistics
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status).length,
        pending: tasks.filter(t => !t.status).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status).length / tasks.length) * 100) : 0
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === 'All') return true;
        if (filter === 'Active') return !task.status;
        if (filter === 'Completed') return task.status;
        if (filter === 'Low' || filter === 'Medium' || filter === 'High') {
            return task.priority === filter;
        }
        return true;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                        >
                            <Plus size={20} />
                            New Task
                        </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-blue-600 text-sm font-medium">Total Tasks</div>
                            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-green-600 text-sm font-medium">Completed</div>
                            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="text-orange-600 text-sm font-medium">Pending</div>
                            <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="text-purple-600 text-sm font-medium">Completion Rate</div>
                            <div className="text-2xl font-bold text-purple-700">{stats.completionRate}%</div>
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <Filter size={18} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        {['All', 'Active', 'Completed', 'High', 'Medium', 'Low'].map(filterOption => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === filterOption
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filterOption}
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    {showForm && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <h2 className="text-xl font-semibold mb-4">
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </h2>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    {editingTask ? 'Update Task' : 'Create Task'}
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {filteredTasks.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {filter === 'All' ? 'No tasks yet. Create your first task!' : `No ${filter.toLowerCase()} tasks found.`}
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`border rounded-lg p-4 ${task.status ? 'bg-gray-50 opacity-75' : 'bg-white'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                            <button
                                                onClick={() => toggleComplete(task)}
                                                className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center ${task.status
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 hover:border-green-500'
                                                    }`}
                                            >
                                                {task.status && <Check size={16} className="text-white" />}
                                            </button>

                                            <div className="flex-1">
                                                <h3
                                                    className={`text-lg font-semibold ${task.status ? 'line-through text-gray-500' : 'text-gray-800'
                                                        }`}
                                                >
                                                    {task.title}
                                                </h3>
                                                {task.description && (
                                                    <p className="text-gray-600 mt-1">{task.description}</p>
                                                )}
                                                <div className="flex gap-2 mt-2 flex-wrap">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            Due: {task.due_date}
                                                        </span>
                                                    )}
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                        Created: {task.created_date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 ml-2">
                                            <button
                                                onClick={() => startEdit(task)}
                                                className="text-blue-500 hover:text-blue-700 p-2"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}