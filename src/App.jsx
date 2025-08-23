import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";
import EmployeeTimesheet from "./pages/EmployeeTimesheet";
import Projects from "./pages/Projects";
import { useAuth } from "./context/AuthContext";
import Users from "./pages/Users";
import Employees from "./pages/Employees";
import Customers from "./pages/Customers";
import ProjectEdit from "./pages/ProjectEdit";
import TimesheetApproval from "./pages/TimesheetApproval";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Admin") return <Navigate to="/admin" replace />;
  if (user.role === "Principal") return <Navigate to="/principal" replace />;
  return <Navigate to="/timesheet" replace />;
}

export default function App() {
  const { user } = useAuth(); //

  return (
    <BrowserRouter>
      {user && <Navbar />}

      <main
        className={`min-h-screen bg-gray-50 px-6 py-6 ${user ? "ml-64" : ""}`}
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allow={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/principal"
              element={
                <ProtectedRoute allow={["Principal", "Admin"]}>
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timesheet"
              element={
                <ProtectedRoute allow={["Employee", "Admin", "Principal"]}>
                  <EmployeeTimesheet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute allow={["Admin", "Principal"]}>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allow={["Admin"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allow={["Admin", "Principal"]}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute allow={["Admin", "Principal"]}>
                  <ProjectEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allow={["Principal", "Admin"]}>
                  <TimesheetApproval />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allow={["Admin", "Principal"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allow={["Admin", "Principal", "Employee"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allow={["Admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </BrowserRouter>
  );
}
