"use client";

import { useState } from "react";
import { Mail, Send, RefreshCw, Inbox, Star, FileText, Send as SendIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import EmailList from "../components/email/email-list";
import EmailDetail from "../components/email/email-detail";
import ComposeEmail from "../components/email/compose-email";

export default function EmailsPage() {
  const [selectedEmailUid, setSelectedEmailUid] = useState<number | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("inbox");

  const handleEmailSelect = (email: any) => {
    setSelectedEmailUid(email.uid);
  };

  const handleBackToList = () => {
    setSelectedEmailUid(null);
  };

  const handleComposeClose = () => {
    setShowCompose(false);
  };

  const handleEmailSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    // { id: "favourite", label: "Favourite", icon: Star },
    // { id: "draft", label: "Draft", icon: FileText },
    // { id: "sent", label: "Sent", icon: SendIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Tabs */}
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-amber-300 text-amber-700"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="h-8 px-3 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCompose(true)}
                className="h-8 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Send className="w-3 h-3 mr-1" />
                Compose
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!selectedEmailUid ? (
          <div key={refreshTrigger}>
            <EmailList 
              onEmailSelect={handleEmailSelect} 
              selectedEmailUid={selectedEmailUid || undefined}
            />
          </div>
        ) : (
          <EmailDetail 
            emailUid={selectedEmailUid} 
            onBack={handleBackToList}
          />
        )}
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <ComposeEmail 
          onClose={handleComposeClose}
          onEmailSent={handleEmailSent}
        />
      )}
    </div>
  );
}
