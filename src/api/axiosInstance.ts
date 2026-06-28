import { useAuthStore } from "@/store/authStore";
import axios, { type AxiosRequestHeaders } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30_000,
});

// Endpoints under /platform/* are platform-admin only and intentionally
// list every company — they must never be scoped to one. Everything else
// gets `company_id` appended when a dev user has a company selected.
const PLATFORM_PREFIX = /^\/?platform(\/|$)/;

axiosInstance.interceptors.request.use((config) => {
  const { token, user, activeCompanyId } = useAuthStore.getState();
  if (token) {
    const headers = (config.headers ?? {}) as AxiosRequestHeaders;
    config.headers = {
      ...headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;
  }

  const url = (config.url ?? "").replace(API_BASE_URL, "");
  const isPlatformRoute = PLATFORM_PREFIX.test(url);
  const isAuthRoute = /^\/auth(\/|$)/.test(url);
  if (
    user?.role === "dev" &&
    activeCompanyId &&
    !isPlatformRoute &&
    !isAuthRoute
  ) {
    // Override any call-site company_id with the dev's view-as company
    // so that activeCompanyId is always authoritative for non-platform routes.
    if (config.params instanceof URLSearchParams) {
      if (config.params.has("company_id")) {
        config.params.set("company_id", activeCompanyId);
      } else {
        config.params.append("company_id", activeCompanyId);
      }
    } else {
      const existingParams =
        typeof config.params === "object" && config.params !== null
          ? config.params
          : {};
      config.params = { ...existingParams, company_id: activeCompanyId };
    }
  }
  return config;
});

// Endpoints whose 401 must NOT trigger the global logout/redirect:
//   - /auth/login: the form needs to show "wrong credentials" and keep
//     the fields filled. Redirecting to /login (where the user already
//     is) just reloads the page and wipes the form.
//   - /auth/me:    useRestoreSession handles 401 itself by calling
//     logout(), so the interceptor would only double-fire.
const SKIP_LOGOUT_ON_401 = /\/auth\/(login|me)(?:\?|$)/;

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      if (!SKIP_LOGOUT_ON_401.test(url)) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
