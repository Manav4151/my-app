"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { BookOpen, Home, Mail, FileText, Menu, X, LogOut, Building, Sun, Moon } from "lucide-react";
import { useAuth } from "./auth-context";
import { admin } from "better-auth/plugins/admin";
import { ROLES } from "@/lib/role";


export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { session, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  const isAuthPage = pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forget-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/admin');

  if (isAuthPage) {
    return null;
  }
  // Check if the user has the 'ADMIN' role
  const isAdmin = ROLES.ADMIN;
  console.log("isadmin", isAdmin);

  const navigation = [
    { name: "Home", href: "/", icon: Home, adminOnly: false },
    { name: "Books", href: "/books", icon: BookOpen, adminOnly: false },
    { name: "Emails", href: "/emails", icon: Mail, adminOnly: false },
    { name: "Quotation", href: "/quotation", icon: FileText, adminOnly: false },
    { name: "Management", href: "/management", icon: Building, adminOnly: false },
  ];
  // Filter the navigation items based on the user's role
  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="bg-[var(--background)] shadow-lg border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">BookManager</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                    ? "text-[var(--primary)] bg-[var(--muted)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>


          <div className="hidden md:flex items-center space-x-4">
      
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center space-x-2"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            )}
            {session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Welcome, {session.user.name || session.user.email}
                </span>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[var(--primary)] hover:opacity-90">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(item.href)
                      ? "text-[var(--primary)] bg-[var(--muted)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)]"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Menu */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              {mounted && (
                <div className="mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
              {session ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-[var(--muted-foreground)]">
                    Welcome, {session.user.name || session.user.email}
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-[var(--primary)] hover:opacity-90">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
