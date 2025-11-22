"use client";

import { AuthProvider } from "./auth-context";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";


export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>{children}</AuthProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
