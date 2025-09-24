"use client";

import { FileText, Plus, Download, Edit, Eye, Trash2, Search, Filter, Calendar, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function QuotationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation Management</h1>
            <p className="text-gray-600 text-lg">
              Create and manage quotations for your book sales and services
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
                    placeholder="Search quotations..."
                    className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Quotation</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quotation Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">45</div>
              <div className="text-sm text-blue-700">Total Quotes</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">$12,450</div>
              <div className="text-sm text-green-700">Total Value</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
              <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">8</div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
              <Download className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">23</div>
              <div className="text-sm text-purple-700">Approved</div>
            </div>
          </div>

          {/* Placeholder Content */}
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Quotation System Coming Soon</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're developing a powerful quotation management system that will help you:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <Plus className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Create Quotes</h4>
                <p className="text-sm text-gray-600">Generate professional quotations with custom pricing and terms</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <Edit className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Manage Templates</h4>
                <p className="text-sm text-gray-600">Create and customize quotation templates for different services</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <Download className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Export & Share</h4>
                <p className="text-sm text-gray-600">Export quotations as PDF and share with clients via email</p>
              </div>
            </div>

            {/* Feature Preview */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white mb-8">
              <h4 className="text-xl font-semibold mb-4">Planned Features</h4>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h5 className="font-semibold mb-2">📋 Quotation Builder</h5>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li>• Drag-and-drop interface</li>
                    <li>• Pre-built templates</li>
                    <li>• Custom pricing calculations</li>
                    <li>• Terms and conditions</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">📊 Analytics & Tracking</h5>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li>• Quote conversion rates</li>
                    <li>• Revenue tracking</li>
                    <li>• Client response analytics</li>
                    <li>• Performance insights</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Get Started?</h4>
              <p className="text-gray-600 mb-4">
                The quotation system will be available soon. In the meantime, you can manage your books and prepare for the launch!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sample Quote
                </Button>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Eye className="w-4 h-4 mr-2" />
                  View Templates
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
