import { useEffect, useState } from "react";
import api from "../utils/api";

export default function EmployeeTimesheet() {
  const [projects, setProjects] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ projectId: "", date: "", hours: "" });
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.filter(p => p.status !== "Completed"));
      const ts = await api.get("/timesheets");
      setList(ts.data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/timesheets", { ...form, hours: Number(form.hours) });
      setForm({ projectId: "", date: "", hours: "" });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Submit failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Timesheet</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <form onSubmit={submit} className="p-4 rounded-2xl border bg-white grid sm:grid-cols-4 gap-3">
        <select
          className="px-3 py-2 rounded-lg border"
          value={form.projectId}
          onChange={(e)=>setForm((s)=>({...s, projectId: e.target.value}))}
        >
          <option value="">Select Project</option>
          {projects.map((p)=>(
            <option key={p.projectId} value={p.projectId}>{p.job_name} ({p?.Pro_code?.code})</option>
          ))}
        </select>
        <input type="date" className="px-3 py-2 rounded-lg border" value={form.date} onChange={(e)=>setForm((s)=>({...s, date: e.target.value}))}/>
        <input type="number" placeholder="Hours" className="px-3 py-2 rounded-lg border" value={form.hours} onChange={(e)=>setForm((s)=>({...s, hours: e.target.value}))}/>
        <button className="px-4 py-2 rounded-lg bg-black text-white">Add</button>
      </form>

      <div className="p-4 rounded-2xl border bg-white">
        <p className="font-medium mb-2">My Entries</p>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Hours</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t)=>(
                <tr key={t.timesheetId} className="border-b">
                  <td className="py-2 pr-4">{t.Project_name}</td>
                  <td className="py-2 pr-4">{t.date}</td>
                  <td className="py-2 pr-4">{t.hours}</td>
                  <td className="py-2 pr-4">{t.status}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td className="py-3 text-gray-500" colSpan="4">No entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
