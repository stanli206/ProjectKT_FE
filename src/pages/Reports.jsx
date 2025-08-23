import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";


function makeCSV(rows = []) {
  if (!rows?.length) return "";
  const keys = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r || {}).forEach((k) => s.add(k));
      return s;
    }, new Set())
  );
  const header = keys.join(",");
  const lines = rows.map((r) =>
    keys.map((k) => JSON.stringify(r?.[k] ?? "")).join(",")
  );
  return [header, ...lines].join("\n");
}

function toCSV(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean).join(",") : "";
}

function download(csv, name) {
  if (!csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- Page ---------------- */

export default function Reports() {
  const { user } = useAuth();
  const role = user?.role;
  const isAdmin = role === "Admin";
  const isPrincipal = role === "Principal";
  const canView = isAdmin || isPrincipal;
  const canExport = isAdmin; // Principal read-only → no CSV

  // TYPE
  const [type, setType] = useState("employees"); // employees | projects | monthly | custom

  // Options for dropdowns
  const [empOptions, setEmpOptions] = useState([]); // [{value,label}]
  const [projOptions, setProjOptions] = useState([]); // [{value,label}]
  const timesheetStatusOptions = useMemo(
    () => ["Submitted", "Approved", "Rejected"],
    []
  );
  const projectStatusOptions = useMemo(
    () => ["Open", "In-progress", "Completed"],
    []
  );

  // Selected values (arrays for multi)
  const [employeeIds, setEmployeeIds] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [timesheetStatus, setTimesheetStatus] = useState([]);
  const [projectStatus, setProjectStatus] = useState([]);

  // Date filters
  const [month, setMonth] = useState(""); // YYYY-MM
  const [from, setFrom] = useState(""); // YYYY-MM-DD
  const [to, setTo] = useState(""); // YYYY-MM-DD

  // Data state
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // UI toggles
  const [showRaw, setShowRaw] = useState(false);

  // 🚫 If no access, show friendly 403
  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="mt-4 p-5 rounded-2xl bg-white shadow-sm border">
          <p className="text-gray-700 font-medium">Access denied</p>
          <p className="text-sm text-gray-600 mt-1">
            This module is available only to <b>Admin</b> and <b>Principal</b>{" "}
            roles.
          </p>
        </div>
      </div>
    );
  }

  // Load dropdown options (employees, projects)
  useEffect(() => {
    (async () => {
      try {
        const [{ data: emps }, { data: projs }] = await Promise.all([
          api.get("/employees"),
          api.get("/projects"),
        ]);
        setEmpOptions(
          (emps || []).map((e) => ({
            value: e.employeeId,
            label: `${e.name} (${e.employeeId})`,
          }))
        );
        setProjOptions(
          (projs || []).map((p) => ({
            value: p.projectId,
            label: `${p.job_name} (${p?.Pro_code?.code || p.projectId})`,
          }))
        );
      } catch (e) {
        console.error("Dropdown load failed", e?.response?.data || e.message);
      }
    })();
  }, []);

  // Clear result when type changes
  useEffect(() => {
    setData(null);
    setErr("");
  }, [type]);

  // RUN
  const run = async (e) => {
    e?.preventDefault();
    setErr("");
    setData(null);
    setLoading(true);

    const p = {};
    if (employeeIds.length) p.employeeIds = toCSV(employeeIds);
    if (projectIds.length) p.projectIds = toCSV(projectIds);
    if (timesheetStatus.length) p.timesheetStatus = toCSV(timesheetStatus);
    if (projectStatus.length) p.projectStatus = toCSV(projectStatus);

    try {
      let res;
      if (type === "employees") {
        if (!employeeIds.length)
          throw new Error("Please select at least one employee.");
        res = await api.get("/reports/by-employees", { params: p });
      } else if (type === "projects") {
        res = await api.get("/reports/by-projects", { params: p });
      } else if (type === "monthly") {
        if (!month) throw new Error("Please pick a month (YYYY-MM).");
        res = await api.get("/reports/monthly", { params: { ...p, month } });
      } else {
        if (!from || !to) throw new Error("Please set From and To dates.");
        res = await api.get("/reports/custom", { params: { ...p, from, to } });
      }
      setData(res.data);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Report failed");
    } finally {
      setLoading(false);
    }
  };

  // CSVs for the sections found in sample payload
  const csvFilters = useMemo(
    () => (data?.filters ? makeCSV([data.filters]) : ""),
    [data]
  );
  const csvCountByStatus = useMemo(
    () =>
      Array.isArray(data?.countByStatus) ? makeCSV(data.countByStatus) : "",
    [data]
  );
  const csvPerEmployee = useMemo(
    () => (Array.isArray(data?.perEmployee) ? makeCSV(data.perEmployee) : ""),
    [data]
  );
  const csvProjects = useMemo(
    () =>
      Array.isArray(data?.projects)
        ? makeCSV(
            data.projects.map((p) => ({
              projectId: p.projectId,
              job_name: p.job_name,
              status: p.status,
              employees: (p.employees || [])
                .map((e) => e.employeeName)
                .join("; "),
            }))
          )
        : "",
    [data]
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEmployeeIds([]);
              setProjectIds([]);
              setTimesheetStatus([]);
              setProjectStatus([]);
              setMonth("");
              setFrom("");
              setTo("");
              setData(null);
              setErr("");
              setShowRaw(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow text-sm"
          >
            Reset Filters
          </button>
          {/* role hint */}
          <span className="text-xs text-gray-500">
            Role: <b>{role}</b> {isAdmin ? "(Full access)" : "(Read only)"}
          </span>
        </div>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      {/* Filters Card */}
      <form
        onSubmit={run}
        className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
      >
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-4">
          {/* Report type */}
          <Field label="Report Type">
            <select
              className="mt-1 px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="employees">By Employees</option>
              <option value="projects">By Projects</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Range</option>
            </select>
          </Field>

          {/* Employee multi select */}
          {(type === "employees" ||
            type === "monthly" ||
            type === "custom") && (
            <MultiSelect
              label="Employees"
              options={empOptions}
              values={employeeIds}
              setValues={setEmployeeIds}
              placeholder="Pick employees"
            />
          )}

          {/* Project multi select */}
          {(type === "projects" || type === "monthly" || type === "custom") && (
            <MultiSelect
              label="Projects"
              options={projOptions}
              values={projectIds}
              setValues={setProjectIds}
              placeholder="Pick projects"
            />
          )}

          {/* Month OR From/To */}
          {type === "monthly" && (
            <Field label="Month (YYYY-MM)">
              <input
                type="month"
                className="mt-1 px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </Field>
          )}

          {type === "custom" && (
            <>
              <Field label="From (date)">
                <input
                  type="date"
                  className="mt-1 px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Field>
              <Field label="To (date)">
                <input
                  type="date"
                  className="mt-1 px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 w-full"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </Field>
            </>
          )}

          {(type === "monthly" || type === "custom") && (
            <>
              <MultiSelect
                label="Timesheet Status"
                options={timesheetStatusOptions.map((s) => ({
                  value: s,
                  label: s,
                }))}
                values={timesheetStatus}
                setValues={setTimesheetStatus}
                placeholder="Select TS status"
              />
              <MultiSelect
                label="Project Status"
                options={projectStatusOptions.map((s) => ({
                  value: s,
                  label: s,
                }))}
                values={projectStatus}
                setValues={setProjectStatus}
                placeholder="Select Project status"
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Running..." : "Run Report"}
          </button>
          {data && (
            <span className="text-sm text-gray-600">Results updated</span>
          )}
        </div>
      </form>

      {/* Results */}
      {data && (
        <div className="space-y-6">
          {/* Overview */}
          {(data.totalProjectsWorked != null ||
            data.totalEmployeesInvolved != null) && (
            <Card title="Overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Stat
                  label="Total Projects Worked"
                  value={data.totalProjectsWorked ?? 0}
                />
                <Stat
                  label="Total Employees Involved"
                  value={data.totalEmployeesInvolved ?? 0}
                />
              </div>
            </Card>
          )}

          {/* Count by Status */}
          {Array.isArray(data.countByStatus) &&
            data.countByStatus.length > 0 && (
              <Card
                title="Projects — Count by Status"
                actions={
                  canExport && csvCountByStatus ? (
                    <Download
                      onClick={() =>
                        download(
                          csvCountByStatus,
                          `${type}-count-by-status.csv`
                        )
                      }
                    />
                  ) : null
                }
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {data.countByStatus.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm text-sm"
                    >
                      <b>{s.status}</b>{" "}
                      <span className="text-gray-500">({s.count})</span>
                    </span>
                  ))}
                </div>
                <Table
                  rows={data.countByStatus}
                  columns={[
                    { key: "status", label: "Status" },
                    { key: "count", label: "Count" },
                  ]}
                />
              </Card>
            )}

          {/* Per Employee */}
          {Array.isArray(data.perEmployee) && data.perEmployee.length > 0 && (
            <Card
              title="Per Employee"
              actions={
                canExport && csvPerEmployee ? (
                  <Download
                    onClick={() =>
                      download(csvPerEmployee, `${type}-per-employee.csv`)
                    }
                  />
                ) : null
              }
            >
              <Table
                rows={data.perEmployee}
                columns={[
                  { key: "employeeId", label: "Employee ID" },
                  { key: "employeeName", label: "Employee Name" },
                  { key: "projectsCount", label: "Projects Count" },
                ]}
              />
            </Card>
          )}

          {/* Projects table */}
          {Array.isArray(data.projects) && data.projects.length > 0 && (
            <Card
              title="Projects"
              actions={
                canExport && csvProjects ? (
                  <Download
                    onClick={() =>
                      download(csvProjects, `${type}-projects.csv`)
                    }
                  />
                ) : null
              }
            >
              <div className="overflow-auto">
                <table className="min-w-[700px] w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 px-2 border-b">Project ID</th>
                      <th className="py-2 px-2 border-b">Name</th>
                      <th className="py-2 px-2 border-b">Status</th>
                      <th className="py-2 px-2 border-b">Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projects.map((p, i) => (
                      <tr
                        key={p.projectId || i}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-2 px-2">{p.projectId}</td>
                        <td className="py-2 px-2">{p.job_name}</td>
                        <td className="py-2 px-2">{p.status}</td>
                        <td className="py-2 px-2">
                          {(p.employees || [])
                            .map((e) => e.employeeName)
                            .join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Raw JSON (toggle) */}
          <Card
            title="Raw JSON"
            actions={
              <button
                onClick={() => setShowRaw((s) => !s)}
                className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow text-sm"
              >
                {showRaw ? "Hide" : "Show"}
              </button>
            }
          >
            {showRaw ? (
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">
                Hidden — click “Show” to view raw data.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

/* ---------------- Simple UI primitives ---------------- */

function Field({ label, children }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Card({ title, children, actions = null }) {
  return (
    <div className="p-5 rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Download({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow text-sm"
    >
      Download CSV
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 rounded-xl bg-white shadow-sm text-center">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Table({ rows, columns }) {
  if (!rows?.length) return <p className="text-sm text-gray-500">No data</p>;
  return (
    <div className="overflow-auto">
      <table className="min-w-[500px] w-full text-sm">
        <thead>
          <tr className="text-left">
            {columns.map((c) => (
              <th key={c.key} className="py-2 px-2 border-b">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="py-2 px-2">
                  {String(r?.[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- MultiSelect (checkbox dropdown) ---------------- */

function MultiSelect({
  label,
  options = [],
  values = [],
  setValues,
  placeholder = "Select...",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return options;
    const s = q.toLowerCase();
    return options.filter((o) =>
      (o.label || o.value)?.toLowerCase().includes(s)
    );
  }, [q, options]);

  const toggle = (val) => {
    if (values.includes(val)) {
      setValues(values.filter((v) => v !== val));
    } else {
      setValues([...values, val]);
    }
  };

  const allVisibleValues = filtered.map((o) => o.value);
  const allSelectedVisible =
    allVisibleValues.length > 0 &&
    allVisibleValues.every((v) => values.includes(v));

  const selectAllVisible = () => {
    const merged = Array.from(new Set([...values, ...allVisibleValues]));
    setValues(merged);
  };
  const clearVisible = () => {
    setValues(values.filter((v) => !allVisibleValues.includes(v)));
  };

  return (
    <div className="text-sm relative">
      <span className="block text-gray-700">{label}</span>

      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full text-left px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {values.length ? (
          `${values.length} selected`
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl bg-white shadow-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              className="flex-1 px-3 py-2 rounded-lg border"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="button"
              className="px-2 py-1 rounded-lg bg-gray-100"
              onClick={() => setQ("")}
              title="Clear"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-500">
              {filtered.length} options
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={allSelectedVisible ? clearVisible : selectAllVisible}
                className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs"
              >
                {allSelectedVisible ? "Unselect visible" : "Select visible"}
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-auto pr-1">
            {filtered.map((o) => (
              <label key={o.value} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={values.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                <span className="truncate">{o.label || o.value}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-gray-500">No options</p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Selected chips */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.slice(0, 4).map((v) => {
            const item = options.find((o) => o.value === v);
            const label = item?.label || v;
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white shadow-sm"
              >
                {label}
                <button
                  className="text-gray-500"
                  onClick={() => toggle(v)}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            );
          })}
          {values.length > 4 && (
            <span className="text-xs text-gray-500 self-center">
              +{values.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
