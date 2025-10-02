"use client";

import { useState, useEffect } from "react";
import { Mail, Paperclip, Clock } from "lucide-react";
import { Button } from "../ui/button";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";   
interface Email {
  uid: number;
  from: string;
  subject: string;
  date: string;
}

interface EmailListProps {
  onEmailSelect: (email: Email) => void;
  selectedEmailUid?: number;
}

export default function EmailList({ onEmailSelect, selectedEmailUid }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/emails`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getSenderName = (from: string) => {
    // Extract name from email format "Name <email@domain.com>"
    const match = from.match(/^(.+?)\s*<(.+)>$/);
    return match ? match[1].trim() : from.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load emails</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchEmails} size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
        <p className="text-gray-600">Your inbox is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {emails.map((email, index) => (
        <div
          key={email.uid}
          onClick={() => onEmailSelect(email)}
          className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
            selectedEmailUid === email.uid ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
          } ${index === emails.length - 1 ? 'border-b-0' : ''}`}
        >
          {/* Email Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 truncate">
                    {getSenderName(email.from)}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600 truncate">
                    {email.subject || '(No Subject)'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {email.from}
                </p>
              </div>
              
              {/* Date and Attachment */}
              <div className="flex items-center space-x-2 ml-4">
                <Paperclip className="w-3 h-3 text-gray-400" />
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {formatDate(email.date)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
