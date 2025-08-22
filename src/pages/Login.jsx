import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login, loading, user } = useAuth();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form);
    if (!res.ok) return setError(res.message);
    // role-based redirect
    const role = res.user.role;
    if (role === "Admin") navigate("/admin");
    else if (role === "Principal") navigate("/principal");
    else navigate("/timesheet");
  };

  if (user) return null;

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-2xl border bg-white">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="text-sm">Username</label>
          <input
            className="w-full mt-1 px-3 py-2 rounded-lg border"
            value={form.userName}
            onChange={(e) => setForm((s) => ({ ...s, userName: e.target.value }))}
            placeholder="john"
          />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 rounded-lg border"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>
        <button className="w-full px-4 py-2 rounded-lg bg-black text-white">Login</button>
      </form>
      {loading && <Spinner />}
    </div>
  );
}
