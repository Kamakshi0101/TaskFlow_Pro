import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'

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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Dashboard Coming Soon</h1>
                <p className="text-gray-600">You are logged in! 🎉</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />

      {/* 404 redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App