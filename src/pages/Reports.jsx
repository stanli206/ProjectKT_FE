import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

export default function Reports() {
  const [type, setType] = useState("employee");
  const [employeeId, setEmployeeId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [month, setMonth] = useState(""); // e.g., 2025-08
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const run = async (e) => {
    e?.preventDefault();
    setErr(""); setData(null);
    try {
      let res;
      if (type==="employee") res = await api.get("/reports/employee", { params:{ employeeId }});
      else if (type==="project") res = await api.get("/reports/project", { params:{ projectId }});
      else res = await api.get("/reports/monthly", { params:{ month }});
      setData(res.data);
    } catch (e) { setErr(e?.response?.data?.message || "Report failed"); }
  };

  const csv = useMemo(()=>{
    if (!data) return "";
    const rows = Array.isArray(data) ? data : [data];
    const keys = Object.keys(rows[0] || {});
    const header = keys.join(",");
    const lines = rows.map(r=>keys.map(k=>JSON.stringify(r[k] ?? "")).join(","));
    return [header, ...lines].join("\n");
  }, [data]);

  const downloadCSV = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(()=>{ setData(null); }, [type]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <form onSubmit={run} className="p-4 rounded-2xl border bg-white grid sm:grid-cols-4 gap-3">
        <label className="text-sm">
          <span className="block text-gray-600">Type</span>
          <select className="mt-1 px-3 py-2 rounded-lg border" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="employee">By Employee</option>
            <option value="project">By Project</option>
            <option value="monthly">Monthly/Custom</option>
          </select>
        </label>

        {type==="employee" && <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} />}
        {type==="project" && <Field label="Project ID" value={projectId} onChange={setProjectId} />}
        {type==="monthly" && (
          <label className="text-sm">
            <span className="block text-gray-600">Month (YYYY-MM)</span>
            <input className="mt-1 px-3 py-2 rounded-lg border" value={month} onChange={(e)=>setMonth(e.target.value)} placeholder="2025-08" />
          </label>
        )}

        <button className="px-4 py-2 rounded-lg bg-black text-white">Run</button>
      </form>

      {data && (
        <div className="p-4 rounded-2xl border bg-white space-y-3">
          <pre className="text-xs bg-gray-50 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
          {csv && <button onClick={downloadCSV} className="px-4 py-2 rounded-lg border">Download CSV</button>}
        </div>
      )}
    </div>
  );
}
function Field({ label, value, onChange }) {
  return (
    <label className="text-sm">
      <span className="block text-gray-600">{label}</span>
      <input className="mt-1 px-3 py-2 rounded-lg border" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}
