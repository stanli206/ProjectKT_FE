import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("kt_user");
    return u ? JSON.parse(u) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("kt_token"));
  const [loading, setLoading] = useState(false);

  const login = async ({ userName, password }) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { userName, password });
      setToken(data.token);
      localStorage.setItem("kt_token", data.token);
      setUser(data.user);
      localStorage.setItem("kt_user", JSON.stringify(data.user));
      return { ok: true, user: data.user };
    } catch (e) {
      return { ok: false, message: e?.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kt_token");
    localStorage.removeItem("kt_user");
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
