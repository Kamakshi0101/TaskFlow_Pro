import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E0E7FF]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-indigo-100/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiCheckCircle className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent tracking-tight">
                TaskFlowPro
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                to="/login"
                className="px-5 py-2.5 text-[#0F172A] font-semibold hover:text-[#6366F1] transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#A5B4FC] to-[#F472B6] bg-opacity-10 rounded-full mb-6">
                <span className="text-[#6366F1] font-semibold text-sm tracking-wide">
                  ✨ Next-Gen Task Management
                </span>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold text-[#0F172A] leading-tight tracking-tight mb-6">
                Manage Tasks
                <br />
                <span className="bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>
              <p className="text-xl text-[#64748B] leading-relaxed mb-8 max-w-xl">
                Streamline your workflow with our powerful task management
                platform. Collaborate, track progress, and achieve your goals
                faster than ever.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-semibold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  Start Free Trial
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <button className="px-8 py-4 bg-white text-[#6366F1] font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-100">
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold text-[#0F172A]">10K+</div>
                  <div className="text-sm text-[#64748B]">Active Users</div>
                </div>
                <div className="w-px h-12 bg-indigo-200"></div>
                <div>
                  <div className="text-3xl font-bold text-[#0F172A]">50K+</div>
                  <div className="text-sm text-[#64748B]">Tasks Completed</div>
                </div>
                <div className="w-px h-12 bg-indigo-200"></div>
                <div>
                  <div className="text-3xl font-bold text-[#0F172A]">99%</div>
                  <div className="text-sm text-[#64748B]">Satisfaction</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 border border-white/50">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold">Today's Progress</span>
                      <span className="text-2xl font-bold">82%</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                      <div className="bg-white h-full w-[82%] rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#F472B6] to-[#EC4899] rounded-2xl p-6 text-white">
                      <div className="text-3xl font-bold mb-2">24</div>
                      <div className="text-sm opacity-90">Active Tasks</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#A5B4FC] to-[#6366F1] rounded-2xl p-6 text-white">
                      <div className="text-3xl font-bold mb-2">15</div>
                      <div className="text-sm opacity-90">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-gradient-to-br from-[#6366F1]/20 to-[#EC4899]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-gradient-to-br from-[#A5B4FC]/20 to-[#6366F1]/20 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Everything you need to manage your tasks efficiently and boost
              productivity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FiUsers />,
                title: "Team Collaboration",
                description: "Work together seamlessly with multi-assignee support",
                gradient: "from-[#6366F1] to-[#4F46E5]",
              },
              {
                icon: <FiClock />,
                title: "Time Tracking",
                description: "Track time spent on tasks with precision",
                gradient: "from-[#F472B6] to-[#EC4899]",
              },
              {
                icon: <FiTrendingUp />,
                title: "Analytics Dashboard",
                description: "Get insights with powerful analytics and reports",
                gradient: "from-[#A5B4FC] to-[#6366F1]",
              },
              {
                icon: <FiShield />,
                title: "Secure & Private",
                description: "Enterprise-grade security for your data",
                gradient: "from-[#EC4899] to-[#F472B6]",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-300 border border-white/50 hover:scale-105"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-white/50 to-indigo-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up in seconds and set up your workspace",
              },
              {
                step: "02",
                title: "Add Your Tasks",
                description: "Create tasks, assign team members, and set deadlines",
              },
              {
                step: "03",
                title: "Track Progress",
                description: "Monitor progress with real-time analytics and insights",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-lg shadow-indigo-100 border border-white/50">
                  <div className="text-6xl font-bold bg-gradient-to-br from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[#64748B] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <FiArrowRight className="text-3xl text-[#A5B4FC]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold text-[#0F172A] mb-4 tracking-tight">
              Beautiful Dashboard
            </h2>
            <p className="text-xl text-[#64748B] max-w-2xl mx-auto">
              A clean, modern interface designed for productivity
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-indigo-200/50 border border-white/50">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">Total Tasks</div>
                  <div className="text-4xl font-bold mb-4">142</div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiTrendingUp />
                    <span>+12% this week</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#F472B6] to-[#EC4899] rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">Completed</div>
                  <div className="text-4xl font-bold mb-4">89</div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiZap />
                    <span>62.7% rate</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#A5B4FC] to-[#6366F1] rounded-2xl p-6 text-white">
                  <div className="text-sm opacity-90 mb-2">Team Members</div>
                  <div className="text-4xl font-bold mb-4">24</div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiUsers />
                    <span>5 active now</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-[#EC4899]/10 rounded-3xl blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-3xl p-12 md:p-16 shadow-2xl shadow-indigo-300 overflow-hidden"
          >
            <div className="relative z-10 text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Ready to boost your productivity?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using TaskFlowPro to manage
                their work efficiently
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#6366F1] font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Get Started Now
                <FiArrowRight />
              </Link>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white/50 backdrop-blur-xl border-t border-indigo-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FiCheckCircle className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-[#EC4899] bg-clip-text text-transparent tracking-tight">
                TaskFlowPro
              </span>
            </div>
            <div className="flex items-center gap-8 text-[#64748B]">
              <a
                href="#"
                className="hover:text-[#6366F1] transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="#"
                className="hover:text-[#6366F1] transition-colors duration-300"
              >
                Pricing
              </a>
              <a
                href="#"
                className="hover:text-[#6366F1] transition-colors duration-300"
              >
                About
              </a>
              <a
                href="#"
                className="hover:text-[#6366F1] transition-colors duration-300"
              >
                Contact
              </a>
            </div>
            <div className="text-[#64748B] text-sm">
              © 2025 TaskFlowPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
