import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Reorder } from "framer-motion";
import {
  FiClock,
  FiTag,
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiMenu,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axios from "../../utils/axiosInstance";
import { format } from "date-fns";

const TaskDetails = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [workflow, setWorkflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStepLabel, setNewStepLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
      fetchWorkflow();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await axios.get(`/my-tasks/${taskId}`);
      const foundTask = response.data.data;
      if (foundTask) {
        setTask(foundTask);
        setStatus(foundTask.status);
        setProgress(foundTask.progress || 0);
      } else {
        alert("Task not found");
        navigate("/my-tasks");
      }
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      alert("Failed to load task details");
      navigate("/my-tasks");
    }
  };

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/my-tasks/${taskId}/workflow`);
      const data = response.data.data;
      setWorkflow(data.workflow || []);
      setProgress(data.progress || 0);
      setStatus(data.status || "pending");
    } catch (error) {
      console.error("Failed to fetch workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStepLabel.trim()) {
      alert("Please enter a step label");
      return;
    }

    try {
      await axios.post(`/my-tasks/${taskId}/workflow/add-step`, {
        label: newStepLabel.trim(),
      });
      setNewStepLabel("");
      fetchWorkflow();
    } catch (error) {
      console.error("Failed to add step:", error);
      alert(error.response?.data?.message || "Failed to add step");
    }
  };

  const handleToggleStep = async (stepId) => {
    try {
      await axios.patch(`/my-tasks/${taskId}/workflow/toggle-step`, {
        stepId,
      });
      fetchWorkflow();
    } catch (error) {
      console.error("Failed to toggle step:", error);
      alert(error.response?.data?.message || "Failed to toggle step");
    }
  };

  const handleDeleteStep = async (stepId) => {
    if (!confirm("Are you sure you want to delete this step?")) return;

    try {
      await axios.delete(`/my-tasks/${taskId}/workflow/step/${stepId}`);
      fetchWorkflow();
    } catch (error) {
      console.error("Failed to delete step:", error);
      alert(error.response?.data?.message || "Failed to delete step");
    }
  };

  const handleReorderWorkflow = async (newWorkflow) => {
    setWorkflow(newWorkflow);

    try {
      const steps = newWorkflow.map((step, index) => ({
        stepId: step.stepId,
        order: index + 1,
      }));
      await axios.patch(`/my-tasks/${taskId}/workflow/reorder`, { steps });
    } catch (error) {
      console.error("Failed to reorder workflow:", error);
      fetchWorkflow();
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.patch(`/my-tasks/${taskId}/status`, { status: newStatus });
      setStatus(newStatus);
      fetchTaskDetails();
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

  if (loading || !task) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-tasks")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft size={20} />
          <span>Back to My Tasks</span>
        </button>

        {/* Task Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
          {task.description && (
            <p className="text-gray-600 mb-4">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200">
                <FiClock size={16} />
                {format(new Date(task.dueDate), "MMM dd, yyyy")}
              </span>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm"
                >
                  <FiTag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Status Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span className="font-semibold">Progress</span>
              <span className="font-bold text-indigo-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-linear-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            My Personal Workflow
          </h2>

          {workflow.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No workflow steps yet. Add your first step below!
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={workflow}
              onReorder={handleReorderWorkflow}
              className="space-y-2"
            >
              {workflow.map((step) => (
                <Reorder.Item
                  key={step.stepId}
                  value={step}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-all cursor-move"
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing">
                      <FiMenu className="text-gray-400" size={20} />
                    </div>
                    <button
                      onClick={() => handleToggleStep(step.stepId)}
                      className="shrink-0"
                    >
                      {step.done ? (
                        <FiCheckCircle className="text-green-600" size={24} />
                      ) : (
                        <FiCircle className="text-gray-400" size={24} />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${
                        step.done ? "line-through text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs text-gray-400">#{step.order}</span>
                    <button
                      onClick={() => handleDeleteStep(step.stepId)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}

          {/* Add Step Form */}
          <div className="mt-6 flex gap-3">
            <input
              type="text"
              value={newStepLabel}
              onChange={(e) => setNewStepLabel(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddStep()}
              placeholder="Enter new workflow step..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddStep}
              className="px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FiPlus size={20} />
              Add Step
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetails;
