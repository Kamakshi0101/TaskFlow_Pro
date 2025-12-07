import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {
    status: "",
    priority: "",
    search: "",
  },
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.error = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setTasks,
  setCurrentTask,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError,
  setFilters,
} = taskSlice.actions;

export default taskSlice.reducer;
