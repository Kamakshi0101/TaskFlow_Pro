import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllTasks from './pages/admin/AllTasks'
import Reports from './pages/admin/Reports'
import MyTasks from './pages/user/MyTasks'
import TaskDetails from './pages/user/TaskDetails'
import UserAnalytics from './pages/user/UserAnalytics'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import Users from './pages/Users'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth)
  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { user } = useSelector((state) => state.auth)
  return !user ? children : <Navigate to="/dashboard" replace />
}

// Dashboard Router (routes to admin or user dashboard based on role)
function DashboardRouter() {
  const { user } = useSelector((state) => state.auth)
  return user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
}

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-tasks" 
        element={
          <ProtectedRoute>
            <MyTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks/:id" 
        element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <UserAnalytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/all-tasks" 
        element={
          <ProtectedRoute>
            <AllTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />

      {/* 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App