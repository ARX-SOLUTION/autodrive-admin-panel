import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse, LoginCredentials, User } from "@/types/user";

const loginApi = async (creds: LoginCredentials): Promise<AuthResponse> => {
  const { data } = await axiosInstance.post("/auth/login", creds);
  return data.data;
};

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => setAuth(data.token, data.user),
  });
};

// On page refresh: token is gone (not persisted) but cookie is valid.
// Call /auth/me to get fresh user data and re-hydrate in-memory token sentinel.
export const useRestoreSession = () => {
  const { isAuthenticated, token, setAuth, logout } = useAuthStore();
  return useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/auth/me");
      return data.data;
    },
    enabled: isAuthenticated && !token,
    retry: false,
    onSuccess: (user: User) => setAuth("cookie", user),
    onError: () => logout(),
  } as Parameters<typeof useQuery<User>>[0]);
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      await axiosInstance.post("/auth/change-password", payload);
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSettled: () => {
      logout();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
};
