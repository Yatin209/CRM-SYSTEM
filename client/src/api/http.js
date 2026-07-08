import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const http = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true, // sends the refreshToken httpOnly cookie
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "nexacrm-access-token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token, persist) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Attach the JWT access token to every outgoing request
http.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

// On 401, try to silently refresh the access token once, then retry the request.
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest?.url?.includes("/auth/");

    if (status !== 401 || isAuthRoute || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return http(originalRequest);
      });
    }

    isRefreshing = true;
    try {
      const { data } = await http.post("/auth/refresh");
      const newToken = data?.data?.accessToken;
      const persisted = !!localStorage.getItem(TOKEN_KEY);
      setAccessToken(newToken, persisted);
      flushQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent("nexacrm:session-expired"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function unwrap(response) {
  return response.data?.data ?? response.data;
}
