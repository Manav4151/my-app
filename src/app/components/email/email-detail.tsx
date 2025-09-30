"use client";

import { useState, useEffect } from "react";
import { Mail, Paperclip, Download, ArrowLeft, User, Calendar, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface EmailDetail {
  uid: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  html?: string;
  text?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
}

interface EmailDetailProps {
  emailUid: number;
  onBack: () => void;
}

export default function EmailDetail({ emailUid, onBack }: EmailDetailProps) {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (emailUid) {
      fetchEmailDetail();
    }
  }, [emailUid]);

  const fetchEmailDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/emails/${emailUid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }
      
      const data = await response.json();
      setEmail(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching email detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadAttachment = async (filename: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/emails/${emailUid}/attachments/${filename}`);
      
      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      alert('Failed to download attachment');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Mail className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load email</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
        <Button onClick={fetchEmailDetail} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center py-8">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Email not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="w-8 h-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {email.subject || '(No Subject)'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(email.date)}</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium text-gray-900">{email.from}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-medium text-gray-900">{email.to}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-gray-500" />
            Attachments ({email.attachments.length})
          </h3>
          <div className="space-y-2">
            {email.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • {attachment.contentType}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  onClick={() => downloadAttachment(attachment.filename)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email Content */}
      <div className="flex-1 p-4 overflow-auto">
        {email.html ? (
          <div
            className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : (
          <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
            {email.text || 'No content available'}
          </div>
        )}
      </div>
    </div>
  );
}
