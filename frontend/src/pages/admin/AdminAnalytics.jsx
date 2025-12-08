import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axios from "../../utils/axiosInstance";
import { format, parseISO } from "date-fns";

const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [teamProgress, setTeamProgress] = useState([]);
  const [priorityDistribution, setPriorityDistribution] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBottleneckTab, setActiveBottleneckTab] = useState("overdue");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, progressRes, priorityRes, leaderboardRes, bottleneckRes] =
        await Promise.all([
          axios.get("/analytics/admin/overview"),
          axios.get("/analytics/admin/team-progress"),
          axios.get("/analytics/admin/priority-distribution"),
          axios.get("/analytics/admin/leaderboard"),
          axios.get("/analytics/admin/bottlenecks"),
        ]);

      setOverview(overviewRes.data.data);
      setTeamProgress(progressRes.data.data);
      setPriorityDistribution(priorityRes.data.data);
      console.log("Leaderboard response:", leaderboardRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
      setBottlenecks(bottleneckRes.data.data);
    } catch (error) {
      console.error("Failed to fetch admin analytics:", error);
      alert("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const teamChartData = teamProgress.map((item) => ({
    date: format(parseISO(item.date), "MMM dd"),
    completed: item.count,
  }));

  const priorityChartData = priorityDistribution.map((item) => ({
    priority: item._id,
    count: item.count,
  }));

  const renderBottleneckContent = () => {
    if (!bottlenecks) return null;

    const data =
      activeBottleneckTab === "overdue"
        ? bottlenecks.overdue
        : activeBottleneckTab === "longRunning"
        ? bottlenecks.longRunning
        : bottlenecks.mostReassigned;

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">No bottlenecks detected!</div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((task) => (
          <div
            key={task._id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-red-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                    Priority: {task.priority}
                  </span>
                  <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                    Assignees: {task.assignees?.length || 0}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded">
                      Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Tasks</span>
                <FiClock className="text-indigo-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{overview.totalTasks}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Total Users</span>
                <FiUsers className="text-blue-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-blue-600">{overview.totalUsers}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed</span>
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {overview.completedTasks}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Avg Completion Time</span>
                <FiTrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {overview.avgCompletionTime.toFixed(1)} days
              </div>
            </div>
          </div>
        )}

        {/* Team Progress Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Team Productivity (Last 30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={teamChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="priority" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Leaderboard</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Rank</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Completed</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                    Avg Completion Time
                  </th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                    Productivity Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => (
                  <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          idx === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : idx === 1
                            ? "bg-gray-100 text-gray-700"
                            : idx === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-indigo-50 text-indigo-700"
                        } font-bold`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{user.userName}</td>
                    <td className="py-3 px-4 text-gray-700">{user.tasksCompleted}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {user.avgCompletionTime.toFixed(1)} days
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-linear-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${user.productivityScore}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-indigo-600">
                          {user.productivityScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottlenecks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <FiAlertTriangle className="text-red-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">Bottleneck Analysis</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveBottleneckTab("overdue")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeBottleneckTab === "overdue"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overdue Tasks
              {bottlenecks?.overdue && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  {bottlenecks.overdue.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveBottleneckTab("longRunning")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeBottleneckTab === "longRunning"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Long-Running
              {bottlenecks?.longRunning && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                  {bottlenecks.longRunning.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveBottleneckTab("mostReassigned")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeBottleneckTab === "mostReassigned"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Most Reassigned
              {bottlenecks?.mostReassigned && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  {bottlenecks.mostReassigned.length}
                </span>
              )}
            </button>
          </div>

          {renderBottleneckContent()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
