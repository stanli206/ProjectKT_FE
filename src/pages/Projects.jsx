import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function Projects() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    job_name: "",
    customerIdOrCode: "",
    managerId: "",
    assignedEmployeeIds: [],
  });
  const [empItem, setEmpItem] = useState({
    employeeId: "",
    employeeName: "",
    perHour: "",
    empHours: "",
  });

  const load = async () => {
    try {
      const { data } = await api.get("/projects");
      setList(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load projects");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addEmp = () => {
    if (!empItem.employeeId) return;
    setForm((s) => ({
      ...s,
      assignedEmployeeIds: [
        ...s.assignedEmployeeIds,
        {
          ...empItem,
          perHour: Number(empItem.perHour || 0),
          empHours: Number(empItem.empHours || 0),
          empAmount:
            Number(empItem.perHour || 0) * Number(empItem.empHours || 0),
        },
      ],
    }));
    setEmpItem({ employeeId: "", employeeName: "", perHour: "", empHours: "" });
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      await load();
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
    if (!confirm("Delete project?")) return;
    await api.delete(`/projects/${projectId}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Projects</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <form
        onSubmit={create}
        className="p-4 rounded-2xl border bg-white space-y-4"
      >
        <div className="grid sm:grid-cols-3 gap-4">
          <Input
            label="Job Name"
            value={form.job_name}
            onChange={(v) => setForm((s) => ({ ...s, job_name: v }))}
          />
          <Input
            label="Customer Code or ID"
            value={form.customerIdOrCode}
            onChange={(v) => setForm((s) => ({ ...s, customerIdOrCode: v }))}
          />
          <Input
            label="Manager (userId)"
            value={form.managerId}
            onChange={(v) => setForm((s) => ({ ...s, managerId: v }))}
          />
        </div>
        <div className="p-3 rounded-xl border bg-gray-50 space-y-3">
          <p className="font-medium">Assign Employees</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <Input
              label="Employee ID"
              value={empItem.employeeId}
              onChange={(v) => setEmpItem((s) => ({ ...s, employeeId: v }))}
            />
            <Input
              label="Name"
              value={empItem.employeeName}
              onChange={(v) => setEmpItem((s) => ({ ...s, employeeName: v }))}
            />
            <Input
              label="Per Hour"
              type="number"
              value={empItem.perHour}
              onChange={(v) => setEmpItem((s) => ({ ...s, perHour: v }))}
            />
            <Input
              label="Hours"
              type="number"
              value={empItem.empHours}
              onChange={(v) => setEmpItem((s) => ({ ...s, empHours: v }))}
            />
          </div>
          <button
            type="button"
            onClick={addEmp}
            className="px-3 py-1.5 rounded-lg border"
          >
            Add Employee
          </button>
          {form.assignedEmployeeIds.length > 0 && (
            <ul className="text-sm text-gray-700 list-disc pl-5">
              {form.assignedEmployeeIds.map((e, i) => (
                <li key={i}>
                  {e.employeeName} • {e.empHours}h × {e.perHour} = {e.empAmount}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="px-4 py-2 rounded-lg bg-black text-white">
          Create Project
        </button>
      </form>

      <div className="grid gap-3">
        {list.map((p) => (
          <div
            key={p.projectId}
            className="p-4 rounded-2xl border bg-white flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{p.job_name}</p>
              <p className="text-sm text-gray-500">
                {p?.Pro_code?.code} • {p.status}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/projects/${p.projectId}`}
                className="px-3 py-1.5 rounded-lg border"
              >
                Edit
              </Link>
              <button
                onClick={() => del(p.projectId)}
                className="px-3 py-1.5 rounded-lg border"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-600">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg border"
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
