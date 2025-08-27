// import { useEffect, useState } from "react";
// import api from "../utils/api";
// import { Link } from "react-router-dom";

// export default function AdminDashboard() {
//   const [data, setData] = useState(null);
//   const [err, setErr] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const { data } = await api.get("/dashboard");
//         setData(data);
//       } catch (e) {
//         setErr(e?.response?.data?.message || "Failed to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   if (loading) return <PageTitle>Loading…</PageTitle>;

//   return (
//     <div className="space-y-6">
//       <PageTitle>Admin Dashboard</PageTitle>
//       {err && <p className="text-red-600 text-sm">{err}</p>}

//       {/* Overview cards */}
//       <div className="grid sm:grid-cols-3 gap-4">
//         <Card title="Employees" value={data?.overview?.totalEmployees ?? 0} />
//         <Card title="Projects" value={data?.overview?.totalProjects ?? 0} />
//         <Card
//           title="Timesheets (This Week)"
//           value={data?.overview?.timesheetsThisWeek ?? 0}
//         />
//       </div>

//       {/* By Status section */}
//       <div className="grid md:grid-cols-2 gap-4">
//         <Panel title="Projects — By Status">
//           <div className="grid grid-cols-3 gap-3">
//             <MiniStat
//               label="Open"
//               value={data?.byStatus?.projects?.open ?? 0}
//               tone="blue"
//             />
//             <MiniStat
//               label="In-progress"
//               value={data?.byStatus?.projects?.inProgress ?? 0}
//               tone="amber"
//             />
//             <MiniStat
//               label="Completed"
//               value={data?.byStatus?.projects?.done ?? 0}
//               tone="green"
//             />
//           </div>
//         </Panel>

//         <Panel title="Timesheets — By Status">
//           <div className="grid grid-cols-3 gap-3">
//             <MiniStat
//               label="Submitted"
//               value={data?.byStatus?.timesheets?.submitted ?? 0}
//               tone="indigo"
//             />
//             <MiniStat
//               label="Approved"
//               value={data?.byStatus?.timesheets?.approved ?? 0}
//               tone="emerald"
//             />
//             <MiniStat
//               label="Rejected"
//               value={data?.byStatus?.timesheets?.rejected ?? 0}
//               tone="rose"
//             />
//           </div>
//         </Panel>
//       </div>

//       {/* Quick actions */}
//       <div className="flex flex-wrap gap-3">
//         <Link
//           to="/projects"
//           className="px-4 py-2 rounded-xl shadow-md bg-black text-white"
//         >
//           Manage Projects
//         </Link>
//         <Link
//           to="/timesheet"
//           className="px-4 py-2 rounded-xl shadow-md bg-white"
//         >
//           Open Timesheet
//         </Link>
//         <Link
//           to="/approvals"
//           className="px-4 py-2 rounded-xl shadow-md bg-white"
//         >
//           Approvals
//         </Link>
//         <Link to="/reports" className="px-4 py-2 rounded-xl shadow-md bg-white">
//           View Reports
//         </Link>
//       </div>
//     </div>
//   );
// }

// function PageTitle({ children }) {
//   return <h1 className="text-2xl font-semibold">{children}</h1>;
// }

// function Card({ title, value }) {
//   return (
//     <div className="p-4 rounded-2xl shadow-md bg-white">
//       <p className="text-sm text-gray-500">{title}</p>
//       <p className="text-3xl font-semibold mt-1">{value}</p>
//     </div>
//   );
// }

// function Panel({ title, children }) {
//   return (
//     <div className="p-4 rounded-2xl shadow-md bg-white">
//       <div className="mb-3">
//         <p className="font-medium">{title}</p>
//       </div>
//       {children}
//     </div>
//   );
// }

// function MiniStat({ label, value, tone = "gray" }) {
//   const tones = {
//     blue: "bg-blue-50 text-blue-700",
//     amber: "bg-amber-50 text-amber-700",
//     green: "bg-green-50 text-green-700",
//     indigo: "bg-indigo-50 text-indigo-700",
//     emerald: "bg-emerald-50 text-emerald-700",
//     rose: "bg-rose-50 text-rose-700",
//     gray: "bg-gray-50 text-gray-700",
//   };
//   return (
//     <div className={`p-3 rounded-xl shadow-sm bg-white`}>
//       <div
//         className={`inline-block px-2 py-0.5 rounded-lg text-xs ${
//           tones[tone] || tones.gray
//         }`}
//       >
//         {label}
//       </div>
//       <div className="mt-2 text-2xl font-semibold">{value}</div>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

