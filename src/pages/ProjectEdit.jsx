import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ProjectEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [err, setErr] = useState("");
  const [empItem, setEmpItem] = useState({ employeeId:"", employeeName:"", perHour:"", empHours:"" });

  const load = async () => {
    try {
      const { data } = await api.get("/projects");
      const p = data.find(x=>x.projectId===id);
      if (!p) return setErr("Project not found");
      setProject(p);
    } catch (e) { setErr(e?.response?.data?.message || "Load failed"); }
  };
  useEffect(()=>{ load(); }, [id]);

  const addEmp = () => {
    if (!empItem.employeeId) return;
    setProject(s=>({
      ...s,
      assignedEmployeeIds: [...(s.assignedEmployeeIds||[]), {
        ...empItem, perHour:+empItem.perHour||0, empHours:+empItem.empHours||0,
        empAmount:(+empItem.perHour||0) * (+empItem.empHours||0)
      }]
    }));
    setEmpItem({ employeeId:"", employeeName:"", perHour:"", empHours:"" });
  };

  const removeEmp = (idx) => {
    setProject(s=>({ ...s, assignedEmployeeIds: s.assignedEmployeeIds.filter((_,i)=>i!==idx) }));
  };

  const save = async () => {
    try {
      await api.put(`/projects/${id}`, {
        status: project.status,
        assignedEmployeeIds: project.assignedEmployeeIds
      });
      alert("Saved"); nav("/projects");
    } catch (e) { setErr(e?.response?.data?.message || "Save failed"); }
  };

  if (!project) return <p>Loading...</p>;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Edit Project</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="p-4 rounded-2xl border bg-white space-y-3">
        <p className="font-medium">{project.job_name} <span className="text-gray-500">({project?.Pro_code?.code})</span></p>
        <label className="text-sm">
          <span className="block text-gray-600">Status</span>
          <select className="mt-1 px-3 py-2 rounded-lg border"
            value={project.status}
            onChange={(e)=>setProject(s=>({...s,status:e.target.value}))}>
            <option>Open</option>
            <option>In-progress</option>
            <option>Completed</option>
          </select>
        </label>

        <div className="p-3 rounded-xl border bg-gray-50 space-y-3">
          <p className="font-medium">Assigned Employees</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <Field label="Employee ID" value={empItem.employeeId} onChange={(v)=>setEmpItem(s=>({...s,employeeId:v}))}/>
            <Field label="Name" value={empItem.employeeName} onChange={(v)=>setEmpItem(s=>({...s,employeeName:v}))}/>
            <Field label="Per Hour" type="number" value={empItem.perHour} onChange={(v)=>setEmpItem(s=>({...s,perHour:v}))}/>
            <Field label="Hours" type="number" value={empItem.empHours} onChange={(v)=>setEmpItem(s=>({...s,empHours:v}))}/>
          </div>
          <button type="button" onClick={addEmp} className="px-3 py-1.5 rounded-lg border">Add</button>

          <ul className="text-sm text-gray-700 list-disc pl-5">
            {(project.assignedEmployeeIds||[]).map((e,i)=>(
              <li key={i} className="flex items-center gap-3">
                <span>{e.employeeName} • {e.empHours}h × {e.perHour} = {e.empAmount}</span>
                <button onClick={()=>removeEmp(i)} className="px-2 py-0.5 rounded bg-white border">x</button>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={save} className="px-4 py-2 rounded-lg bg-black text-white">Save Changes</button>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type="text" }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-600">{label}</span>
      <input className="mt-1 w-full px-3 py-2 rounded-lg border" value={value} type={type} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}
