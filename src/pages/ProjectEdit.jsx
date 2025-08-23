import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth(); // ← current user

  const role = user?.role || "Guest";
  const isAdmin = role === "Admin";
  const isPrincipal = role === "Principal";
  const canRead = isAdmin || isPrincipal;
  const canEdit = isAdmin; // ← ONLY ADMIN can edit
  const isReadOnly = !canEdit && canRead;

  const [project, setProject] = useState(null);
  const [err, setErr] = useState("");

  // dropdown data
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]); // for manager name resolve

  // temp input for adding one employee row
  const [empItem, setEmpItem] = useState({
    employeeId: "",
    employeeName: "",
    perHour: "",
    empHours: "",
  });

  // --------- auth guard ----------
  useEffect(() => {
    if (!user) return; // let global auth handle login redirect
    if (!canRead) {
      // Employee or others → no access
      alert("You are not authorized to access Projects.");
      nav("/"); // or nav(-1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, canRead]);

  // --------- loaders ----------
  const loadProject = async () => {
    try {
      const { data } = await api.get("/projects");
      const p = (data || []).find((x) => x.projectId === id);
      if (!p) return setErr("Project not found");
      setProject(p);
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    }
  };

  const loadDropdowns = async () => {
    try {
      const [{ data: emp }, { data: usr }] = await Promise.all([
        api.get("/employees"),
        api.get("/users"),
      ]);
      setEmployees(emp || []);
      setUsers(usr || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dropdown data");
    }
  };

  useEffect(() => {
    if (!canRead) return;
    loadProject();
    loadDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, canRead]);

  // --------- helpers ----------
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");

  const managerName = useMemo(() => {
    if (!project?.managerId) return "-";
    const u = users.find((x) => x.userId === project.managerId);
    return u ? `${u.userName} (${u.role})` : project.managerId;
  }, [project, users]);

  // when employee pick changes, auto-fill name & perHour
  const onPickEmployee = (employeeId) => {
    if (isReadOnly) return;
    const emp = employees.find((x) => x.employeeId === employeeId);
    setEmpItem((s) => ({
      ...s,
      employeeId,
      employeeName: emp?.name || "",
      perHour: emp?.perHoursCharge ?? "",
    }));
  };

  const addEmp = () => {
    if (isReadOnly) return;
    if (!empItem.employeeId) return;
    const perHour = Number(empItem.perHour || 0);
    const empHours = Number(empItem.empHours || 0);
    const empAmount = perHour * empHours;

    // avoid duplicate same employeeId
    const already = new Set(
      (project?.assignedEmployeeIds || []).map((e) => e.employeeId)
    );
    if (already.has(empItem.employeeId)) {
      alert("This employee already assigned to the project.");
      return;
    }

    setProject((s) => ({
      ...s,
      assignedEmployeeIds: [
        ...(s.assignedEmployeeIds || []),
        {
          employeeId: empItem.employeeId,
          employeeName: empItem.employeeName,
          perHour,
          empHours,
          empAmount,
        },
      ],
    }));
    setEmpItem({ employeeId: "", employeeName: "", perHour: "", empHours: "" });
  };

  const removeEmp = (idx) => {
    if (isReadOnly) return;
    setProject((s) => ({
      ...s,
      assignedEmployeeIds: s.assignedEmployeeIds.filter((_, i) => i !== idx),
    }));
  };

  const updateEmpField = (idx, field, value) => {
    if (isReadOnly) return;
    setProject((s) => {
      const arr = [...(s.assignedEmployeeIds || [])];
      const row = { ...arr[idx], [field]: value };
      // recalc amount if perHour/hours changed
      const perHour = Number(field === "perHour" ? value : row.perHour || 0);
      const empHours = Number(field === "empHours" ? value : row.empHours || 0);
      row.empAmount = perHour * empHours;
      arr[idx] = row;
      return { ...s, assignedEmployeeIds: arr };
    });
  };

  const save = async () => {
    if (!canEdit) return; // hard stop on UI
    try {
      await api.put(`/projects/${id}`, {
        status: project.status,
        assignedEmployeeIds: project.assignedEmployeeIds,
      });
      alert("Saved");
      nav("/projects");
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    }
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Project</h1>
        {/* Role badge */}
        <span
          className={`px-2.5 py-1 rounded-lg text-xs ${
            isAdmin
              ? "bg-emerald-50 text-emerald-700"
              : isPrincipal
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isAdmin
            ? "Admin · Full access"
            : isPrincipal
            ? "Principal · Read-only"
            : "No access"}
        </span>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      {/* Project meta card */}
      <div className="p-5 rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-lg font-semibold">
            {project.job_name}{" "}
            <span className="text-gray-500 text-sm">
              ({project?.Pro_code?.code || "-"})
            </span>
          </p>
          <div className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">Status:</span>
            <select
              className="px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
              value={project.status}
              disabled={isReadOnly}
              onChange={(e) =>
                setProject((s) => ({ ...s, status: e.target.value }))
              }
            >
              <option>Open</option>
              <option>In-progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
          <Meta label="Project Code" value={project?.Pro_code?.code || "-"} />
          <Meta
            label="Customer Code"
            value={project?.Pro_code?.customerCode || "-"}
          />
          <Meta label="Manager" value={managerName} />
          <Meta
            label="Per Hour (avg)"
            value={Number(project.perHourCost || 0).toFixed(2)}
          />
          <Meta label="Total Hours" value={project.totalHours ?? 0} />
          <Meta label="Total Cost" value={project.totalCost ?? 0} />
          <Meta label="Created By" value={project.createdBy || "-"} />
          <Meta label="Created At" value={fmt(project.createdAt)} />
          <Meta label="Updated By" value={project.updatedBy || "-"} />
          <Meta label="Updated At" value={fmt(project.updatedAt)} />
        </div>
      </div>

      {/* Assign employees card */}
      <div className="p-5 rounded-2xl bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-medium">Assign Employees</p>
          {isReadOnly && (
            <span className="text-xs text-gray-500">Read-only</span>
          )}
        </div>

        {/* add-new row (disabled for Principal) */}
        <div className="grid sm:grid-cols-4 gap-3">
          <Select
            label="Employee"
            value={empItem.employeeId}
            onChange={onPickEmployee}
            placeholder={isReadOnly ? "Read-only" : "Select employee"}
            disabled={isReadOnly}
            options={employees.map((e) => ({
              value: e.employeeId,
              label: `${e.name} (${e.employeeId}) · ₹${
                e.perHoursCharge ?? 0
              }/hr`,
            }))}
          />
          <Field
            label="Name"
            value={empItem.employeeName}
            onChange={(v) => setEmpItem((s) => ({ ...s, employeeName: v }))}
            disabled={isReadOnly}
          />
          <Field
            label="Per Hour"
            type="number"
            value={empItem.perHour}
            onChange={(v) => setEmpItem((s) => ({ ...s, perHour: v }))}
            disabled={isReadOnly}
          />
          <Field
            label="Hours"
            type="number"
            value={empItem.empHours}
            onChange={(v) => setEmpItem((s) => ({ ...s, empHours: v }))}
            disabled={isReadOnly}
          />
        </div>

        {!isReadOnly && (
          <button
            type="button"
            onClick={addEmp}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + Add
          </button>
        )}

        {/* editable assigned list */}
        <div className="overflow-auto">
          <table className="min-w-full text-sm mt-3">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Per Hour</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(project.assignedEmployeeIds || []).map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 pr-4">
                    {e.employeeName}{" "}
                    <span className="text-gray-500">({e.employeeId})</span>
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      className="w-28 px-2 py-1 rounded-lg bg-white shadow-sm focus:outline-none focus:ring disabled:opacity-60"
                      type="number"
                      value={e.perHour}
                      disabled={isReadOnly}
                      onChange={(ev) =>
                        updateEmpField(i, "perHour", Number(ev.target.value))
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">
                    <input
                      className="w-28 px-2 py-1 rounded-lg bg-white shadow-sm focus:outline-none focus:ring disabled:opacity-60"
                      type="number"
                      value={e.empHours}
                      disabled={isReadOnly}
                      onChange={(ev) =>
                        updateEmpField(i, "empHours", Number(ev.target.value))
                      }
                    />
                  </td>
                  <td className="py-2 pr-4">{Number(e.empAmount || 0)}</td>
                  <td className="py-2 pr-4">
                    {!isReadOnly ? (
                      <button
                        onClick={() => removeEmp(i)}
                        className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!project.assignedEmployeeIds ||
                project.assignedEmployeeIds.length === 0) && (
                <tr>
                  <td className="py-3 text-gray-500" colSpan="5">
                    No employees assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex gap-3">
        {canEdit && (
          <button
            onClick={save}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Save Changes
          </button>
        )}
        <button
          onClick={() => nav("/projects")}
          className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow"
        >
          {canEdit ? "Cancel" : "Back"}
        </button>
      </div>
    </div>
  );
}

/* ---------- small UI helpers ---------- */
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
        value={value}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled,
}) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <select
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
        value={value}
        disabled={disabled}
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

function Meta({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value ?? "-"}</p>
    </div>
  );
}
