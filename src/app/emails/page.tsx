"use client";

import { Mail, Send, Inbox, Archive, Trash2, Search, Filter, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function EmailsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Management</h1>
            <p className="text-gray-600 text-lg">
              Manage your communications and email notifications
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
          {/* Search and Filter Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search emails..."
                    className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Compose</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Email Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
              <Inbox className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">24</div>
              <div className="text-sm text-blue-700">Inbox</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
              <Send className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">12</div>
              <div className="text-sm text-yellow-700">Sent</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <Archive className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">156</div>
              <div className="text-sm text-gray-700">Archived</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
              <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">8</div>
              <div className="text-sm text-red-700">Trash</div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Email System Coming Soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We&apos;re working on a comprehensive email management system that will allow you to:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <Send className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Send Emails</h4>
                <p className="text-sm text-gray-600">Compose and send emails to customers and suppliers</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <Inbox className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Manage Inbox</h4>
                <p className="text-sm text-gray-600">Organize and respond to incoming emails efficiently</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <Filter className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Smart Filtering</h4>
                <p className="text-sm text-gray-600">Advanced filtering and search capabilities</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
              <h4 className="text-lg font-semibold mb-2">Stay Tuned!</h4>
              <p className="opacity-90">
                The email management system will be available in the next update. 
                We&apos;re building something amazing for you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
