import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FiCheckCircle, FiClock, FiTrendingUp, FiActivity } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axios from "../../utils/axiosInstance";
import { format, parseISO } from "date-fns";

const UserAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [progress30Days, setProgress30Days] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    // Refetch when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAnalytics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, progressRes, summaryRes] = await Promise.all([
        axios.get("/analytics/user/overview"),
        axios.get("/analytics/user/progress-30"),
        axios.get("/analytics/user/summary"),
      ]);

      setOverview(overviewRes.data.data);
      setProgress30Days(progressRes.data.data);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
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

  const chartData = progress30Days.map((item) => ({
    date: format(parseISO(item.date), "MMM dd"),
    completed: item.count,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Analytics</h1>
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
                <FiActivity className="text-indigo-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-gray-900">{overview.total}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completed</span>
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-green-600">{overview.completed}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">In Progress</span>
                <FiClock className="text-yellow-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-yellow-600">{overview.inProgress}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">Completion Rate</span>
                <FiTrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {overview.completionRate}%
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Productivity Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            30-Day Productivity Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Summary */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Day</span>
                  <span className="font-semibold text-green-600">{summary.bestDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Worst Day</span>
                  <span className="font-semibold text-red-600">{summary.worstDay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-semibold text-indigo-600">
                    {summary.currentStreak} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Tasks/Week</span>
                  <span className="font-semibold text-purple-600">
                    {summary.avgTasksPerWeek.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h3>
              <div className="space-y-3">
                {summary.insights && summary.insights.length > 0 ? (
                  summary.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg"
                    >
                      <FiTrendingUp className="text-indigo-600 shrink-0 mt-1" size={18} />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    Complete more tasks to get personalized insights!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserAnalytics;
