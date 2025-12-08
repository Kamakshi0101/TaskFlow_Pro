import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiClock, FiTag, FiCheckCircle, FiCircle, FiPlayCircle, FiEye } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axios from "../../utils/axiosInstance";
import { format } from "date-fns";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/my-tasks");
      setTasks(response.data.data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/my-tasks/${taskId}/status`, { status: newStatus });
      fetchMyTasks();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-blue-600 bg-blue-50 border-blue-200",
      medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
      high: "text-orange-600 bg-orange-50 border-orange-200",
      urgent: "text-red-600 bg-red-50 border-red-200",
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="text-green-600" size={20} />;
      case "in-progress":
        return <FiPlayCircle className="text-indigo-600" size={20} />;
      default:
        return <FiCircle className="text-gray-400" size={20} />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your assigned tasks and workflows</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "in-progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                filter === item.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {item.label}
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === item.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {statusCounts[item.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <div className="text-gray-400 text-lg">
              No {filter !== "all" && filter} tasks found
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-snug flex-1">
                      {task.title}
                    </h3>
                    <div className="shrink-0">
                      {getStatusIcon(task.status)}
                    </div>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200">
                        <FiClock size={12} />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                        >
                          <FiTag size={10} />
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-400 px-2 py-1">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  {task.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Update Status
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      className="w-full px-3 py-2 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <FiEye size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
