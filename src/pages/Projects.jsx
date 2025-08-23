import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || "Guest";
  const isAdmin = role === "Admin";
  const isPrincipal = role === "Principal";
  const isEmployee = role === "Employee";

  // permissions
  const canCreate = isAdmin; // Create: Admin only
  const canEdit = isAdmin; // Edit: Admin only
  const canDelete = isAdmin; // Delete: Admin only
  const canRead = isAdmin || isPrincipal; // Read: Admin + Principal
  const canAccess = canRead || canCreate; // route allowed?

  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  // dropdown options
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState({
    job_name: "",
    customerIdOrCode: "",
    managerId: "",
    assignedEmployeeIds: [],
  });

  // temporary selection for adding one employee row
  const [empPick, setEmpPick] = useState({
    employeeId: "",
    employeeName: "",
    perHour: "",
    empHours: "",
  });

  const loadProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setList(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load projects");
    }
  };

  const loadOptions = async () => {
    try {
      const [{ data: cust }, { data: usr }, { data: emp }] = await Promise.all([
        api.get("/customers"),
        api.get("/users"),
        api.get("/employees"),
      ]);
      setCustomers(cust || []);
      // Managers: show only Admin/Principal as options (safe default)
      setUsers(
        (usr || []).filter((u) => u.role === "Admin" || u.role === "Principal")
      );
      setEmployees(emp || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dropdown data");
    }
  };

  useEffect(() => {
    if (!canAccess) return; // no fetch if no access
    loadProjects();
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  // block employees completely
  if (!canAccess) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="p-6 rounded-2xl bg-white shadow-sm">
          <p className="text-sm">
            <span className="font-medium">Access denied.</span> This module is
            not available for your role.
          </p>
          <div className="mt-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // when employee changes, auto-fill name + perHour from Employee master
  const onPickEmployee = (employeeId) => {
    const emp = employees.find((x) => x.employeeId === employeeId);
    setEmpPick((s) => ({
      ...s,
      employeeId,
      employeeName: emp?.name || "",
      perHour: emp?.perHoursCharge ?? "",
    }));
  };

  const addEmp = () => {
    if (!empPick.employeeId) return;
    const perHour = Number(empPick.perHour || 0);
    const empHours = Number(empPick.empHours || 0);
    const empAmount = perHour * empHours;

    setForm((s) => ({
      ...s,
      assignedEmployeeIds: [
        ...s.assignedEmployeeIds,
        {
          employeeId: empPick.employeeId,
          employeeName: empPick.employeeName,
          perHour,
          empHours,
          empAmount,
        },
      ],
    }));
    setEmpPick({ employeeId: "", employeeName: "", perHour: "", empHours: "" });
  };

  const removeEmp = (idx) => {
    setForm((s) => ({
      ...s,
      assignedEmployeeIds: s.assignedEmployeeIds.filter((_, i) => i !== idx),
    }));
  };

  const create = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    setErr("");
    try {
      await api.post("/projects", form);
      await loadProjects();
      setForm({
        job_name: "",
        customerIdOrCode: "",
        managerId: "",
        assignedEmployeeIds: [],
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  };

  const del = async (projectId) => {
    if (!canDelete) return;
    if (!confirm("Delete project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      loadProjects();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  // small helpers for selects
  const customerLabel = (c) => `${c.Cust_name} (${c.Cust_code})`;
  const userLabel = (u) => `${u.userName} • ${u.role}`;
  const employeeLabel = (e) => `${e.name} (${e.employeeId})`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="text-sm text-gray-600">
          Role: <span className="font-medium">{role}</span>
        </div>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      {/* Create Project Card (Admin only) */}
      {canCreate && (
        <form
          onSubmit={create}
          className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Job Name"
              value={form.job_name}
              onChange={(v) => setForm((s) => ({ ...s, job_name: v }))}
            />

            {/* Customer dropdown */}
            <Select
              label="Customer"
              value={form.customerIdOrCode}
              onChange={(v) => setForm((s) => ({ ...s, customerIdOrCode: v }))}
              placeholder="Select customer"
              options={customers.map((c) => ({
                value: c.Cust_code,
                label: customerLabel(c),
              }))}
            />

            {/* Manager dropdown */}
            <Select
              label="Manager (userId)"
              value={form.managerId}
              onChange={(v) => setForm((s) => ({ ...s, managerId: v }))}
              placeholder="Select manager"
              options={users.map((u) => ({
                value: u.userId,
                label: userLabel(u),
              }))}
            />
          </div>

          {/* Assign Employees */}
          <div className="p-4 rounded-xl bg-gray-50 space-y-3">
            <p className="font-medium">Assign Employees</p>

            <div className="grid sm:grid-cols-4 gap-3">
              {/* Employee dropdown */}
              <Select
                label="Employee"
                value={empPick.employeeId}
                onChange={onPickEmployee}
                placeholder="Pick employee"
                options={employees.map((e) => ({
                  value: e.employeeId,
                  label: employeeLabel(e),
                }))}
              />
              <Field
                label="Name"
                value={empPick.employeeName}
                onChange={(v) => setEmpPick((s) => ({ ...s, employeeName: v }))}
              />
              <Field
                label="Per Hour"
                type="number"
                value={empPick.perHour}
                onChange={(v) => setEmpPick((s) => ({ ...s, perHour: v }))}
              />
              <Field
                label="Hours"
                type="number"
                value={empPick.empHours}
                onChange={(v) => setEmpPick((s) => ({ ...s, empHours: v }))}
              />
            </div>

            <button
              type="button"
              onClick={addEmp}
              className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow border border-transparent"
            >
              + Add Employee
            </button>

            {/* Assigned chips */}
            {form.assignedEmployeeIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.assignedEmployeeIds.map((e, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm text-sm"
                  >
                    {e.employeeName} · {e.empHours}h × {e.perHour} ={" "}
                    {e.empAmount}
                    <button
                      type="button"
                      onClick={() => removeEmp(i)}
                      className="text-gray-500 hover:text-black"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Create Project
          </button>
        </form>
      )}

      {/* Project list — soft cards (Admin + Principal can view) */}
      <div className="grid gap-3">
        {list.map((p) => (
          <div
            key={p.projectId}
            className="p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{p.job_name}</p>
              <p className="text-sm text-gray-500">
                {p?.Pro_code?.code} • {p.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canEdit ? (
                <Link
                  to={`/projects/${p.projectId}`}
                  className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                >
                  Edit
                </Link>
              ) : (
                // Principal: read-only view (you can reuse the same page in view mode or a details modal)
                <Link
                  to={`/projects/${p.projectId}`}
                  className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                >
                  View
                </Link>
              )}

              {canDelete && (
                <button
                  onClick={() => del(p.projectId)}
                  className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="p-6 rounded-2xl bg-white shadow-sm text-gray-500">
            No projects yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small reusable inputs ---------- */

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
