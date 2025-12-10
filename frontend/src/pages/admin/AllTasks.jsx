import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiSearch, FiFilter, FiGrid, FiList, 
  FiEdit2, FiTrash2, FiClock, FiUser, FiTag, FiFileText, FiDownload 
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axios from "../../utils/axiosInstance";
import { format } from "date-fns";

const AllTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // "table" or "kanban"
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignee: "all",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    assignees: [],
    tags: [],
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [currentPage, filters, searchQuery]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.priority !== "all" && { priority: filters.priority }),
        ...(filters.assignee !== "all" && { assignee: filters.assignee }),
      };

      const response = await axios.get("/tasks", { params });
      setTasks(response.data.data.tasks);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await axios.get("/users", {
        params: { simple: "true" }
      });
      console.log("Users response:", response.data);
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      console.error("Error details:", error.response?.data);
      setUsers([]);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/tasks", formData);
      setShowCreateModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
      const errorMessage = error.response?.data?.message || "Failed to create task";
      alert(errorMessage);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/tasks/${selectedTask._id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      const errorMessage = error.response?.data?.message || "Failed to update task";
      alert(errorMessage);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      assignees: [],
      tags: [],
    });
    setSelectedTask(null);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
      assignees: task.assignees.map((a) => a.user._id || a.user),
      tags: task.tags || [],
    });
    setShowEditModal(true);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "text-gray-600 bg-gray-50 border-gray-200",
      "in-progress": "text-indigo-600 bg-indigo-50 border-indigo-200",
      completed: "text-green-600 bg-green-50 border-green-200",
      archived: "text-slate-600 bg-slate-50 border-slate-200",
    };
    return colors[status] || colors.pending;
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get('/reports/tasks/pdf', {
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TaskFlowPro-Tasks-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('/reports/tasks/excel', {
        params: {
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TaskFlowPro-Tasks-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Excel exported successfully!');
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-500 mt-1">
              Manage and assign tasks to team members
            </p>
          </div>
          <div className="flex gap-3">
            {/* Export Buttons */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <FiFileText size={18} />
              PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <FiDownload size={18} />
              Excel
            </motion.button>
            {/* Create Task Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow"
            >
              <FiPlus /> Create Task
            </motion.button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* Priority Filter */}
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              {/* Assignee Filter */}
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Assignees</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiList size={20} />
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "kanban"
                      ? "bg-white shadow-sm text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <FiGrid size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : viewMode === "table" ? (
          <TaskTable
            tasks={tasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        ) : (
          <TaskKanban
            tasks={tasks}
            onEdit={openEditModal}
            onDelete={handleDeleteTask}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        <TaskModal
          show={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          onSubmit={handleCreateTask}
          formData={formData}
          setFormData={setFormData}
          users={users}
          title="Create New Task"
        />

        {/* Edit Task Modal */}
        <TaskModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          onSubmit={handleUpdateTask}
          formData={formData}
          setFormData={setFormData}
          users={users}
          title="Edit Task"
        />
      </div>
    </DashboardLayout>
  );
};

// Task Table Component
const TaskTable = ({ tasks, onEdit, onDelete, getPriorityColor, getStatusColor }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Task
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Assignees
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Due Date
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <motion.tr
                key={task._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="font-semibold text-gray-900 truncate">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 truncate mt-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {task.assignees && task.assignees.length > 0 ? (
                      task.assignees.map((assignee, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            assignee.status || 'pending'
                          )}`}
                          title={assignee.user?.name || 'User'}
                        >
                          {assignee.status || 'pending'}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No assignees</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((assignee, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
                        title={assignee.user?.name || "User"}
                      >
                        {(assignee.user?.name || "U")[0].toUpperCase()}
                      </div>
                    ))}
                    {task.assignees.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-semibold ring-2 ring-white">
                        +{task.assignees.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {task.dueDate ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiClock size={14} />
                      {format(new Date(task.dueDate), "MMM dd, yyyy")}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No due date</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(task._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="py-20 text-center">
          <div className="text-gray-400 text-lg">No tasks found</div>
        </div>
      )}
    </div>
  );
};

// Task Kanban Component
const TaskKanban = ({ tasks, onEdit, onDelete, getPriorityColor, getStatusColor }) => {
  const statuses = ["pending", "in-progress", "completed", "archived"];
  const statusLabels = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    archived: "Archived",
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statuses.map((status) => {
        const statusTasks = getTasksByStatus(status);
        return (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{statusLabels[status]}</h3>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
                {statusTasks.length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {statusTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-sm leading-snug">
                          {task.title}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs"
                            >
                              <FiTag size={10} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white"
                              title={assignee.user?.name || "User"}
                            >
                              {(assignee.user?.name || "U")[0].toUpperCase()}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEdit(task)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(task._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {statusTasks.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Task Modal Component
const TaskModal = ({ show, onClose, onSubmit, formData, setFormData, users, title }) => {
  if (!show) return null;

  const handleAssigneeToggle = (userId) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId],
    }));
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.target.value = "";
    }
  };

  const handleTagRemove = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Task Title * <span className="text-gray-400 font-normal text-xs">(min 3 characters)</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Enter task title (min 3 characters)"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Assign To
            </label>
            {users.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
                Loading users...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-200">
                {users.filter(user => user.role !== 'admin').map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors border border-gray-100"
                    onClick={(e) => {
                      // Prevent double-firing if clicking checkbox directly
                      if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        handleAssigneeToggle(user._id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignees.includes(user._id)}
                      onChange={() => handleAssigneeToggle(user._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tags
            </label>
            <input
              type="text"
              onKeyDown={handleTagAdd}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="Type and press Enter to add tags"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="text-indigo-400 hover:text-indigo-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
            >
              {title.includes("Create") ? "Create Task" : "Update Task"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AllTasks;
