"use client";

import { useState } from "react";
import { Send, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailList from "@/components/email/email-list";
import ComposeEmail from "@/components/email/compose-email";
import { apiFunctions } from "@/services/api.service";
import { toast } from "sonner";

export default function EmailsPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("inbox");
  const [showInbox, setShowInbox] = useState(false);
  const handleComposeClose = () => {
    setShowCompose(false);
  };

  const handleEmailSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  const handleGoogleAuth = async () => {
    try {
      const res = await apiFunctions.authGoogle();
      if (res.url) {
        window.location.href = res.url
      } else {
        toast.error("Failed to authenticate with Google");
      }
    } catch (error) {
      throw error;
    }
  };

  const tabs = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    // { id: "favourite", label: "Favourite", icon: Star },
    // { id: "draft", label: "Draft", icon: FileText },
    // { id: "sent", label: "Sent", icon: SendIcon },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Navigation */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]">
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
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? "border-[var(--primary)] text-[var(--primary)]"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border)]"
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
                onClick={handleGoogleAuth}
                className="h-8 px-3 text-xs border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Google Mail
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="h-8 px-3 text-xs border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setShowCompose(true)}
                className="h-8 px-3 text-xs bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
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
        <div key={refreshTrigger}>
          <EmailList />
        </div>
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
