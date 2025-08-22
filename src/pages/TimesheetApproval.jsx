import { useEffect, useState } from "react";
import api from "../utils/api";

export default function TimesheetApproval() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/timesheets");
      setList(data);
    } catch (e) { setErr(e?.response?.data?.message || "Load failed"); }
  };
  useEffect(()=>{ load(); }, []);

  const act = async (id, status) => {
    try {
      await api.post(`/timesheets/${id}/approve`, { status });
      load();
    } catch (e) { setErr(e?.response?.data?.message || "Action failed"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Timesheet Approvals</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b">
            <th className="py-2 pr-4">Project</th><th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Hours</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4">Actions</th></tr></thead>
          <tbody>
            {list.map(t=>(
              <tr key={t.timesheetId} className="border-b">
                <td className="py-2 pr-4">{t.Project_name}</td>
                <td className="py-2 pr-4">{t.date}</td>
                <td className="py-2 pr-4">{t.hours}</td>
                <td className="py-2 pr-4">{t.status}</td>
                <td className="py-2 pr-4 flex gap-2">
                  <button onClick={()=>act(t.timesheetId,"Approved")} className="px-3 py-1.5 rounded-lg border">Approve</button>
                  <button onClick={()=>act(t.timesheetId,"Rejected")} className="px-3 py-1.5 rounded-lg border">Reject</button>
                </td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="py-3 text-gray-500" colSpan="5">No entries.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
