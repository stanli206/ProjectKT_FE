import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div
      className="fixed left-0 top-0 h-screen w-64 z-20
                    bg-gradient-to-b from-indigo-600 to-purple-600
                    text-white flex flex-col justify-between"
    >
      <div>
        <div className="px-6 py-4 text-2xl font-bold border-b border-white/20">
          <Link to="/">EMS & Timesheet</Link>
        </div>
        {user && (
          <nav className="mt-6 flex flex-col gap-3 px-4 text-sm">
            {user.role === "Admin" && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/admin"
              >
                Dashboard
              </Link>
            )}
            {user.role === "Admin" && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/users"
              >
                Users
              </Link>
            )}
            {["Admin", "Principal"].includes(user.role) && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/projects"
              >
                Projects
              </Link>
            )}
            {user.role === "Admin" && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/employees"
              >
                Employees
              </Link>
            )}
            {["Admin", "Principal"].includes(user.role) && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/customers"
              >
                Customers
              </Link>
            )}
            {["Admin", "Principal"].includes(user.role) && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/approvals"
              >
                Approvals
              </Link>
            )}
            {["Admin", "Principal"].includes(user.role) && (
              <Link
                className="hover:bg-white/20 rounded-lg px-3 py-2"
                to="/reports"
              >
                Reports
              </Link>
            )}
            <Link
              className="hover:bg-white/20 rounded-lg px-3 py-2"
              to="/profile"
            >
              Profile
            </Link>
          </nav>
        )}
      </div>
      <div className="px-4 py-4 border-t border-white/20">
        {user && (
          <div className="mb-3 text-xs">
            {user.userName} · {user.role}
          </div>
        )}
        {user ? (
          <button
            onClick={logout}
            className="w-full px-3 py-2 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="block w-full px-3 py-2 rounded-lg border border-white text-center hover:bg-white/10"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
