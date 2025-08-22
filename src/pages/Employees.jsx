// import { useEffect, useState } from "react";
// import api from "../utils/api";

// export default function Employees() {
//   const [list, setList] = useState([]);
//   const [err, setErr] = useState("");
//   const [form, setForm] = useState({
//     name:"", personalEmail:"", designation:"", experienceYears:0,
//     perHoursCharge:0, personalMobile:""
//   });

//   const load = async () => {
//     try { const { data } = await api.get("/employees"); setList(data); }
//     catch(e){ setErr(e?.response?.data?.message || "Load failed"); }
//   };
//   useEffect(()=>{ load(); }, []);

//   const create = async (e) => {
//     e.preventDefault();
//     try { await api.post("/employees", form); setForm({name:"",personalEmail:"",designation:"",experienceYears:0,perHoursCharge:0,personalMobile:""}); load(); }
//     catch(e){ setErr(e?.response?.data?.message || "Create failed"); }
//   };
//   const update = async (employeeId, patch) => {
//     await api.put(`/employees/${employeeId}`, patch); load();
//   };
//   const del = async (employeeId) => {
//     if (!confirm("Delete employee?")) return;
//     await api.delete(`/employees/${employeeId}`); load();
//   };

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold">Employees</h1>
//       {err && <p className="text-red-600 text-sm">{err}</p>}

//       <form onSubmit={create} className="p-4 rounded-2xl border bg-white grid sm:grid-cols-3 gap-3">
//         <Field label="Name" value={form.name} onChange={(v)=>setForm(s=>({...s,name:v}))}/>
//         <Field label="Email" value={form.personalEmail} onChange={(v)=>setForm(s=>({...s,personalEmail:v}))}/>
//         <Field label="Designation" value={form.designation} onChange={(v)=>setForm(s=>({...s,designation:v}))}/>
//         <Field label="Experience (years)" type="number" value={form.experienceYears} onChange={(v)=>setForm(s=>({...s,experienceYears:+v}))}/>
//         <Field label="Per Hour Charge" type="number" value={form.perHoursCharge} onChange={(v)=>setForm(s=>({...s,perHoursCharge:+v}))}/>
//         <Field label="Mobile" value={form.personalMobile} onChange={(v)=>setForm(s=>({...s,personalMobile:v}))}/>
//         <button className="px-4 py-2 rounded-lg bg-black text-white">Create</button>
//       </form>

//       <div className="overflow-auto rounded-2xl border bg-white">
//         <table className="min-w-full text-sm">
//           <thead><tr className="text-left border-b">
//             <th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th>
//             <th className="py-2 pr-4">Designation</th><th className="py-2 pr-4">Charge</th>
//             <th className="py-2 pr-4">Actions</th></tr></thead>
//           <tbody>
//             {list.map(e=>(
//               <tr key={e.employeeId} className="border-b">
//                 <td className="py-2 pr-4">{e.name}</td>
//                 <td className="py-2 pr-4">{e.personalEmail}</td>
//                 <td className="py-2 pr-4">{e.designation}</td>
//                 <td className="py-2 pr-4">{e.perHoursCharge}</td>
//                 <td className="py-2 pr-4 flex gap-2">
//                   <button onClick={()=>update(e.employeeId,{designation: prompt("New designation", e.designation)||e.designation})} className="px-3 py-1.5 rounded-lg border">Edit</button>
//                   <button onClick={()=>del(e.employeeId)} className="px-3 py-1.5 rounded-lg border">Delete</button>
//                 </td>
//               </tr>
//             ))}
//             {list.length===0 && <tr><td className="py-3 text-gray-500" colSpan="5">No employees.</td></tr>}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
// function Field({ label, value, onChange, type="text" }) {
//   return (
//     <label className="text-sm w-full">
//       <span className="block text-gray-600">{label}</span>
//       <input className="mt-1 w-full px-3 py-2 rounded-lg border" value={value} type={type} onChange={(e)=>onChange(e.target.value)} />
//     </label>
//   );
// }
import { useEffect, useState } from "react";
import api from "../utils/api";
import RecordTracking from "../components/RecordTracking"; // 👈 ADD THIS

