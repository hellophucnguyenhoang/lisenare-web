import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiLogin,
  apiLogout,
  apiRegister,
  apiSendOtp,
  apiResetPassword,
  type ResetPasswordParams,
} from "@/api/auth";

export function useAuth() {
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (params: { username: string; password: string }) =>
      apiLogin(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learner"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (params: {
      username: string;
      email?: string;
      password: string;
    }) => apiRegister(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learner"] });
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (username: string) => apiSendOtp(username),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (params: ResetPasswordParams) => apiResetPassword(params),
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      qc.clear();
    },
  });

  const login = (
    params: { username: string; password: string },
    options?: Parameters<typeof loginMutation.mutate>[1],
  ) => {
    loginMutation.mutate(params, options);
  };

  const loginWithGoogle = (options?: { onSuccess?: () => void }) => {
    options?.onSuccess?.();
  };

  const register = (
    params: { username: string; email?: string; password: string },
    options?: Parameters<typeof registerMutation.mutate>[1],
  ) => {
    registerMutation.mutate(params, options);
  };

  const sendOtp = (
    username: string,
    options?: Parameters<typeof sendOtpMutation.mutate>[1],
  ) => {
    sendOtpMutation.mutate(username, options);
  };

  const resetPassword = (
    params: ResetPasswordParams,
    options?: Parameters<typeof resetPasswordMutation.mutate>[1],
  ) => {
    resetPasswordMutation.mutate(params, options);
  };

  const logout = (options?: Parameters<typeof logoutMutation.mutate>[1]) => {
    logoutMutation.mutate(undefined, options);
  };

  return {
    login,
    loginWithGoogle,
    register,
    sendOtp,
    resetPassword,
    logout,
    loginMutation,
    registerMutation,
    sendOtpMutation,
    resetPasswordMutation,
    logoutMutation,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      sendOtpMutation.isPending ||
      resetPasswordMutation.isPending ||
      logoutMutation.isPending,
  };
}
