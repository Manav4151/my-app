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