export default function Employees() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null); // 👈 ADD THIS
  const [form, setForm] = useState({
    name: "",
    personalEmail: "",
    designation: "",
    experienceYears: 0,
    perHoursCharge: 0,
    personalMobile: "",
  });

  const load = async () => {
    try {
      const { data } = await api.get("/employees");
      setList(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    }
  };
  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/employees", form);
      setForm({
        name: "",
        personalEmail: "",
        designation: "",
        experienceYears: 0,
        perHoursCharge: 0,
        personalMobile: "",
      });
      load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Create failed");
    }
  };
  const update = async (employeeId, patch) => {
    await api.put(`/employees/${employeeId}`, patch);
    // refresh & also refresh selected if same id
    await load();
    if (selectedEmployee?.employeeId === employeeId) {
      const fresh = list.find((x) => x.employeeId === employeeId);
      if (fresh) setSelectedEmployee(fresh);
    }
  };
  const del = async (employeeId) => {
    if (!confirm("Delete employee?")) return;
    await api.delete(`/employees/${employeeId}`);
    load();
    if (selectedEmployee?.employeeId === employeeId) setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Employees</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <form
        onSubmit={create}
        className="p-4 rounded-2xl border bg-white grid sm:grid-cols-3 gap-3"
      >
        <Field
          label="Name"
          value={form.name}
          onChange={(v) => setForm((s) => ({ ...s, name: v }))}
        />
        <Field
          label="Email"
          value={form.personalEmail}
          onChange={(v) => setForm((s) => ({ ...s, personalEmail: v }))}
        />
        <Field
          label="Designation"
          value={form.designation}
          onChange={(v) => setForm((s) => ({ ...s, designation: v }))}
        />
        <Field
          label="Experience (years)"
          type="number"
          value={form.experienceYears}
          onChange={(v) => setForm((s) => ({ ...s, experienceYears: +v }))}
        />
        <Field
          label="Per Hour Charge"
          type="number"
          value={form.perHoursCharge}
          onChange={(v) => setForm((s) => ({ ...s, perHoursCharge: +v }))}
        />
        <Field
          label="Mobile"
          value={form.personalMobile}
          onChange={(v) => setForm((s) => ({ ...s, personalMobile: v }))}
        />
        <button className="px-4 py-2 rounded-lg bg-black text-white">
          Create
        </button>
      </form>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Designation</th>
              <th className="py-2 pr-4">Charge</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.employeeId} className="border-b">
                <td className="py-2 pr-4">{e.name}</td>
                <td className="py-2 pr-4">{e.personalEmail}</td>
                <td className="py-2 pr-4">{e.designation}</td>
                <td className="py-2 pr-4">{e.perHoursCharge}</td>
                <td className="py-2 pr-4 flex gap-2">
                  <button
                    onClick={() =>
                      update(e.employeeId, {
                        designation:
                          prompt("New designation", e.designation) ||
                          e.designation,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg border"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setSelectedEmployee(e)} // 👈 VIEW button
                    className="px-3 py-1.5 rounded-lg border"
                  >
                    View
                  </button>
                  <button
                    onClick={() => del(e.employeeId)}
                    className="px-3 py-1.5 rounded-lg border"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className="py-3 text-gray-500" colSpan="5">
                  No employees.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 👇 Audit Log section — put it BELOW the table */}
      {selectedEmployee && (
        <div className="p-4 rounded-2xl border bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {selectedEmployee.name} — Audit Log
            </h2>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="px-3 py-1.5 rounded-lg border"
            >
              Close
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <p>
              ID: {selectedEmployee.employeeId} · Email:{" "}
              {selectedEmployee.personalEmail || "-"} · Designation:{" "}
              {selectedEmployee.designation || "-"}
            </p>
          </div>
          <RecordTracking logs={selectedEmployee.recordTracking} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
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