/* ---------------- Small utils ---------------- */
const makeCSV = (rows = []) => {
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
};
const downloadCSV = (csv, name) => {
  if (!csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

/* ---------------- Page ---------------- */

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Projects modal state
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projLoading, setProjLoading] = useState(false);
  const [projErr, setProjErr] = useState("");

  // Employees modal state
  const [showEmployees, setShowEmployees] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empErr, setEmpErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/dashboard");
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openProjects = async () => {
    setShowProjects(true);
    setProjLoading(true);
    setProjErr("");
    try {
      const { data } = await api.get("/projects", {
        params: { includeEmployees: 1 },
      });
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setProjErr(e?.response?.data?.message || "Failed to load projects");
    } finally {
      setProjLoading(false);
    }
  };

  const openEmployees = async () => {
    setShowEmployees(true);
    setEmpLoading(true);
    setEmpErr("");
    try {
      const { data } = await api.get("/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmpErr(e?.response?.data?.message || "Failed to load employees");
    } finally {
      setEmpLoading(false);
    }
  };

  if (loading) return <PageTitle>Loading…</PageTitle>;

  return (
    <div className="space-y-6">
      <PageTitle>Admin Dashboard</PageTitle>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      {/* Overview cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card
          title="Employees"
          value={data?.overview?.totalEmployees ?? 0}
          onClick={openEmployees}
          clickable
        />
        <Card
          title="Projects"
          value={data?.overview?.totalProjects ?? 0}
          onClick={openProjects}
          clickable
        />
        <Card
          title="Timesheets (This Week)"
          value={data?.overview?.timesheetsThisWeek ?? 0}
        />
      </div>

      {/* By Status section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Panel title="Projects — By Status">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              label="Open"
              value={data?.byStatus?.projects?.open ?? 0}
              tone="blue"
            />
            <MiniStat
              label="In-progress"
              value={data?.byStatus?.projects?.inProgress ?? 0}
              tone="amber"
            />
            <MiniStat
              label="Completed"
              value={data?.byStatus?.projects?.done ?? 0}
              tone="green"
            />
          </div>
        </Panel>

        <Panel title="Timesheets — By Status">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              label="Submitted"
              value={data?.byStatus?.timesheets?.submitted ?? 0}
              tone="indigo"
            />
            <MiniStat
              label="Approved"
              value={data?.byStatus?.timesheets?.approved ?? 0}
              tone="emerald"
            />
            <MiniStat
              label="Rejected"
              value={data?.byStatus?.timesheets?.rejected ?? 0}
              tone="rose"
            />
          </div>
        </Panel>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/projects"
          className="px-4 py-2 rounded-xl shadow-md bg-black text-white"
        >
          Manage Projects
        </Link>
        <Link
          to="/timesheet"
          className="px-4 py-2 rounded-xl shadow-md bg-white"
        >
          Open Timesheet
        </Link>
        <Link
          to="/approvals"
          className="px-4 py-2 rounded-xl shadow-md bg-white"
        >
          Approvals
        </Link>
        <Link to="/reports" className="px-4 py-2 rounded-xl shadow-md bg-white">
          View Reports
        </Link>
      </div>

      {/* ------------ Projects Modal ------------ */}
      {showProjects && (
        <Modal
          onClose={() => setShowProjects(false)}
          title="All Projects & Assigned Employees"
        >
          {projLoading && (
            <p className="text-sm text-gray-500">Loading projects…</p>
          )}
          {projErr && <p className="text-sm text-red-600">{projErr}</p>}
          {!projLoading && !projErr && <ProjectsModalContent rows={projects} />}
        </Modal>
      )}

      {/* ------------ Employees Modal ------------ */}
      {showEmployees && (
        <Modal onClose={() => setShowEmployees(false)} title="All Employees">
          {empLoading && (
            <p className="text-sm text-gray-500">Loading employees…</p>
          )}
          {empErr && <p className="text-sm text-red-600">{empErr}</p>}
          {!empLoading && !empErr && <EmployeesModalContent rows={employees} />}
        </Modal>
      )}
    </div>
  );
}

/* ---------------- Modal Contents (Improved UI) ---------------- */

function ProjectsModalContent({ rows }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((p) => {
      const name = (p.job_name || p.projectName || "").toLowerCase();
      const code = (p?.Pro_code?.code || p.projectCode || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const empArr = Array.isArray(p.employees)
        ? p.employees
        : Array.isArray(p.assignedEmployeeIds)
        ? p.assignedEmployeeIds
        : [];
      const empStr = empArr
        .map((e) => e.employeeName || e.name || e.employeeId)
        .join(" ")
        .toLowerCase();
      return (
        name.includes(s) ||
        code.includes(s) ||
        status.includes(s) ||
        empStr.includes(s)
      );
    });
  }, [q, rows]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  const csv = useMemo(
    () =>
      makeCSV(
        filtered.map((p) => ({
          projectId: p.projectId,
          name: p.job_name || p.projectName,
          code: p?.Pro_code?.code || p.projectCode || "",
          status: p.status || "",
          employees: (Array.isArray(p.employees)
            ? p.employees
            : p.assignedEmployeeIds || []
          )
            .map((e) => e.employeeName || e.name || e.employeeId)
            .join("; "),
        }))
      ),
    [filtered]
  );

  return (
    <div className="space-y-3">
      <Toolbar
        placeholder="Search projects, codes, status, employees…"
        value={q}
        onChange={setQ}
        count={total}
        onDownload={() => downloadCSV(csv, "projects.csv")}
      />

      {total === 0 ? (
        <Empty text="No projects found." />
      ) : (
        <>
          <div className="overflow-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left">
                  <Th>Project</Th>
                  <Th>Code</Th>
                  <Th>Status</Th>
                  <Th>Employees</Th>
                </tr>
              </thead>
              <tbody>
                {slice.map((p) => {
                  const empArr = Array.isArray(p.employees)
                    ? p.employees
                    : Array.isArray(p.assignedEmployeeIds)
                    ? p.assignedEmployeeIds
                    : [];
                  const employeeNames = empArr
                    .map((e) => e.employeeName || e.name || e.employeeId)
                    .join(", ");
                  return (
                    <tr key={p.projectId} className="border-t hover:bg-gray-50">
                      <Td>
                        <button
                          className="text-indigo-600 hover:underline"
                          onClick={() => navigate(`/projects/${p.projectId}`)}
                          title="Open project"
                        >
                          {p.job_name || p.projectName}
                        </button>
                      </Td>
                      <Td>{p?.Pro_code?.code || "-"}</Td>
                      <Td>{p.status || "-"}</Td>
                      <Td>
                        {employeeNames || (
                          <span className="text-gray-500">No employees</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pager
            page={current}
            pages={pages}
            onPrev={() => setPage(Math.max(1, current - 1))}
            onNext={() => setPage(Math.min(pages, current + 1))}
          />
        </>
      )}
    </div>
  );
}

function EmployeesModalContent({ rows }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((e) => {
      const name = (e.name || "").toLowerCase();
      const email = (e.personalEmail || e.companyEmail || "").toLowerCase();
      const desig = (e.designation || "").toLowerCase();
      const cat = (e.Em_category || "").toLowerCase();
      return (
        name.includes(s) ||
        email.includes(s) ||
        desig.includes(s) ||
        cat.includes(s)
      );
    });
  }, [q, rows]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  const csv = useMemo(
    () =>
      makeCSV(
        filtered.map((e) => ({
          employeeId: e.employeeId,
          name: e.name,
          email: e.personalEmail || e.companyEmail || "",
          designation: e.designation || "",
          category: e.Em_category || "",
          perHoursCharge: e.perHoursCharge ?? "",
        }))
      ),
    [filtered]
  );

  return (
    <div className="space-y-3">
      <Toolbar
        placeholder="Search name, email, designation, category…"
        value={q}
        onChange={setQ}
        count={total}
        onDownload={() => downloadCSV(csv, "employees.csv")}
      />

      {total === 0 ? (
        <Empty text="No employees found." />
      ) : (
        <>
          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Designation</Th>
                  <Th>Category</Th>
                  <Th>Charge/hr</Th>
                </tr>
              </thead>
              <tbody>
                {slice.map((e) => (
                  <tr key={e.employeeId} className="border-t hover:bg-gray-50">
                    <Td>
                      <button
                        className="text-indigo-600 hover:underline"
                        onClick={() => navigate(`/employees#${e.employeeId}`)}
                        title="Open profile"
                      >
                        {e.name}
                      </button>
                    </Td>
                    <Td>{e.personalEmail || e.companyEmail}</Td>
                    <Td>{e.designation}</Td>
                    <Td>{e.Em_category}</Td>
                    <Td>{e.perHoursCharge}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pager
            page={current}
            pages={pages}
            onPrev={() => setPage(Math.max(1, current - 1))}
            onNext={() => setPage(Math.min(pages, current + 1))}
          />
        </>
      )}
    </div>
  );
}

/* ---------------- Reusable modal helpers ---------------- */

function Toolbar({ placeholder, value, onChange, count, onDownload }) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <input
          className="px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 min-w-[220px]"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-xs text-gray-500">
          Total: <b>{count}</b>
        </span>
      </div>
      <button
        onClick={onDownload}
        className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow text-sm"
      >
        Download CSV
      </button>
    </div>
  );
}

function Pager({ page, pages, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between text-sm mt-3">
      <span className="text-gray-500">
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow disabled:opacity-50"
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          onClick={onNext}
          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow disabled:opacity-50"
          disabled={page >= pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
      {text}
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function PageTitle({ children }) {
  return <h1 className="text-2xl font-semibold">{children}</h1>;
}

function Card({ title, value, onClick, clickable = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-2xl shadow-md bg-white text-left transition ${
        clickable
          ? "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          : ""
      }`}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
      {clickable && (
        <p className="text-xs text-indigo-600 mt-1">Click to view</p>
      )}
    </button>
  );
}

function Panel({ title, children }) {
  return (
    <div className="p-4 rounded-2xl shadow-md bg-white">
      <div className="mb-3">
        <p className="font-medium">{title}</p>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value, tone = "gray" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    gray: "bg-gray-50 text-gray-700",
  };
  return (
    <div className="p-3 rounded-xl shadow-sm bg-white">
      <div
        className={`inline-block px-2 py-0.5 rounded-lg text-xs ${
          tones[tone] || tones.gray
        }`}
      >
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="py-2 px-3 font-medium text-gray-700">{children}</th>;
}
function Td({ children }) {
  return <td className="py-2 px-3">{children}</td>;
}

/* ---------------- Modal Shell ---------------- */

function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-xs text-gray-500">Press Esc to close</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
            title="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
        <div className="p-4 border-t bg-white sticky bottom-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
