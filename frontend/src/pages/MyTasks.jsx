import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Link } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { FiPlus, FiFilter, FiCalendar, FiUser, FiFlag } from 'react-icons/fi'

function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, todo, in-progress, completed

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const endpoint = filter === 'all' ? '/tasks/my-tasks' : `/tasks/my-tasks?status=${filter}`
      const response = await axiosInstance.get(endpoint)
      setTasks(response.data.data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'todo': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Tasks</h1>
            <p className="text-gray-600">Manage and track your tasks</p>
          </div>
          <Link
            to="/tasks/create"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <FiPlus className="text-xl" />
            <span className="font-medium">New Task</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <FiFilter className="text-gray-400 text-xl flex-shrink-0" />
            {['all', 'todo', 'in-progress', 'completed'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  filter === filterOption
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">Create your first task to get started</p>
            <Link
              to="/tasks/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <FiPlus className="text-xl" />
              <span className="font-medium">Create Task</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Link
                key={task._id}
                to={`/tasks/${task._id}`}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Task Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
                    {task.title}
                  </h3>
                  <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {/* Task Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {task.description || 'No description'}
                </p>

                {/* Task Meta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCalendar className="text-indigo-500" />
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                  </div>
                  {task.assignedTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiUser className="text-pink-500" />
                      <span>Assigned to: {task.assignedTo.name}</span>
                    </div>
                  )}
                </div>

                {/* Task Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyTasks
