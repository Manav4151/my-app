import { createAuthClient } from "better-auth/react";
import { customSessionClient, inferAdditionalFields } from "better-auth/client/plugins";
import { apiFunctions } from "@/services/api.service";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5050";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    customSessionClient(), // ✅ This enables session management (getAccessToken, current session, etc.)
  

  ],
});

// ✅ Export Session type for TypeScript support
export type Session = typeof authClient.$Infer.Session;

// Password reset helpers for our API
export async function requestPasswordReset(params: { email: string; redirectTo?: string }) {
  const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseURL) {
    throw { error: { message: "Missing NEXT_PUBLIC_SERVER_URL" } };
  }
  // const response = await fetch(`${baseURL}/api/auth/forgot-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email: params.email, redirectTo: params.redirectTo }),
  // });
  const response = await apiFunctions.requestPasswordReset(params.email, params.redirectTo || "");
  if (!response.success) {

    throw { error: { message: response.message || response.statusText, status: response.status } };
  }
  return response;
}

export async function resetPasswordWithToken(params: { token: string; newPassword: string }) {
  const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseURL) {
    throw { error: { message: "Missing NEXT_PUBLIC_SERVER_URL" } };
  }
  // const response = await fetch(`${baseURL}/api/auth/reset-password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ token: params.token, password: params.newPassword }),
  // });
  const response = await apiFunctions.resetPasswordWithToken(params.token, params.newPassword);
  if (!response.success) {

    throw { error: { message: response.message || response.statusText, status: response.status } };
  }
  return response;
} 