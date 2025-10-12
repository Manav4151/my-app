"use client";

import { useAuth } from "./components/auth-context";
import { Button } from "./components/ui/button";
import { BookOpen, Mail, FileText, BarChart3, Users, Database } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { session } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Book Management",
      description: "Comprehensive book inventory with ISBN validation, pricing, and detailed information tracking.",
      href: "/books",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Mail,
      title: "Email System",
      description: "Manage communications and notifications with integrated email functionality.",
      href: "/emails",
      color: "from-green-500 to-green-600"
    },
    {
      icon: FileText,
      title: "Quotations",
      description: "Generate and manage quotations for book sales and services.",
      href: "/quotation",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const stats = [
    { label: "Total Books", value: "1,234", icon: BookOpen },
    { label: "Active Users", value: "45", icon: Users },
    { label: "Data Records", value: "5,678", icon: Database },
    { label: "Reports", value: "12", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              BookManager
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive book management system designed to streamline your inventory,
            track pricing, and manage your book collection with ease.
          </p>

          {session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/books">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 text-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Manage Books
                </Button>
              </Link>
              <Link href="/books/insert">
                <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8 py-3 text-lg">
                  Add New Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 px-8 py-3 text-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools and features that make BookManager the perfect solution for your book management needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} href={feature.href}>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust BookManager for their book inventory needs.
          </p>
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-amber-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-amber-600 px-8 py-3 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}