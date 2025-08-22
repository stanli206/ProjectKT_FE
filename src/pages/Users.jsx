import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    userName: "",
    employeeId: "",
    role: "Employee",
    plainPassword: ""
  });

  const load = async () => {
    setErr(""); setMsg("");
    try {
      const [{ data: u }, { data: e }] = await Promise.all([
        api.get("/users"),            // Admin-only list
        api.get("/employees"),        // to pick employeeId
      ]);
      setUsers(u || []);
      setEmployees(e || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!form.userName || !form.employeeId || !form.plainPassword) {
      return setErr("Username, Employee, Password are required");
    }
    try {
      await api.post("/auth/register", form);
      setMsg("User created successfully");
      setForm({ userName: "", employeeId: "", role: "Employee", plainPassword: "" });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  };

  const del = async (userId) => {
    if (!confirm("Delete this user?")) return;
    setErr(""); setMsg("");
    try {
      await api.delete(`/users/${userId}`);
      setMsg("User deleted");
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  const resetPwd = async (userId) => {
    const pwd = prompt("Enter new password");
    if (!pwd) return;
    try {
      await api.put(`/users/profile/${userId}`, { plainPassword: pwd });
      alert("Password updated");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed");
    }
  };

  const employeesMap = useMemo(() => {
    const m = {};
    employees.forEach(emp => { m[emp.employeeId] = emp; });
    return m;
  }, [employees]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      {/* Create Form */}
      <form onSubmit={create} className="p-4 rounded-2xl border bg-white grid sm:grid-cols-4 gap-3">
        <Field label="Username" value={form.userName} onChange={(v)=>setForm(s=>({...s, userName:v}))}/>
        <label className="text-sm">
          <span className="block text-gray-600">Employee</span>
          <select
            className="mt-1 w-full px-3 py-2 rounded-lg border"
            value={form.employeeId}
            onChange={(e)=>setForm(s=>({...s, employeeId:e.target.value}))}
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-600">Role</span>
          <select
            className="mt-1 w-full px-3 py-2 rounded-lg border"
            value={form.role}
            onChange={(e)=>setForm(s=>({...s, role:e.target.value}))}
          >
            <option>Employee</option>
            <option>Principal</option>
            <option>Admin</option>
          </select>
        </label>
        <Field label="Password" type="password" value={form.plainPassword} onChange={(v)=>setForm(s=>({...s, plainPassword:v}))}/>
        <div className="sm:col-span-4">
          <button className="px-4 py-2 rounded-lg bg-black text-white">Create User</button>
        </div>
      </form>

      {/* Users Table */}
      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Employee</th>
              <th className="py-2 pr-4">Last login</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const emp = employeesMap[u.employeeId];
              return (
                <tr key={u.userId} className="border-b">
                  <td className="py-2 pr-4">{u.userName} <span className="text-gray-500">({u.userId})</span></td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{emp ? `${emp.name} • ${emp.personalEmail??""}` : u.employeeId}</td>
                  <td className="py-2 pr-4">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}</td>
                  <td className="py-2 pr-4 flex gap-2">
                    <button onClick={()=>resetPwd(u.userId)} className="px-3 py-1.5 rounded-lg border">Reset Pwd</button>
                    <button onClick={()=>del(u.userId)} className="px-3 py-1.5 rounded-lg border">Delete</button>
                  </td>
                </tr>
              );
            })}
            {users.length===0 && (
              <tr><td className="py-3 text-gray-500" colSpan="5">No users.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type="text" }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-600">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg border"
        value={value}
        type={type}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}
