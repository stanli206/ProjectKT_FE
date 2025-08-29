# Employee Timesheet / Management System (MERN + Tailwind)

A role‑based Employee Timesheet / Management System built with **MongoDB, Express, React, Node.js (ES Modules)** and **Tailwind CSS**. Employees can log hours per project/task; managers/admins can review, approve, and run reports.

> **Note:** Frontend uses **React Context API** (no Redux) and React Router for auth/role redirects. Backend uses JWT auth, cookies (optional), and MongoDB with Mongoose.

---

## ✨ Features

**Authentication & Roles**

* JWT‑based login, register, logout
* Roles: `employee`, `manager`, `admin`
* Role‑based routing: admins auto‑redirect to Admin Dashboard after login
---
## 🧱 Tech Stack

* **Frontend:** React, Vite/CRA, Tailwind CSS, React Router, Context API, Axios
* **Backend:** Node.js ("type": "module"), Express.js, Mongoose
* **Database:** MongoDB
* **Auth:** JWT
  
---
## 🔐 Environment Variables

Create **`server/.env`**:

```
MONGODB_URL=your DB connection string....
JWT_SECRET=..
PORT=your port
JWT_EXPIRES_IN=..
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your gmail
SMTP_PASS=..
ADMIN_EMAIL=your gmail

```

Create **`client/.env`**:

```
VITE_API_URL=http:your url..
```

---

## 🚀 Getting Started

### 1) Clone & Install

```
# root
git clone <repo-url> employee-timesheet
cd employee-timesheet

# server
cd server && npm install && cd ..

# client
cd client && npm install && cd ..
```
