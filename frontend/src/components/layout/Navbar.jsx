import { useSelector } from "react-redux";
import { FiBell, FiSearch } from "react-icons/fi";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-white/60 backdrop-blur-xl border-b border-indigo-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-indigo-100 rounded-2xl focus:border-[#6366F1] focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-3 bg-white rounded-2xl border-2 border-indigo-100 hover:border-[#6366F1] transition-all duration-300">
            <FiBell className="text-xl text-[#64748B]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F472B6] rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-indigo-100 px-4 py-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#EC4899] rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-[#0F172A]">
                {user?.name}
              </div>
              <div className="text-xs text-[#64748B] capitalize">
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
