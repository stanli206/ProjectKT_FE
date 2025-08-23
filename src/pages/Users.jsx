import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // create form
  const [form, setForm] = useState({
    userName: "",
    employeeId: "",
    role: "Employee",
    plainPassword: ""
  });

  // edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    userName: "",
    role: "Employee",
    plainPassword: ""
  });

  const load = async () => {
    setErr(""); setMsg("");
    try {
      const [{ data: u }, { data: e }] = await Promise.all([
        api.get("/users"),
        api.get("/employees"),
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

  const openEdit = (u) => {
    setEditingUser(u);
    setEditForm({ userName: u.userName, role: u.role, plainPassword: "" });
    setEditOpen(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setErr(""); setMsg("");
    try {
      // only send fields that have value; password optional
      const payload = { userName: editForm.userName, role: editForm.role };
      if (editForm.plainPassword?.trim()) payload.plainPassword = editForm.plainPassword.trim();
      await api.put(`/users/profile/${editingUser.userId}`, payload);
      setMsg("User updated");
      setEditOpen(false);
      setEditingUser(null);
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Update failed");
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

      {/* Create Card */}
      <form onSubmit={create} className="p-5 rounded-2xl bg-white shadow-sm grid sm:grid-cols-4 gap-3">
        <Field label="Username" value={form.userName} onChange={(v)=>setForm(s=>({...s, userName:v}))}/>
        <Select
          label="Employee"
          value={form.employeeId}
          onChange={(v)=>setForm(s=>({...s, employeeId:v}))}
          options={employees.map(emp => ({ value: emp.employeeId, label: `${emp.name} (${emp.employeeId})` }))}
          placeholder="Select Employee"
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(v)=>setForm(s=>({...s, role:v}))}
          options={[{value:"Employee",label:"Employee"},{value:"Principal",label:"Principal"},{value:"Admin",label:"Admin"}]}
        />
        <Field label="Password" type="password" value={form.plainPassword} onChange={(v)=>setForm(s=>({...s, plainPassword:v}))}/>
        <div className="sm:col-span-4">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">Create User</button>
        </div>
      </form>

      {/* Users Table (soft UI) */}
      <div className="overflow-auto rounded-2xl bg-white shadow-sm">
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
                  <td className="py-2 pr-4">
                    <span className="font-medium">{u.userName}</span>{" "}
                    <span className="text-gray-500">({u.userId})</span>
                  </td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{emp ? `${emp.name} • ${emp.personalEmail ?? ""}` : u.employeeId}</td>
                  <td className="py-2 pr-4">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "-"}</td>
                  <td className="py-2 pr-4 flex flex-wrap gap-2">
                    <button onClick={()=>openEdit(u)} className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow">Edit</button>
                    <button onClick={()=>del(u.userId)} className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow">Delete</button>
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

      {/* Edit Modal */}
      {editOpen && (
        <Modal onClose={()=>{ setEditOpen(false); setEditingUser(null); }}>
          <form onSubmit={saveEdit} className="space-y-4">
            <h2 className="text-lg font-semibold">Edit User</h2>
            <Field
              label="Username"
              value={editForm.userName}
              onChange={(v)=>setEditForm(s=>({...s, userName:v}))}
            />
            <Select
              label="Role"
              value={editForm.role}
              onChange={(v)=>setEditForm(s=>({...s, role:v}))}
              options={[{value:"Employee",label:"Employee"},{value:"Principal",label:"Principal"},{value:"Admin",label:"Admin"}]}
            />
            <Field
              label="New Password (optional)"
              type="password"
              value={editForm.plainPassword}
              onChange={(v)=>setEditForm(s=>({...s, plainPassword:v}))}
              placeholder="Leave blank to keep same"
            />
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={()=>{ setEditOpen(false); setEditingUser(null); }} className="px-3 py-1.5 rounded-lg bg-white shadow-sm">Cancel</button>
              <button className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Small reusable inputs ---------- */
function Field({ label, value, onChange, type="text", placeholder }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e)=>onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder = "Select" }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <select
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
