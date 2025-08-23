import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <PageTitle>Loading…</PageTitle>;

  return (
    <div className="space-y-6">
      <PageTitle>Admin Dashboard</PageTitle>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      {/* Overview cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card title="Employees" value={data?.overview?.totalEmployees ?? 0} />
        <Card title="Projects" value={data?.overview?.totalProjects ?? 0} />
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
    </div>
  );
}

function PageTitle({ children }) {
  return <h1 className="text-2xl font-semibold">{children}</h1>;
}

function Card({ title, value }) {
  return (
    <div className="p-4 rounded-2xl shadow-md bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
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
    <div className={`p-3 rounded-xl shadow-sm bg-white`}>
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
