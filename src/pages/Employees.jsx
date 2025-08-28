// import { useEffect, useMemo, useState } from "react";
// import api from "../utils/api";
// import RecordTracking from "../components/RecordTracking";

// export default function Employees() {
//   // ------- State -------
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");
//   const [msg, setMsg] = useState("");

//   // View modal
//   const [selectedId, setSelectedId] = useState(null);
//   const [detail, setDetail] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [detailErr, setDetailErr] = useState("");

//   // Edit modal
//   const [editId, setEditId] = useState(null);
//   const [editForm, setEditForm] = useState(null);
//   const [editLoading, setEditLoading] = useState(false);
//   const [editErr, setEditErr] = useState("");

//   // Create Form
//   const [form, setForm] = useState({
//     name: "",
//     personalEmail: "",
//     personalMobile: "",
//     dateOfBirth: "", // YYYY-MM-DD
//     address: "",
//     bloodGroup: "",
//     companyEmail: "",
//     companyMobile: "",
//     Em_category: "",
//     designation: "",
//     experienceYears: 0,
//     perHoursCharge: 0,
//   });

//   const bloodGroups = useMemo(
//     () => ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
//     []
//   );
//   const empCategories = useMemo(
//     () => ["FullTime", "PartTime", "Contract", "Intern"],
//     []
//   );

//   // ------- Load List (GET /employees) -------
//   const loadList = async () => {
//     setLoading(true);
//     setErr("");
//     try {
//       const { data } = await api.get("/employees");
//       setList(data || []);
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Load failed");
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     loadList();
//   }, []);

//   // ------- Helpers -------
//   const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));
//   const resetForm = () =>
//     setForm({
//       name: "",
//       personalEmail: "",
//       personalMobile: "",
//       dateOfBirth: "",
//       address: "",
//       bloodGroup: "",
//       companyEmail: "",
//       companyMobile: "",
//       Em_category: "",
//       designation: "",
//       experienceYears: 0,
//       perHoursCharge: 0,
//     });

//   const validate = (payload) => {
//     const f = payload || form;
//     if (!f.name?.trim()) return "Name is required";
//     if (!f.personalEmail?.trim()) return "Personal email is required";
//     if (f.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(f.dateOfBirth))
//       return "Date of birth must be YYYY-MM-DD";
//     if ((f.experienceYears ?? 0) < 0) return "Experience cannot be negative";
//     if ((f.perHoursCharge ?? 0) < 0)
//       return "Per hour charge cannot be negative";
//     return "";
//   };

//   // ------- CRUD -------
//   const create = async (e) => {
//     e.preventDefault();
//     setErr("");
//     setMsg("");
//     const v = validate(form);
//     if (v) return setErr(v);
//     try {
//       await api.post("/employees", form);
//       resetForm();
//       setMsg("Employee created successfully");
//       await loadList();
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Create failed");
//     }
//   };

//   const del = async (employeeId) => {
//     if (!confirm("Delete employee?")) return;
//     setErr("");
//     setMsg("");
//     try {
//       await api.delete(`/employees/${employeeId}`);
//       await loadList();
//       if (selectedId === employeeId) closeViewModal();
//       if (editId === employeeId) closeEditModal();
//       setMsg("Deleted");
//     } catch (e) {
//       setErr(e?.response?.data?.message || "Delete failed");
//     }
//   };

//   // ------- View Modal (GET /employees/:id) -------
//   const openViewModal = async (employeeId) => {
//     setSelectedId(employeeId);
//     setDetail(null);
//     setDetailErr("");
//     setDetailLoading(true);
//     try {
//       const { data } = await api.get(`/employees/${employeeId}`);
//       setDetail(data);
//     } catch (e) {
//       setDetailErr(e?.response?.data?.message || "Failed to load details");
//     } finally {
//       setDetailLoading(false);
//     }
//   };
//   const closeViewModal = () => {
//     setSelectedId(null);
//     setDetail(null);
//     setDetailErr("");
//   };

