import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Customers() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ Cust_name:"", Cust_address:"" });

  const load = async () => {
    try { const { data } = await api.get("/customers"); setList(data); }
    catch(e){ setErr(e?.response?.data?.message || "Load failed"); }
  };
  useEffect(()=>{ load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try { await api.post("/customers", form); setForm({Cust_name:"", Cust_address:""}); load(); }
    catch(e){ setErr(e?.response?.data?.message || "Create failed"); }
  };
  const update = async (id) => {
    const name = prompt("New name");
    if (!name) return;
    await api.put(`/customers/${id}`, { Cust_name: name });
    load();
  };
  const del = async (id) => {
    if (!confirm("Delete customer?")) return;
    await api.delete(`/customers/${id}`); load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}

      <form onSubmit={create} className="p-4 rounded-2xl border bg-white grid sm:grid-cols-3 gap-3">
        <Field label="Name" value={form.Cust_name} onChange={(v)=>setForm(s=>({...s,Cust_name:v}))}/>
        <Field label="Address" value={form.Cust_address} onChange={(v)=>setForm(s=>({...s,Cust_address:v}))}/>
        <button className="px-4 py-2 rounded-lg bg-black text-white">Create</button>
      </form>

      <div className="overflow-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="text-left border-b">
            <th className="py-2 pr-4">Code</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Address</th><th className="py-2 pr-4">Actions</th></tr></thead>
          <tbody>
            {list.map(c=>(
              <tr key={c.Customer_id} className="border-b">
                <td className="py-2 pr-4">{c.Cust_code}</td>
                <td className="py-2 pr-4">{c.Cust_name}</td>
                <td className="py-2 pr-4">{c.Cust_address}</td>
                <td className="py-2 pr-4 flex gap-2">
                  <button onClick={()=>update(c.Customer_id)} className="px-3 py-1.5 rounded-lg border">Edit</button>
                  <button onClick={()=>del(c.Customer_id)} className="px-3 py-1.5 rounded-lg border">Delete</button>
                </td>
              </tr>
            ))}
            {list.length===0 && <tr><td className="py-3 text-gray-500" colSpan="4">No customers.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function Field({ label, value, onChange }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-600">{label}</span>
      <input className="mt-1 w-full px-3 py-2 rounded-lg border" value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}
