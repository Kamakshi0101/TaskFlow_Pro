import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import axios from "../utils/axiosInstance";
import { setUser } from "../redux/slices/authSlice";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/auth/login", formData);
      dispatch(setUser(response.data.data.user));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E0E7FF] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <FiCheckCircle className="text-white text-2xl" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent tracking-tight">
              TaskFlowPro
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[#64748B]">Sign in to continue to your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-indigo-100 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-indigo-100 rounded-2xl focus:border-[#6366F1] focus:outline-none transition-all duration-300 text-[#0F172A]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white border-2 border-indigo-100 rounded-2xl focus:border-[#6366F1] focus:outline-none transition-all duration-300 text-[#0F172A]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#64748B] hover:text-[#6366F1] transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-[#64748B]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#6366F1] font-semibold hover:text-[#4F46E5] transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-[#64748B] hover:text-[#6366F1] transition-colors text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