//   // ------- Edit Modal (GET /employees/:id → PUT /employees/:id) -------
//   const openEditModal = async (employeeId) => {
//     setEditId(employeeId);
//     setEditForm(null);
//     setEditErr("");
//     setEditLoading(true);
//     try {
//       const { data } = await api.get(`/employees/${employeeId}`);
//       setEditForm({
//         name: data.name || "",
//         personalEmail: data.personalEmail || "",
//         personalMobile: data.personalMobile || "",
//         dateOfBirth: data.dateOfBirth || "",
//         address: data.address || "",
//         bloodGroup: data.bloodGroup || "",
//         companyEmail: data.companyEmail || "",
//         companyMobile: data.companyMobile || "",
//         Em_category: data.Em_category || "",
//         designation: data.designation || "",
//         experienceYears: data.experienceYears ?? 0,
//         perHoursCharge: data.perHoursCharge ?? 0,
//       });
//     } catch (e) {
//       setEditErr(e?.response?.data?.message || "Failed to load for edit");
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   const saveEdit = async (e) => {
//     e.preventDefault();
//     if (!editForm) return;
//     const v = validate(editForm);
//     if (v) {
//       setEditErr(v);
//       return;
//     }
//     setEditErr("");
//     try {
//       await api.put(`/employees/${editId}`, editForm);
//       await loadList();
//       if (selectedId === editId) await openViewModal(editId); // refresh view modal if open
//       closeEditModal();
//       setMsg("Employee updated");
//     } catch (e2) {
//       setEditErr(e2?.response?.data?.message || "Save failed");
//     }
//   };

//   const closeEditModal = () => {
//     setEditId(null);
//     setEditForm(null);
//     setEditErr("");
//   };

//   const goBack = () => window.history.back();

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">Employees</h1>
//         <button
//           type="button"
//           onClick={goBack}
//           className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
//           title="Go back"
//         >
//           ← Back
//         </button>
//       </div>

//       {err && <p className="text-red-600 text-sm">{err}</p>}
//       {msg && <p className="text-green-700 text-sm">{msg}</p>}

//       {/* ---- Create Employee ---- */}
//       <form onSubmit={create} className="space-y-4">
//         <SectionCard title="Personal">
//           <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//             <Field
//               label="Name"
//               value={form.name}
//               onChange={(v) => onChange("name", v)}
//             />
//             <Field
//               label="Personal Email"
//               value={form.personalEmail}
//               onChange={(v) => onChange("personalEmail", v)}
//             />
//             <Field
//               label="Personal Mobile"
//               value={form.personalMobile}
//               onChange={(v) => onChange("personalMobile", v)}
//             />
//             <Field
//               label="Date of Birth"
//               type="date"
//               value={form.dateOfBirth}
//               onChange={(v) => onChange("dateOfBirth", v)}
//             />
//             <Select
//               label="Blood Group"
//               value={form.bloodGroup}
//               onChange={(v) => onChange("bloodGroup", v)}
//               options={bloodGroups}
//             />
//             <Select
//               label="Employee Category"
//               value={form.Em_category}
//               onChange={(v) => onChange("Em_category", v)}
//               options={empCategories}
//             />
//             <Textarea
//               className="lg:col-span-3"
//               label="Address"
//               value={form.address}
//               onChange={(v) => onChange("address", v)}
//             />
//           </div>
//         </SectionCard>

//         <SectionCard title="Company">
//           <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//             <Field
//               label="Company Email"
//               value={form.companyEmail}
//               onChange={(v) => onChange("companyEmail", v)}
//             />
//             <Field
//               label="Company Mobile"
//               value={form.companyMobile}
//               onChange={(v) => onChange("companyMobile", v)}
//             />
//           </div>
//         </SectionCard>

//         <SectionCard title="Job & Pay">
//           <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//             <Field
//               label="Designation"
//               value={form.designation}
//               onChange={(v) => onChange("designation", v)}
//             />
//             <Field
//               label="Experience (years)"
//               type="number"
//               value={form.experienceYears}
//               onChange={(v) => onChange("experienceYears", +v)}
//             />
//             <Field
//               label="Per Hour Charge"
//               type="number"
//               value={form.perHoursCharge}
//               onChange={(v) => onChange("perHoursCharge", +v)}
//             />
//           </div>
//         </SectionCard>

//         <div className="flex gap-3">
//           <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
//             Create Employee
//           </button>
//           <button
//             type="button"
//             onClick={resetForm}
//             className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
//           >
//             Reset
//           </button>
//         </div>
//       </form>

//       {/* ---- List ---- */}
//       <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
//         <div className="overflow-auto">
//           <table className="min-w-full text-sm">
//             <thead>
//               <tr className="text-left bg-gray-50">
//                 <Th>Name</Th>
//                 <Th>Email</Th>
//                 <Th>Designation</Th>
//                 <Th>Charge</Th>
//                 <Th>Actions</Th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <Td colSpan={5}>
//                     <span className="text-gray-500">Loading employees…</span>
//                   </Td>
//                 </tr>
//               ) : list.length === 0 ? (
//                 <tr>
//                   <Td colSpan={5}>
//                     <span className="text-gray-500">No employees.</span>
//                   </Td>
//                 </tr>
//               ) : (
//                 list.map((e) => (
//                   <tr key={e.employeeId} className="border-t">
//                     <Td>{e.name}</Td>
//                     <Td>{e.personalEmail}</Td>
//                     <Td>{e.designation}</Td>
//                     <Td>{e.perHoursCharge}</Td>
//                     <Td>
//                       <div className="flex flex-wrap gap-2">
//                         <button
//                           onClick={() => openViewModal(e.employeeId)}
//                           className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
//                         >
//                           View
//                         </button>
//                         <button
//                           onClick={() => openEditModal(e.employeeId)}
//                           className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => del(e.employeeId)}
//                           className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </Td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ---- View Modal ---- */}
//       {selectedId && (
//         <Modal onClose={closeViewModal}>
//           <ModalHeader
//             title={detail?.name || "Employee"}
//             subtitle={detail?.employeeId ? `(${detail.employeeId})` : ""}
//             onClose={closeViewModal}
//           />
//           <ModalBody>
//             {detailLoading && (
//               <p className="text-sm text-gray-500">Loading details…</p>
//             )}
//             {detailErr && <p className="text-sm text-red-600">{detailErr}</p>}
//             {detail && (
//               <>
//                 <div className="p-4 rounded-xl bg-gray-50">
//                   <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//                     <Read label="Name" value={detail.name} />
//                     <Read label="Personal Email" value={detail.personalEmail} />
//                     <Read
//                       label="Personal Mobile"
//                       value={detail.personalMobile}
//                     />
//                     <Read label="Date of Birth" value={detail.dateOfBirth} />
//                     <Read
//                       label="Address"
//                       value={detail.address}
//                       className="lg:col-span-3"
//                     />
//                     <Read label="Blood Group" value={detail.bloodGroup} />
//                     <Read label="Company Email" value={detail.companyEmail} />
//                     <Read label="Company Mobile" value={detail.companyMobile} />
//                     <Read
//                       label="Employee Category"
//                       value={detail.Em_category}
//                     />
//                     <Read label="Designation" value={detail.designation} />
//                     <Read
//                       label="Experience (years)"
//                       value={detail.experienceYears}
//                     />
//                     <Read
//                       label="Per Hour Charge"
//                       value={detail.perHoursCharge}
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-6">
//                   <p className="font-medium mb-2">Audit Log</p>
//                   <RecordTracking logs={detail.recordTracking} />
//                 </div>
//               </>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <button
//               onClick={closeViewModal}
//               className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
//             >
//               Close
//             </button>
//           </ModalFooter>
//         </Modal>
//       )}

//       {/* ---- Edit Modal ---- */}
//       {editId && (
//         <Modal onClose={closeEditModal}>
//           <ModalHeader title="Edit Employee" onClose={closeEditModal} />
//           <ModalBody>
//             {editLoading && <p className="text-sm text-gray-500">Loading…</p>}
//             {editErr && <p className="text-sm text-red-600">{editErr}</p>}
//             {editForm && (
//               <form
//                 id="emp-edit-form"
//                 onSubmit={saveEdit}
//                 className="space-y-4"
//               >
//                 <SectionCard title="Personal">
//                   <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//                     <Field
//                       label="Name"
//                       value={editForm.name}
//                       onChange={(v) => setEditForm((s) => ({ ...s, name: v }))}
//                     />
//                     <Field
//                       label="Personal Email"
//                       value={editForm.personalEmail}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, personalEmail: v }))
//                       }
//                     />
//                     <Field
//                       label="Personal Mobile"
//                       value={editForm.personalMobile}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, personalMobile: v }))
//                       }
//                     />
//                     <Field
//                       label="Date of Birth"
//                       type="date"
//                       value={editForm.dateOfBirth}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, dateOfBirth: v }))
//                       }
//                     />
//                     <Select
//                       label="Blood Group"
//                       value={editForm.bloodGroup}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, bloodGroup: v }))
//                       }
//                       options={bloodGroups}
//                     />
//                     <Select
//                       label="Employee Category"
//                       value={editForm.Em_category}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, Em_category: v }))
//                       }
//                       options={empCategories}
//                     />
//                     <Textarea
//                       className="lg:col-span-3"
//                       label="Address"
//                       value={editForm.address}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, address: v }))
//                       }
//                     />
//                   </div>
//                 </SectionCard>

//                 <SectionCard title="Company">
//                   <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//                     <Field
//                       label="Company Email"
//                       value={editForm.companyEmail}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, companyEmail: v }))
//                       }
//                     />
//                     <Field
//                       label="Company Mobile"
//                       value={editForm.companyMobile}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, companyMobile: v }))
//                       }
//                     />
//                   </div>
//                 </SectionCard>

//                 <SectionCard title="Job & Pay">
//                   <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
//                     <Field
//                       label="Designation"
//                       value={editForm.designation}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, designation: v }))
//                       }
//                     />
//                     <Field
//                       label="Experience (years)"
//                       type="number"
//                       value={editForm.experienceYears}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, experienceYears: +v }))
//                       }
//                     />
//                     <Field
//                       label="Per Hour Charge"
//                       type="number"
//                       value={editForm.perHoursCharge}
//                       onChange={(v) =>
//                         setEditForm((s) => ({ ...s, perHoursCharge: +v }))
//                       }
//                     />
//                   </div>
//                 </SectionCard>
//               </form>
//             )}
//           </ModalBody>
//           <ModalFooter>
//             <button
//               onClick={closeEditModal}
//               className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               form="emp-edit-form"
//               className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//             >
//               Save Changes
//             </button>
//           </ModalFooter>
//         </Modal>
//       )}
//     </div>
//   );
// }

// function SectionCard({ title, children }) {
//   return (
//     <div className="p-5 rounded-2xl bg-white shadow-sm">
//       <p className="font-medium mb-3">{title}</p>
//       {children}
//     </div>
//   );
// }

// function Field({ label, value, onChange, type = "text" }) {
//   return (
//     <label className="text-sm w-full">
//       <span className="block text-gray-700">{label}</span>
//       <input
//         className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//         value={value}
//         type={type}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </label>
//   );
// }

// function Textarea({ label, value, onChange, className = "" }) {
//   return (
//     <label className={`text-sm w-full ${className}`}>
//       <span className="block text-gray-700">{label}</span>
//       <textarea
//         rows={3}
//         className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       />
//     </label>
//   );
// }

// function Select({ label, value, onChange, options = [] }) {
//   return (
//     <label className="text-sm w-full">
//       <span className="block text-gray-700">{label}</span>
//       <select
//         className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//       >
//         <option value="">Select</option>
//         {options.map((o) => (
//           <option key={o} value={o}>
//             {o}
//           </option>
//         ))}
//       </select>
//     </label>
//   );
// }

// function Th({ children }) {
//   return <th className="py-2 px-3 font-medium text-gray-700">{children}</th>;
// }
// function Td({ children, colSpan }) {
//   return (
//     <td className="py-2 px-3" colSpan={colSpan}>
//       {children}
//     </td>
//   );
// }

// function Modal({ children, onClose }) {
//   // ESC to close
//   useEffect(() => {
//     const onEsc = (e) => {
//       if (e.key === "Escape") onClose?.();
//     };
//     window.addEventListener("keydown", onEsc);
//     return () => window.removeEventListener("keydown", onEsc);
//   }, [onClose]);

//   return (
//     <div className="fixed inset-0 z-40 flex items-start justify-center p-4 md:p-6">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/40"
//         onClick={onClose}
//         aria-hidden="true"
//       />
//       {/* Panel */}
//       <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
//         {children}
//       </div>
//     </div>
//   );
// }

// function ModalHeader({ title, subtitle, onClose }) {
//   return (
//     <div className="flex items-start justify-between p-4 border-b">
//       <div>
//         <h2 className="text-xl font-semibold">{title}</h2>
//         {subtitle ? <p className="text-gray-500 text-sm">{subtitle}</p> : null}
//       </div>
//       <button
//         onClick={onClose}
//         className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
//         title="Close"
//       >
//         ✕
//       </button>
//     </div>
//   );
// }

// function ModalBody({ children }) {
//   return <div className="p-4 overflow-y-auto flex-1">{children}</div>;
// }

// function ModalFooter({ children }) {
//   return (
//     <div className="p-4 border-t bg-white sticky bottom-0">
//       <div className="flex items-center justify-end gap-3">{children}</div>
//     </div>
//   );
// }

// function Read({ label, value, className = "" }) {
//   return (
//     <div className={`text-sm ${className}`}>
//       <p className="text-gray-500">{label}</p>
//       <p className="mt-0.5">{value || "-"}</p>
//     </div>
//   );
// }
import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import RecordTracking from "../components/RecordTracking";

export default function Employees() {
  // ------- State -------
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // View modal
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailErr, setDetailErr] = useState("");

  // Edit modal
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState("");

  // Popup Alert (for errors)
  const [popup, setPopup] = useState({ open: false, title: "", message: "" });

  // Create Form
  const [form, setForm] = useState({
    name: "",
    personalEmail: "",
    personalMobile: "",
    dateOfBirth: "", // YYYY-MM-DD
    address: "",
    bloodGroup: "",
    companyEmail: "",
    companyMobile: "",
    Em_category: "",
    designation: "",
    experienceYears: 0,
    perHoursCharge: 0,
  });

  const bloodGroups = useMemo(
    () => ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    []
  );
  const empCategories = useMemo(
    () => ["FullTime", "PartTime", "Contract", "Intern"],
    []
  );

  // ------- Load List (GET /employees) -------
  const loadList = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/employees");
      setList(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadList();
  }, []);

  // ------- Helpers -------
  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));
  const resetForm = () =>
    setForm({
      name: "",
      personalEmail: "",
      personalMobile: "",
      dateOfBirth: "",
      address: "",
      bloodGroup: "",
      companyEmail: "",
      companyMobile: "",
      Em_category: "",
      designation: "",
      experienceYears: 0,
      perHoursCharge: 0,
    });

  const validate = (payload) => {
    const f = payload || form;
    if (!f.name?.trim()) return "Name is required";
    if (!f.personalEmail?.trim()) return "Personal email is required";
    if (f.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(f.dateOfBirth))
      return "Date of birth must be YYYY-MM-DD";
    if ((f.experienceYears ?? 0) < 0) return "Experience cannot be negative";
    if ((f.perHoursCharge ?? 0) < 0)
      return "Per hour charge cannot be negative";
    return "";
  };

  // ------- CRUD -------
  const create = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    const v = validate(form);
    if (v) return setErr(v);
    try {
      await api.post("/employees", form);
      resetForm();
      setMsg("Employee created successfully");
      await loadList();
    } catch (e) {
      // keep existing inline error behavior
      const m = e?.response?.data?.message || "Create failed";
      setErr(m);
    }
  };

  const del = async (employeeId) => {
    if (!confirm("Delete employee?")) return;
    setErr("");
    setMsg("");
    try {
      await api.delete(`/employees/${employeeId}`);
      await loadList();
      if (selectedId === employeeId) closeViewModal();
      if (editId === employeeId) closeEditModal();
      setMsg("Deleted");
    } catch (e) {
      const m = e?.response?.data?.message || "Delete failed";
      setErr(m);
    }
  };

  // ------- View Modal (GET /employees/:id) -------
  const openViewModal = async (employeeId) => {
    setSelectedId(employeeId);
    setDetail(null);
    setDetailErr("");
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/employees/${employeeId}`);
      setDetail(data);
    } catch (e) {
      const m = e?.response?.data?.message || "Failed to load details";
      setDetailErr(m);
    } finally {
      setDetailLoading(false);
    }
  };
  const closeViewModal = () => {
    setSelectedId(null);
    setDetail(null);
    setDetailErr("");
  };

  // ------- Edit Modal (GET /employees/:id → PUT /employees/:id) -------
  const openEditModal = async (employeeId) => {
    setEditId(employeeId);
    setEditForm(null);
    setEditErr("");
    setEditLoading(true);
    try {
      const { data } = await api.get(`/employees/${employeeId}`);
      setEditForm({
        name: data.name || "",
        personalEmail: data.personalEmail || "",
        personalMobile: data.personalMobile || "",
        dateOfBirth: data.dateOfBirth || "",
        address: data.address || "",
        bloodGroup: data.bloodGroup || "",
        companyEmail: data.companyEmail || "",
        companyMobile: data.companyMobile || "",
        Em_category: data.Em_category || "",
        designation: data.designation || "",
        experienceYears: data.experienceYears ?? 0,
        perHoursCharge: data.perHoursCharge ?? 0,
      });
    } catch (e) {
      const m = e?.response?.data?.message || "Failed to load for edit";
      setEditErr(m);
    } finally {
      setEditLoading(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editForm) return;
    const v = validate(editForm);
    if (v) {
      setEditErr(v);
      return;
    }
    setEditErr("");
    try {
      await api.put(`/employees/${editId}`, editForm);
      await loadList();
      if (selectedId === editId) await openViewModal(editId); // refresh view modal if open
      closeEditModal();
      setMsg("Employee updated");
    } catch (e2) {
      const m = e2?.response?.data?.message || "Save failed";
      setEditErr(m);
    }
  };

  const closeEditModal = () => {
    setEditId(null);
    setEditForm(null);
    setEditErr("");
  };

  const goBack = () => window.history.back();

  /* ---------- Popup bindings (do not alter your styles/logic) ---------- */
  useEffect(() => {
    // When any error appears, open a non-intrusive popup
    if (err) setPopup({ open: true, title: "Error", message: err });
  }, [err]);
  useEffect(() => {
    if (detailErr) setPopup({ open: true, title: "Error", message: detailErr });
  }, [detailErr]);
  useEffect(() => {
    if (editErr) setPopup({ open: true, title: "Error", message: editErr });
  }, [editErr]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Employees</h1>
        <button
          type="button"
          onClick={goBack}
          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
          title="Go back"
        >
          ← Back
        </button>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}
      {msg && <p className="text-green-700 text-sm">{msg}</p>}

      {/* ---- Create Employee ---- */}
      <form onSubmit={create} className="space-y-4">
        <SectionCard title="Personal">
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => onChange("name", v)}
            />
            <Field
              label="Personal Email"
              value={form.personalEmail}
              onChange={(v) => onChange("personalEmail", v)}
            />
            <Field
              label="Personal Mobile"
              value={form.personalMobile}
              onChange={(v) => onChange("personalMobile", v)}
            />
            <Field
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(v) => onChange("dateOfBirth", v)}
            />
            <Select
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(v) => onChange("bloodGroup", v)}
              options={bloodGroups}
            />
            <Select
              label="Employee Category"
              value={form.Em_category}
              onChange={(v) => onChange("Em_category", v)}
              options={empCategories}
            />
            <Textarea
              className="lg:col-span-3"
              label="Address"
              value={form.address}
              onChange={(v) => onChange("address", v)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Company">
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
            <Field
              label="Company Email"
              value={form.companyEmail}
              onChange={(v) => onChange("companyEmail", v)}
            />
            <Field
              label="Company Mobile"
              value={form.companyMobile}
              onChange={(v) => onChange("companyMobile", v)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Job & Pay">
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
            <Field
              label="Designation"
              value={form.designation}
              onChange={(v) => onChange("designation", v)}
            />
            <Field
              label="Experience (years)"
              type="number"
              value={form.experienceYears}
              onChange={(v) => onChange("experienceYears", +v)}
            />
            <Field
              label="Per Hour Charge"
              type="number"
              value={form.perHoursCharge}
              onChange={(v) => onChange("perHoursCharge", +v)}
            />
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            Create Employee
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
          >
            Reset
          </button>
        </div>
      </form>

      {/* ---- List ---- */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Designation</Th>
                <Th>Charge</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <Td colSpan={5}>
                    <span className="text-gray-500">Loading employees…</span>
                  </Td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <Td colSpan={5}>
                    <span className="text-gray-500">No employees.</span>
                  </Td>
                </tr>
              ) : (
                list.map((e) => (
                  <tr key={e.employeeId} className="border-t">
                    <Td>{e.name}</Td>
                    <Td>{e.personalEmail}</Td>
                    <Td>{e.designation}</Td>
                    <Td>{e.perHoursCharge}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openViewModal(e.employeeId)}
                          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(e.employeeId)}
                          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(e.employeeId)}
                          className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
                        >
                          Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- View Modal ---- */}
      {selectedId && (
        <Modal onClose={closeViewModal}>
          <ModalHeader
            title={detail?.name || "Employee"}
            subtitle={detail?.employeeId ? `(${detail.employeeId})` : ""}
            onClose={closeViewModal}
          />
          <ModalBody>
            {detailLoading && (
              <p className="text-sm text-gray-500">Loading details…</p>
            )}
            {detailErr && <p className="text-sm text-red-600">{detailErr}</p>}
            {detail && (
              <>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                    <Read label="Name" value={detail.name} />
                    <Read label="Personal Email" value={detail.personalEmail} />
                    <Read
                      label="Personal Mobile"
                      value={detail.personalMobile}
                    />
                    <Read label="Date of Birth" value={detail.dateOfBirth} />
                    <Read
                      label="Address"
                      value={detail.address}
                      className="lg:col-span-3"
                    />
                    <Read label="Blood Group" value={detail.bloodGroup} />
                    <Read label="Company Email" value={detail.companyEmail} />
                    <Read label="Company Mobile" value={detail.companyMobile} />
                    <Read
                      label="Employee Category"
                      value={detail.Em_category}
                    />
                    <Read label="Designation" value={detail.designation} />
                    <Read
                      label="Experience (years)"
                      value={detail.experienceYears}
                    />
                    <Read
                      label="Per Hour Charge"
                      value={detail.perHoursCharge}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="font-medium mb-2">Audit Log</p>
                  <RecordTracking logs={detail.recordTracking} />
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={closeViewModal}
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
            >
              Close
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ---- Edit Modal ---- */}
      {editId && (
        <Modal onClose={closeEditModal}>
          <ModalHeader title="Edit Employee" onClose={closeEditModal} />
          <ModalBody>
            {editLoading && <p className="text-sm text-gray-500">Loading…</p>}
            {editErr && <p className="text-sm text-red-600">{editErr}</p>}
            {editForm && (
              <form
                id="emp-edit-form"
                onSubmit={saveEdit}
                className="space-y-4"
              >
                <SectionCard title="Personal">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                    <Field
                      label="Name"
                      value={editForm.name}
                      onChange={(v) => setEditForm((s) => ({ ...s, name: v }))}
                    />
                    <Field
                      label="Personal Email"
                      value={editForm.personalEmail}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, personalEmail: v }))
                      }
                    />
                    <Field
                      label="Personal Mobile"
                      value={editForm.personalMobile}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, personalMobile: v }))
                      }
                    />
                    <Field
                      label="Date of Birth"
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, dateOfBirth: v }))
                      }
                    />
                    <Select
                      label="Blood Group"
                      value={editForm.bloodGroup}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, bloodGroup: v }))
                      }
                      options={bloodGroups}
                    />
                    <Select
                      label="Employee Category"
                      value={editForm.Em_category}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, Em_category: v }))
                      }
                      options={empCategories}
                    />
                    <Textarea
                      className="lg:col-span-3"
                      label="Address"
                      value={editForm.address}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, address: v }))
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Company">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                    <Field
                      label="Company Email"
                      value={editForm.companyEmail}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, companyEmail: v }))
                      }
                    />
                    <Field
                      label="Company Mobile"
                      value={editForm.companyMobile}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, companyMobile: v }))
                      }
                    />
                  </div>
                </SectionCard>

                <SectionCard title="Job & Pay">
                  <div className="grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
                    <Field
                      label="Designation"
                      value={editForm.designation}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, designation: v }))
                      }
                    />
                    <Field
                      label="Experience (years)"
                      type="number"
                      value={editForm.experienceYears}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, experienceYears: +v }))
                      }
                    />
                    <Field
                      label="Per Hour Charge"
                      type="number"
                      value={editForm.perHoursCharge}
                      onChange={(v) =>
                        setEditForm((s) => ({ ...s, perHoursCharge: +v }))
                      }
                    />
                  </div>
                </SectionCard>
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={closeEditModal}
              className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="emp-edit-form"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ---- Popup Alert (Errors) ---- */}
      {popup.open && (
        <AlertPopup
          title={popup.title}
          message={popup.message}
          onClose={() => setPopup((s) => ({ ...s, open: false }))}
        />
      )}
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function SectionCard({ title, children }) {
  return (
    <div className="p-5 rounded-2xl bg-white shadow-sm">
      <p className="font-medium mb-3">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <input
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, className = "" }) {
  return (
    <label className={`text-sm w-full ${className}`}>
      <span className="block text-gray-700">{label}</span>
      <textarea
        rows={3}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <label className="text-sm w-full">
      <span className="block text-gray-700">{label}</span>
      <select
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

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

/* ---------------- Modal Shell ---------------- */

function Modal({ children, onClose }) {
  // ESC to close
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh]">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="flex items-start justify-between p-4 border-b">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle ? <p className="text-gray-500 text-sm">{subtitle}</p> : null}
      </div>
      <button
        onClick={onClose}
        className="px-3 py-1.5 rounded-lg bg-white shadow-sm hover:shadow"
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}

function ModalBody({ children }) {
  return <div className="p-4 overflow-y-auto flex-1">{children}</div>;
}

function ModalFooter({ children }) {
  return (
    <div className="p-4 border-t bg-white sticky bottom-0">
      <div className="flex items-center justify-end gap-3">{children}</div>
    </div>
  );
}

function Read({ label, value, className = "" }) {
  return (
    <div className={`text-sm ${className}`}>
      <p className="text-gray-500">{label}</p>
      <p className="mt-0.5">{value || "-"}</p>
    </div>
  );
}

/* ---------------- Popup Alert ---------------- */

function AlertPopup({ title = "Alert", message = "", onClose }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white shadow hover:shadow-md"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
