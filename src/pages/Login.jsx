import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, user } = useAuth();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  // focus username input on mount
  const userRef = useRef(null);
  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.userName.trim() || !form.password.trim()) {
      setError("Please enter username and password");
      userRef.current?.focus();
      return;
    }
    const res = await login(form);
    if (!res.ok) {
      setError(res.message || "Login failed");
      userRef.current?.focus();
      return;
    }
    // role-based redirect
    const role = res.user.role;
    if (role === "Admin") navigate("/admin");
    else if (role === "Principal") navigate("/principal");
    else navigate("/timesheet");
  };

  if (user) return null;

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={onSubmit}
          className="space-y-4 p-6 rounded-2xl bg-white shadow-md"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to continue</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="text-sm text-gray-700">
              Username
            </label>
            <input
              id="username"
              ref={userRef}
              className="w-full mt-1 px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.userName}
              onChange={(e) =>
                setForm((s) => ({ ...s, userName: e.target.value }))
              }
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                className="w-full px-3 py-2 rounded-lg border bg-white pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({ ...s, password: e.target.value }))
                }
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* inline spinner overlay space */}
        {loading && (
          <div className="mt-4 flex justify-center">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
}
