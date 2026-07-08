import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { http, getAccessToken, setAccessToken } from "../api/http.js";

const AuthContext = createContext(null);
const USER_KEY = "nexacrm-user";

function readStoredUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  function persistUser(found, remember) {
    if (remember) {
      localStorage.setItem(USER_KEY, JSON.stringify(found));
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(found));
      localStorage.removeItem(USER_KEY);
    }
  }

  const login = useCallback(async ({ email, password, remember }) => {
    if (!email) { toast.error("Email is required"); return false; }
    if (!password) { toast.error("Password is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Invalid email format"); return false; }
    if (password.length < 8) { toast.error("Password must contain at least 8 characters"); return false; }

    setIsLoading(true);
    try {
      const { data } = await http.post("/auth/login", { email, password });
      const { user: found, accessToken } = data.data;

      setAccessToken(accessToken, remember);
      persistUser(found, remember);
      setUser(found);
      toast.success(`Welcome back, ${found.name.split(" ")[0]}!`);
      if (remember) toast.info("✓ Staying signed in on this device");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Invalid email or password";
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await http.post("/auth/logout"); } catch { /* ignore */ }
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    toast.info("Session closed");
  }, []);

  // If a silent refresh fails (token expired / revoked), force logout
  useEffect(() => {
    function handleExpired() {
      setAccessToken(null);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      setUser(null);
      toast.error("Your session has expired. Please sign in again.");
    }
    window.addEventListener("nexacrm:session-expired", handleExpired);
    return () => window.removeEventListener("nexacrm:session-expired", handleExpired);
  }, []);

  // On first load, if we have a user but no access token (e.g. token expired
  // while tab was closed), try a silent refresh using the httpOnly cookie.
  useEffect(() => {
    if (user && !getAccessToken()) {
      http.post("/auth/refresh")
        .then(({ data }) => setAccessToken(data?.data?.accessToken, !!localStorage.getItem(USER_KEY)))
        .catch(() => {
          setUser(null);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(USER_KEY);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ user, login, logout, isLoading }), [user, isLoading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
