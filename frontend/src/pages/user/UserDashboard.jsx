import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import ProgressRing from '../../components/ui/ProgressRing'
import GradientCard from '../../components/ui/GradientCard'
import HeatmapChart from '../../components/charts/HeatmapChart'
import axios from '../../utils/axiosInstance'
import { FiCheckCircle, FiClock, FiAlertCircle, FiAward, FiPlus, FiList, FiCalendar, FiBarChart2, FiChevronRight } from 'react-icons/fi'
import { subDays, format } from 'date-fns'

function UserDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    assigned: 0,
    dueToday: 0,
    overdue: 0,
    completedThisWeek: 0
  })
  const [todayProgress, setTodayProgress] = useState(0)
  const [tasks, setTasks] = useState({
    pending: [],
    inProgress: [],
    completed: []
  })
  const [heatmapData, setHeatmapData] = useState([])
  const [motivationalText, setMotivationalText] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const tasksRes = await axios.get('/tasks/my-tasks')
      const allTasks = tasksRes.data.data.tasks || []

      // Calculate stats
      const today = new Date()
      const dueToday = allTasks.filter(t => {
        if (!t.dueDate) return false
        return format(new Date(t.dueDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      }).length

      const overdue = allTasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false
        return new Date(t.dueDate) < today
      }).length

      const weekStart = subDays(today, 7)
      const completedThisWeek = allTasks.filter(t => {
        if (t.status !== 'completed' || !t.updatedAt) return false
        return new Date(t.updatedAt) >= weekStart
      }).length

      setStats({
        assigned: allTasks.length,
        dueToday,
        overdue,
        completedThisWeek
      })

      // Today's Progress
      const completedToday = allTasks.filter(t => {
        if (t.status !== 'completed' || !t.updatedAt) return false
        return format(new Date(t.updatedAt), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      }).length
      const totalToday = dueToday + completedToday
      const progress = totalToday > 0 ? (completedToday / totalToday) * 100 : 0
      setTodayProgress(progress)

      // Motivational Text
      if (progress >= 80) {
        setMotivationalText("🎉 Outstanding! You're crushing your goals!")
      } else if (progress >= 50) {
        setMotivationalText("💪 Great job! You're ahead of your goal.")
      } else if (progress > 0) {
        setMotivationalText("🚀 Keep going! You're making progress.")
      } else {
        setMotivationalText("☕ Time to get started on today's tasks!")
      }

      // Group tasks by status
      setTasks({
        pending: allTasks.filter(t => t.status === 'todo'),
        inProgress: allTasks.filter(t => t.status === 'in-progress'),
        completed: allTasks.filter(t => t.status === 'completed')
      })

      // Heatmap Data (Last 84 days)
      const last84Days = Array.from({ length: 84 }, (_, i) => {
        const date = subDays(today, 83 - i)
        const completedOnDay = allTasks.filter(t => {
          if (!t.updatedAt || t.status !== 'completed') return false
          return format(new Date(t.updatedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        }).length
        return {
          date: date.toISOString(),
          count: completedOnDay
        }
      })
      setHeatmapData(last84Days)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
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

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Personal Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {getGreeting()}, {user?.name} 👋
            </h1>
            <p className="text-gray-600">Here's your progress for today</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </motion.div>

        {/* Today's Progress + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Progress Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-lg shadow-indigo-100 border border-indigo-50 flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">Today's Progress</h3>
            <ProgressRing percentage={todayProgress} />
            <p className="text-sm text-gray-600 mt-6 text-center font-medium">{motivationalText}</p>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-20">
                <FiCheckCircle className="text-8xl" />
              </div>
              <div className="relative z-10">
                <FiCheckCircle className="text-3xl mb-3" />
                <div className="text-4xl font-bold mb-2">{stats.assigned}</div>
                <div className="text-indigo-100">Tasks Assigned</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-20">
                <FiClock className="text-8xl" />
              </div>
              <div className="relative z-10">
                <FiClock className="text-3xl mb-3" />
                <div className="text-4xl font-bold mb-2">{stats.dueToday}</div>
                <div className="text-purple-100">Due Today</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-20">
                <FiAlertCircle className="text-8xl" />
              </div>
              <div className="relative z-10">
                <FiAlertCircle className="text-3xl mb-3" />
                <div className="text-4xl font-bold mb-2">{stats.overdue}</div>
                <div className="text-red-100">Overdue Tasks</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 opacity-20">
                <FiAward className="text-8xl" />
              </div>
              <div className="relative z-10">
                <FiAward className="text-3xl mb-3" />
                <div className="text-4xl font-bold mb-2">{stats.completedThisWeek}</div>
                <div className="text-green-100">Completed This Week</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* My Tasks Overview Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Pending</h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {tasks.pending.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tasks.pending.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="block p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="font-semibold text-gray-800 mb-2">{task.title}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-gray-500">{format(new Date(task.dueDate), 'MMM d')}</span>
                    )}
                  </div>
                </Link>
              ))}
              {tasks.pending.length === 0 && (
                <p className="text-gray-500 text-center py-8">No pending tasks</p>
              )}
            </div>
          </motion.div>

          {/* In Progress Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">In Progress</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {tasks.inProgress.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tasks.inProgress.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="block p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="font-semibold text-gray-800 mb-2">{task.title}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-gray-500">{format(new Date(task.dueDate), 'MMM d')}</span>
                    )}
                  </div>
                </Link>
              ))}
              {tasks.inProgress.length === 0 && (
                <p className="text-gray-500 text-center py-8">No tasks in progress</p>
              )}
            </div>
          </motion.div>

          {/* Completed Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Completed</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {tasks.completed.length}
              </span>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {tasks.completed.slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="block p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all duration-200 hover:shadow-md opacity-75"
                >
                  <div className="font-semibold text-gray-800 mb-2 line-through">{task.title}</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <FiCheckCircle className="text-green-500" />
                  </div>
                </Link>
              ))}
              {tasks.completed.length === 0 && (
                <p className="text-gray-500 text-center py-8">No completed tasks</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Personal Heatmap */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">Your Contribution Heatmap</h3>
          <HeatmapChart data={heatmapData} weeks={12} />
        </motion.div>

        {/* Quick Actions Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link
            to="/tasks/create"
            className="group bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white"
          >
            <FiPlus className="text-3xl mb-3" />
            <div className="font-semibold">Create Task</div>
            <FiChevronRight className="text-xl mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/tasks/my-tasks"
            className="group bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white"
          >
            <FiList className="text-3xl mb-3" />
            <div className="font-semibold">View All Tasks</div>
            <FiChevronRight className="text-xl mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/calendar"
            className="group bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white"
          >
            <FiCalendar className="text-3xl mb-3" />
            <div className="font-semibold">Open Calendar</div>
            <FiChevronRight className="text-xl mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/analytics"
            className="group bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-white"
          >
            <FiBarChart2 className="text-3xl mb-3" />
            <div className="font-semibold">My Analytics</div>
            <FiChevronRight className="text-xl mt-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

export default UserDashboard
