import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookManager - Book Management System",
  description: "A comprehensive book management system with inventory tracking and pricing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <div className="min-h-screen bg-[var(--background)]">
              <Navbar />
              <main>
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
