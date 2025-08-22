import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/dashboard");
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load dashboard");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {!data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card title="Employees" value={data.overview.totalEmployees} />
            <Card title="Projects" value={data.overview.totalProjects} />
            <Card title="Timesheets (This Week)" value={data.overview.timesheetsThisWeek} />
          </div>
          <div className="flex gap-3">
            <Link to="/projects" className="px-4 py-2 rounded-lg bg-black text-white">Manage Projects</Link>
            <Link to="/timesheet" className="px-4 py-2 rounded-lg border">Open Timesheet</Link>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="p-4 rounded-2xl border bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
