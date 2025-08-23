import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function EmployeeTimesheet() {
  const navigate = useNavigate();
  const { user } = useAuth(); // { userId, role, userName }
  const isAdmin = user?.role === "Admin";
  const isPrincipal = user?.role === "Principal";
  const isEmployee = user?.role === "Employee";
  const canCreate = isAdmin || isEmployee; // per policy
  const canSeeAll = isAdmin || isPrincipal; // list scope

  // data
  const [projects, setProjects] = useState([]);
  const [list, setList] = useState([]);

  // ui
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // create form (Admin + Employee only)
  const [form, setForm] = useState({ projectId: "", date: "", hours: "" });

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", hours: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const [{ data: projs }, { data: ts }] = await Promise.all([
        api.get("/projects"),
        api.get("/timesheets"),
      ]);
      setProjects((projs || []).filter((p) => p.status !== "Completed"));

      const rows = Array.isArray(ts) ? ts : [];
      const filtered = canSeeAll
        ? rows
        : rows.filter((r) => r.employeeId === user?.userId);
      setList(
        filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      );
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  // ------- Create -------
  const validateNew = () => {
    if (!form.projectId) return "Select a project";
    if (!form.date) return "Pick a date";
    const h = Number(form.hours);
    if (isNaN(h) || h <= 0) return "Hours must be > 0";
    if (h > 24) return "Cannot log more than 24 hours/day";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!canCreate) return; // guard
    setErr("");
    setMsg("");
    const v = validateNew();
    if (v) return setErr(v);
    try {
      await api.post("/timesheets", { ...form, hours: Number(form.hours) });
      setForm({ projectId: "", date: "", hours: "" });
      setMsg("Timesheet added");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Submit failed");
    }
  };

  // ------- Edit -------
  const openEdit = (row) => {
    setEditItem(row);
    setEditForm({ date: row.date || "", hours: String(row.hours ?? "") });
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditItem(null);
    setEditForm({ date: "", hours: "" });
    setSaving(false);
  };
  const validateEdit = () => {
    if (!editForm.date) return "Pick a date";
    const h = Number(editForm.hours);
    if (isNaN(h) || h <= 0) return "Hours must be > 0";
    if (h > 24) return "Cannot log more than 24 hours/day";
    return "";
  };
  const saveEdit = async (e) => {
    e.preventDefault();
    const v = validateEdit();
    if (v) return setErr(v);
    setErr("");
    setMsg("");
    setSaving(true);
    try {
      await api.put(`/timesheets/${editItem.timesheetId}`, {
        date: editForm.date,
        hours: Number(editForm.hours),
      });
      setMsg("Timesheet updated");
      closeEdit();
      await load();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Update failed");
      setSaving(false);
    }
  };

  // ------- Delete (Admin only) -------
  const del = async (row) => {
    if (!isAdmin) return; // guard
    if (!confirm("Delete this timesheet?")) return;
    setErr("");
    setMsg("");
    try {
      await api.delete(`/timesheets/${row.timesheetId}`);
      setMsg("Timesheet deleted");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  // ------- Helpers -------
  const projectLabel = (pid) => {
    const p = projects.find((x) => x.projectId === pid);
    return p ? `${p.job_name} (${p?.Pro_code?.code || "-"})` : "-";
  };

  const canEditRow = (row) => {
    if (isAdmin || isPrincipal) return true;
    if (row.employeeId !== user?.userId) return false;
    return row.status !== "Approved";
  };

  // Delete permission:
  // - Admin only
  const canDeleteRow = (row) => isAdmin;

  const badge = (status) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs";
    if (status === "Approved") return `${base} bg-green-50 text-green-700`;
    if (status === "Rejected") return `${base} bg-red-50 text-red-700`;
    if (status === "Submitted") return `${base} bg-blue-50 text-blue-700`;
    return `${base} bg-gray-100 text-gray-700`;
  };

  // Title changes based on scope
  const listTitle = canSeeAll ? "All Entries" : "My Entries";

  return (
    <div className="space-y-6">
      {/* Header */}
      {!isEmployee && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Timesheets</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {(err || msg) && (
        <div className="space-y-1">
          {err && <p className="text-red-600 text-sm">{err}</p>}
          {msg && <p className="text-green-700 text-sm">{msg}</p>}
        </div>
      )}

      {/* Create card (Admin + Employee) */}
      {canCreate && (
        <form
          onSubmit={submit}
          className="p-5 rounded-2xl bg-white shadow-sm space-y-3"
        >
          <p className="font-medium">Add Entry</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <select
              className="px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.projectId}
              onChange={(e) =>
                setForm((s) => ({ ...s, projectId: e.target.value }))
              }
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.job_name} ({p?.Pro_code?.code})
                </option>
              ))}
            </select>
            <input
              type="date"
              className="px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={form.date}
              onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
            />
            <input
              type="number"
              step="0.5"
              min="0"
              className="px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Hours"
              value={form.hours}
              onChange={(e) =>
                setForm((s) => ({ ...s, hours: e.target.value }))
              }
            />
            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Tip: Use 0.5 step for half-hours (e.g., 7.5).
          </p>
        </form>
      )}

      {/* List card */}
      <div className="p-5 rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">{listTitle}</p>
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <Th>Project</Th>
                <Th>Date</Th>
                <Th>Hours</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <Td colSpan={5}>
                    <span className="text-gray-500">Loading…</span>
                  </Td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <Td colSpan={5}>
                    <span className="text-gray-500">No entries.</span>
                  </Td>
                </tr>
              ) : (
                list.map((t) => (
                  <tr key={t.timesheetId} className="border-t">
                    <Td>{t.Project_name || projectLabel(t.projectId)}</Td>
                    <Td>{t.date}</Td>
                    <Td>{t.hours}</Td>
                    <Td>
                      <span className={badge(t.status)}>{t.status || "-"}</span>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEdit(t)}
                          disabled={!canEditRow(t)}
                          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow disabled:opacity-50"
                          title={
                            !canEditRow(t)
                              ? "You can't edit this entry"
                              : "Edit"
                          }
                        >
                          Edit
                        </button>
                        {canDeleteRow(t) && (
                          <button
                            onClick={() => del(t)}
                            className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer nav actions — only for Admin & Principal */}
      {(isAdmin || isPrincipal) && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow"
            >
              ⟵ Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/approvals")}
              className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow"
            >
              Approvals
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow"
          >
            Back
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <Modal onClose={closeEdit}>
          <div className="flex items-start justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Edit Timesheet</h2>
              <p className="text-xs text-gray-500">
                {editItem?.Project_name || projectLabel(editItem?.projectId)} •{" "}
                {editItem?.timesheetId}
              </p>
            </div>
            <button
              onClick={closeEdit}
              className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
            >
              ✕
            </button>
          </div>

          <form onSubmit={saveEdit} className="p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-gray-700">Date</span>
                <input
                  type="date"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, date: e.target.value }))
                  }
                />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700">Hours</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={editForm.hours}
                  onChange={(e) =>
                    setEditForm((s) => ({ ...s, hours: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeEdit}
                className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- small primitives ---------- */
function Th({ children }) {
  return <th className="py-2 px-3 font-medium text-gray-700">{children}</th>;
}
function Td({ children, colSpan }) {
  return (
    <td className="py-2 px-3" colSpan={colSpan}>
      {children}
    </td>
  );
}
function Modal({ children, onClose }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl">
        {children}
      </div>
    </div>
  );
}
