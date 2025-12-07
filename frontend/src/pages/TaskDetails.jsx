import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashboardLayout from '../components/layout/DashboardLayout'
import axiosInstance from '../utils/axiosInstance'
import toast from 'react-hot-toast'
import { FiCalendar, FiUser, FiFlag, FiEdit, FiTrash2, FiArrowLeft, FiClock } from 'react-icons/fi'

function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(`/tasks/${id}`)
      setTask(response.data.data.task)
    } catch (error) {
      console.error('Failed to fetch task:', error)
      toast.error('Failed to load task')
      navigate('/tasks/my-tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await axiosInstance.delete(`/tasks/${id}`)
      toast.success('Task deleted successfully')
      navigate('/tasks/my-tasks')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, { status: newStatus })
      setTask({ ...task, status: newStatus })
      toast.success('Status updated successfully')
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!task) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Task not found</h2>
          <Link to="/tasks/my-tasks" className="text-indigo-600 hover:underline">
            Return to My Tasks
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const canEdit = user?.role === 'admin' || task.createdBy?._id === user?._id

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/tasks/my-tasks"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-4 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Tasks</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{task.title}</h1>
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority} priority
                </span>
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-3">
                <Link
                  to={`/tasks/${id}/edit`}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <FiEdit />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FiCalendar className="text-indigo-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-semibold text-gray-800">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-pink-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Created By</p>
                <p className="text-sm font-semibold text-gray-800">
                  {task.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>

            {task.assignedTo && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FiUser className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {task.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiClock className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-semibold text-gray-800">
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status Update */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            {['todo', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={task.status === status}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-200 ${
                  task.status === status
                    ? 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:cursor-not-allowed`}
              >
                {status.replace('-', ' ').charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default TaskDetails
