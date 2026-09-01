import { request } from "./client";
import type { Token } from "@/types";

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
  email?: string;
  name?: string;
}

export interface ResetPasswordParams {
  username: string;
  new_password: string;
  otp: string;
}

export interface EmailChangeOTPParams {
  old_email?: string | null;
  new_email: string;
}

export interface EmailChangeParams {
  old_email?: string | null;
  new_email: string;
  otp: string;
}

export async function apiLogin(params: LoginParams) {
  const formData = new URLSearchParams();
  formData.append("username", params.username);
  formData.append("password", params.password);

  return request<Token>("/auth/login", {
    method: "POST",
    body: formData,
  });
}

export async function apiLogout() {
  return request<{ message?: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function apiRegister(params: RegisterParams) {
  return request<Token>("/accounts", {
    method: "POST",
    body: {
      username: params.username,
      password: params.password,
      email: params.email || undefined,
      name: params.name || params.username,
    },
  });
}

export async function apiSendOtp(username: string) {
  return request<void>("/accounts/send-otp", {
    method: "POST",
    body: { username },
  });
}

export async function apiResetPassword(params: ResetPasswordParams) {
  return request<void>("/accounts/reset-password", {
    method: "POST",
    body: {
      username: params.username,
      new_password: params.new_password,
      otp: params.otp,
    },
  });
}

export async function apiSendEmailChangeOtp(params: EmailChangeOTPParams) {
  return request<void>("/accounts/email/send-otp", {
    method: "POST",
    body: {
      old_email: params.old_email || null,
      new_email: params.new_email,
    },
  });
}

export async function apiChangeEmail(params: EmailChangeParams) {
  return request<void>("/accounts/email", {
    method: "PATCH",
    body: {
      old_email: params.old_email || null,
      new_email: params.new_email,
      otp: params.otp,
    },
  });
}
