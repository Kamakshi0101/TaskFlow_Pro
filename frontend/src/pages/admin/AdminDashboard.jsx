import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import KpiCard from '../../components/ui/KpiCard'
import CustomPieChart from '../../components/charts/CustomPieChart'
import CustomBarChart from '../../components/charts/CustomBarChart'
import CustomLineChart from '../../components/charts/CustomLineChart'
import ActivityItem from '../../components/ui/ActivityItem'
import UserTable from '../../components/ui/UserTable'
import axios from '../../utils/axiosInstance'
import { FiCheckCircle, FiClock, FiAlertCircle, FiUsers, FiActivity, FiTrendingUp } from 'react-icons/fi'
import { subDays, format } from 'date-fns'

function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalUsers: 0,
    activeUsersToday: 0
  })
  const [taskDistribution, setTaskDistribution] = useState([])
  const [priorityData, setPriorityData] = useState([])
  const [productivityData, setProductivityData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const [tasksRes, usersRes, analyticsRes] = await Promise.all([
        axios.get('/tasks'),
        axios.get('/auth/users'),
        axios.get('/analytics/dashboard').catch(() => ({ data: { data: {} } }))
      ])

      const tasks = tasksRes.data.data.tasks || []
      const users = usersRes.data.data.users || []
      const analytics = analyticsRes.data.data || {}

      // Calculate stats (count assignee-level completions)
      const totalAssignees = tasks.reduce((sum, t) => sum + (t.assignees?.length || 0), 0)
      const completedAssignees = tasks.reduce((sum, t) => {
        return sum + (t.assignees?.filter(a => a.status === 'completed').length || 0)
      }, 0)
      const pendingAssignees = tasks.reduce((sum, t) => {
        return sum + (t.assignees?.filter(a => a.status === 'pending').length || 0)
      }, 0)
      const overdue = tasks.filter(t => {
        if (!t.dueDate) return false
        const hasIncompleteAssignees = t.assignees?.some(a => a.status !== 'completed')
        return new Date(t.dueDate) < new Date() && hasIncompleteAssignees
      }).length

      setStats({
        totalTasks: totalAssignees,
        completedTasks: completedAssignees,
        pendingTasks: pendingAssignees,
        overdueTasks: overdue,
        totalUsers: users.length,
        activeUsersToday: users.filter(u => {
          if (!u.lastLogin) return false
          const lastLogin = new Date(u.lastLogin)
          const today = new Date()
          return lastLogin.toDateString() === today.toDateString()
        }).length
      })

      // Task Distribution (Pie Chart) - Count assignee statuses
      const inProgressAssignees = tasks.reduce((sum, t) => {
        return sum + (t.assignees?.filter(a => a.status === 'in-progress').length || 0)
      }, 0)
      const distribution = [
        { name: 'Pending', value: pendingAssignees },
        { name: 'In Progress', value: inProgressAssignees },
        { name: 'Completed', value: completedAssignees }
      ].filter(d => d.value > 0)
      setTaskDistribution(distribution)

      // Priority Distribution (Bar Chart)
      const priority = [
        { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
        { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
        { name: 'High', value: tasks.filter(t => t.priority === 'high').length }
      ]
      setPriorityData(priority)

      // Productivity Line Chart (Last 7 days) - Count assignee completions
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i)
        const completedOnDay = tasks.reduce((sum, task) => {
          const completions = task.assignees?.filter(assignee => {
            if (assignee.status !== 'completed' || !assignee.completedAt) return false
            return format(new Date(assignee.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          }).length || 0
          return sum + completions
        }, 0)
        return {
          name: format(date, 'EEE'),
          value: completedOnDay
        }
      })
      setProductivityData(last7Days)

      // Recent Activity
      const activities = tasks.slice(0, 10).map(task => ({
        type: task.status === 'completed' ? 'completed' : 'created',
        user: task.createdBy?.name || 'Unknown',
        action: task.status === 'completed' ? 'completed' : 'created',
        target: task.title,
        timestamp: task.updatedAt || task.createdAt,
        avatar: task.createdBy?.name?.charAt(0).toUpperCase()
      }))
      setRecentActivity(activities)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
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

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Complete overview of your workspace performance</p>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <KpiCard
            icon={FiCheckCircle}
            title="Total Tasks"
            value={stats.totalTasks}
            trend="up"
            trendValue="+12%"
            gradient="from-indigo-500 to-indigo-600"
          />
          <KpiCard
            icon={FiCheckCircle}
            title="Completed"
            value={stats.completedTasks}
            trend="up"
            trendValue="+8%"
            gradient="from-green-500 to-emerald-600"
          />
          <KpiCard
            icon={FiClock}
            title="Pending"
            value={stats.pendingTasks}
            trend="down"
            trendValue="-5%"
            gradient="from-yellow-500 to-orange-500"
          />
          <KpiCard
            icon={FiAlertCircle}
            title="Overdue"
            value={stats.overdueTasks}
            gradient="from-red-500 to-pink-600"
          />
          <KpiCard
            icon={FiUsers}
            title="Total Users"
            value={stats.totalUsers}
            trend="up"
            trendValue="+3"
            gradient="from-purple-500 to-pink-500"
          />
          <KpiCard
            icon={FiActivity}
            title="Active Today"
            value={stats.activeUsersToday}
            gradient="from-blue-500 to-cyan-500"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Task Distribution</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-indigo-600">{completionRate}% Complete</span>
              </div>
            </div>
            <div className="h-80">
              <CustomPieChart 
                data={taskDistribution} 
                centerLabel={{ value: stats.totalTasks, label: 'Total Tasks' }}
              />
            </div>
          </motion.div>

          {/* Priority Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">Task Priority</h3>
            <div className="h-80">
              <CustomBarChart data={priorityData} showGradient={false} />
            </div>
          </motion.div>
        </div>

        {/* Productivity Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Team Productivity</h3>
              <p className="text-sm text-gray-600">Tasks completed over the last 7 days</p>
            </div>
            <FiTrendingUp className="text-3xl text-green-500" />
          </div>
          <div className="h-80">
            <CustomLineChart data={productivityData} color="#6366F1" />
          </div>
        </motion.div>

        {/* Recent Activity & Team Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-lg shadow-indigo-100 border border-indigo-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <ActivityItem key={idx} {...activity} />
              ))}
            </div>
          </motion.div>

          {/* Quick Stats Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            {/* Completion Rate Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Overall Completion Rate</h3>
                <div className="text-6xl font-bold mb-2">{completionRate}%</div>
                <p className="text-white/80">of all tasks completed</p>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-indigo-100">
                <div className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600 mt-1">Team Members</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-green-100">
                <div className="text-3xl font-bold text-green-600">{stats.activeUsersToday}</div>
                <div className="text-sm text-gray-600 mt-1">Active Today</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
