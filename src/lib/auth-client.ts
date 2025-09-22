import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [inferAdditionalFields({
    user: {
      languages: {
        type: "string[]"
      }
    }
  })],
});

export type Session = typeof authClient.$Infer.Session

// Password reset helpers for our API
export async function requestPasswordReset(params: { email: string; redirectTo?: string }) {
  const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseURL) {
    throw { error: { message: "Missing NEXT_PUBLIC_SERVER_URL" } };
  }
  const response = await fetch(`${baseURL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: params.email, redirectTo: params.redirectTo }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw { error: { message: text || response.statusText, status: response.status } };
  }
  return response.json().catch(() => ({}));
}

export async function resetPasswordWithToken(params: { token: string; newPassword: string }) {
  const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseURL) {
    throw { error: { message: "Missing NEXT_PUBLIC_SERVER_URL" } };
  }
  const response = await fetch(`${baseURL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: params.token, password: params.newPassword }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw { error: { message: text || response.statusText, status: response.status } };
  }
  return response.json().catch(() => ({}));
}