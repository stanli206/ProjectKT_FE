import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Profile() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/users/profile/${user.userId}`);
        setData(data);
      } catch (e) { setErr(e?.response?.data?.message || "Failed to load"); }
    })();
  }, [user.userId]);

  const save = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");
    try {
      await api.put(`/users/profile/${user.userId}`, {
        userName: data.userName,
        ...(data.plainPassword ? { plainPassword: data.plainPassword } : {})
      });
      setMsg("Updated! Please re-login if you changed password.");
    } catch (e) { setErr(e?.response?.data?.message || "Update failed"); }
  };

  if (!data) return <p>Loading...</p>;
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      {msg && <p className="text-green-700 text-sm">{msg}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <form onSubmit={save} className="p-4 rounded-2xl border bg-white space-y-3">
        <Field label="User ID" value={data.userId} readOnly />
        <Field label="Username" value={data.userName} onChange={(v)=>setData(s=>({...s,userName:v}))}/>
        <Field label="New Password" type="password" value={data.plainPassword||""} onChange={(v)=>setData(s=>({...s,plainPassword:v}))}/>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-black text-white">Save</button>
          <button type="button" onClick={logout} className="px-4 py-2 rounded-lg border">Logout</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type="text", readOnly }) {
  return (
    <label className="text-sm w-full block">
      <span className="block text-gray-600">{label}</span>
      <input className="mt-1 w-full px-3 py-2 rounded-lg border"
        value={value} type={type} readOnly={readOnly}
        onChange={(e)=>onChange?.(e.target.value)} />
    </label>
  );
}
