
"use client";

import { useState, useEffect, useCallback, use, useRef } from "react"; // Ensure useRef is imported
import { useRouter } from "next/navigation";
import { Mail, Paperclip, Download, ArrowLeft, User, Calendar, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface EmailDetail {
    uid: string;
    from: string;
    to: string;
    subject: string;
    date: string;
    status?: string;
    html?: string;
    text?: string;
    attachments: Array<{
        filename: string;
        contentType: string;
        size: number;
    }>;
}

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [email, setEmail] = useState<EmailDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // FIX: Added the missing useRef declaration here
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    const adjustIframeHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
            const body = iframe.contentWindow.document.body;
            if (body && body.scrollHeight > 0) {
                const newHeight = body.scrollHeight + 20; // Add a small buffer
                iframe.style.height = `${newHeight}px`;
            }
        }
    }, []);

    const fetchEmailDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/emails/${resolvedParams.id}`);

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
    }, [resolvedParams.id]);

    useEffect(() => {
        if (resolvedParams.id) {
            fetchEmailDetail();
        }
    }, [resolvedParams.id, fetchEmailDetail]);

    const downloadAttachment = async (filename: string) => {
        try {
            const response = await fetch(`${API_URL}/api/emails/${resolvedParams.id}/attachments/${filename}`);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'done':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
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
            </div>
        );
    }

    if (!email) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
                <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Email not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="w-8 h-8 p-0"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <h1 className="text-lg font-semibold text-gray-900">Email Detail</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Email Header */}
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {email.subject || '(No Subject)'}
                                    </h2>
                                    {email.status && (
                                        <div
                                            className={`inline-flex items-center text-xs px-3 py-1 rounded-full border ${getStatusColor(email.status)}`}
                                        >
                                            <span className="capitalize">{email.status}</span>
                                        </div>
                                    )}
                                </div>
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

                    {/* Email Content */}
                    <div className="flex-1 p-4 overflow-auto border-t border-gray-200 ">
                        {email.html ? (
                            <iframe
                                ref={iframeRef}
                                onLoad={adjustIframeHeight}
                                srcDoc={`
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" >
                                        <style>
                                            html, body {
                                                margin: 0;
                                                padding: 0;
                                                overflow: hidden;
                                              
                                            }
                                            body {
                                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                line-height: 1.6;
                                                color: #333;
                                            }
                                            * {
                                                
                                                box-sizing: border-box !important;
                                            }
                                            img { height: auto !important; }
                                            table {
                                              
                                                border-collapse: collapse !important;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        ${email.html}
                                    </body>
                                    </html>
                                `}
                                className="w-full border-0"
                                scrolling="no"
                                sandbox="allow-same-origin"
                                title="Email Content"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                                {email.text || 'No content available'}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    {email.attachments && email.attachments.length > 0 && (
                        <div className="border-t border-gray-200 p-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                Attachments ({email.attachments.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {email.attachments.map((attachment, index) => (
                                    <div key={index} className="border rounded-lg p-3 flex items-center gap-3 bg-gray-50/50 hover:bg-gray-100/70 transition">
                                        <div className="flex-shrink-0 bg-white p-2 rounded-md border shadow-sm">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate" title={attachment.filename}>
                                                {attachment.filename}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatFileSize(attachment.size)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => downloadAttachment(attachment.filename)}
                                        >
                                            <Download className="w-4 h-4 text-gray-600" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}