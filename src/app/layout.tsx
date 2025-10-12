import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/auth-context";
import { Toaster } from "sonner";
import Navbar from "./components/navbar";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              {children}
            </main>
          </div>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}


///
// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Data Table App",
//   description: "A minimalistic data table with CRUD operations",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-100 min-h-screen`}>
//         <header className="bg-white shadow">
//           <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//             <h1 className="text-3xl font-bold text-gray-900">Data Dashboard</h1>
//           </div>
//         </header>
//         <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//           {children}
//         </main>
//       </body>
//     </html>
//   );
// }