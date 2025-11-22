"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, Paperclip, Download, ArrowLeft, FileText, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFunctions } from "@/services/api.service";
import { BookSelectionDialog } from "@/components/books/BookSelectionDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface EmailDetail {
    messageId: string;
    fromEmail: string;
    fromName: string;
    to?: string;
    subject: string;
    dateOfMessage: string;
    status?: string;
    body?: string;
    text?: string;
    attachments: Array<{
        filename: string;
        mimeType: string;
        size?: number;
        attachmentId: string;
        dataUrl?: string | null; // Base64 data URL for direct use
    }>;
}

export default function EmailDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [email, setEmail] = useState<EmailDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [bookDialogOpen, setBookDialogOpen] = useState(false);

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
            const response = await apiFunctions.getGoogleEmailDetail(resolvedParams.id);
            console.log("Response details", response);
            setEmail(response);
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

    const downloadAttachment = (filename: string) => {
        try {
            // Find attachment in email data
            const attachment = email?.attachments?.find(att => att.filename === filename);

            if (attachment?.dataUrl) {
                // Use dataUrl directly from email response
                const link = document.createElement('a');
                link.href = attachment.dataUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Fallback to API call if dataUrl not available
                apiFunctions.downloadEmailAttachment(resolvedParams.id, filename)
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    })
                    .catch(err => {
                        console.error('Error downloading attachment:', err);
                        alert('Failed to download attachment');
                    });
            }
        } catch (err) {
            console.error('Error downloading attachment:', err);
            alert('Failed to download attachment');
        }
    };

    const previewPdfAttachment = (filename: string) => {
        try {
            // Find attachment in email data
            const attachment = email?.attachments?.find(att => att.filename === filename);

            if (attachment?.dataUrl) {
                // Convert data URL to Blob and open as blob URL for better compatibility
                const [meta, b64] = attachment.dataUrl.split(',');
                const mimeMatch = meta.match(/data:(.*?);base64/);
                const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
                const byteString = atob(b64);
                const len = byteString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mime });
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Do not revoke immediately; the new tab needs the URL
            } else {
                // Fallback to API call if dataUrl not available
                apiFunctions.downloadEmailAttachment(resolvedParams.id, filename)
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        window.open(url, '_blank');
                        // Note: We don't revoke the URL immediately as the new tab needs it
                        // The browser will clean it up when the tab is closed
                    })
                    .catch(err => {
                        console.error('Error loading PDF for preview:', err);
                        alert('Failed to load PDF for preview');
                    });
            }
        } catch (err) {
            console.error('Error loading PDF for preview:', err);
            alert('Failed to load PDF for preview');
        }
    };

    const isPdfFile = (mimeType: string, filename: string) => {
        return mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
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
                return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
            case 'done':
                return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20';
            case 'in-progress':
                return 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20';
            default:
                return 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]';
        }
    };

    const handleBooksSelected = (bookIds: string[]) => {
        const params = new URLSearchParams();
        bookIds.forEach(id => params.append("id", id));

        // Add email info to query params
        if (email) {
            params.append("emailMessageId", email.messageId);
            params.append("emailSender", email.fromEmail);
            params.append("emailSubject", email.subject);
            params.append("emailReceivedAt", email.dateOfMessage);
            // Use text or body for snippet, limit to 200 chars
            const snippetText = email.text || (email.body ? email.body.replace(/<[^>]*>/g, '').substring(0, 200) : '');
            if (snippetText) {
                params.append("emailSnippet", snippetText.substring(0, 200));
            }
        }

        router.push(`/quotation/preview?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center py-8">
                    <div className="text-[var(--error)] mb-4">
                        <Mail className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Failed to load email</p>
                        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
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
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)]">Email not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="border-b border-[var(--border)] bg-[var(--surface)]">
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
                            <h1 className="text-lg font-semibold text-[var(--text-primary)]">Email Detail</h1>
                        </div>
                        <Button
                            className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white flex items-center space-x-2"
                            onClick={() => setBookDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Quotation</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">

                    {/* === MODIFIED EMAIL HEADER START === */}
                    <div className="p-4">
                        {/* Subject & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <h2 className="text-2xl font-semibold text-[var(--text-primary)] break-words flex-1">
                                {email.subject || '(No Subject)'}
                            </h2>
                            {email.status && (
                                <div
                                    className={`flex-shrink-0 inline-flex items-center text-xs px-3 py-1 rounded-full border ${getStatusColor(email.status)}`}
                                >
                                    <span className="capitalize">{email.status}</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata (From, To, Date) */}
                        <div className="space-y-3 border-t border-[var(--border)] pt-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 text-xs font-medium text-[var(--text-secondary)]">From:</div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">
                                    {email.fromName}
                                    <span className="text-[var(--text-secondary)] font-normal ml-1">
                                        &lt;{email.fromEmail}&gt;
                                    </span>
                                </div>
                            </div>

                            {email.to && (
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-12 text-xs font-medium text-[var(--text-secondary)]">To:</div>
                                    <div className="text-sm font-medium text-[var(--text-primary)]">{email.to}</div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 text-xs font-medium text-[var(--text-secondary)]">Date:</div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {formatDate(email.dateOfMessage)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* === MODIFIED EMAIL HEADER END === */}


                    {/* Email Content */}
                    <div className="flex-1 p-4 overflow-auto border-t border-[var(--border)] ">
                        {email.body ? (
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
                                            img { max-width: 100% !important; height: auto !important; }
                                            table {
                                                border-collapse: collapse !important;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        ${email.body}
                                    </body>
                                    </html>
                                `}
                                className="w-full border-0"
                                scrolling="no"
                                sandbox="allow-same-origin"
                                title="Email Content"
                            />
                        ) : (
                            <div className="whitespace-pre-wrap text-[var(--text-primary)] text-sm leading-relaxed">
                                {email.text || 'No content available'}
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    {email.attachments && email.attachments.length > 0 && (
                        <div className="border-t border-[var(--border)] p-4">
                            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-[var(--text-secondary)]" />
                                Attachments ({email.attachments.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {email.attachments.map((attachment, index) => (
                                    <div key={index} className="border border-[var(--border)] rounded-lg p-3 flex items-center gap-3 bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 transition">
                                        <div className="flex-shrink-0 bg-[var(--surface)] p-2 rounded-md border border-[var(--border)] shadow-sm">
                                            <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate" title={attachment.filename}>
                                                {attachment.filename}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {attachment.mimeType}
                                                {attachment.size ? (
                                                    <span className="ml-2">({formatFileSize(attachment.size)})</span>
                                                ) : null}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {isPdfFile(attachment.mimeType, attachment.filename) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => previewPdfAttachment(attachment.filename)}
                                                    title="Preview PDF"
                                                >
                                                    <Eye className="w-4 h-4 text-[var(--primary)]" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => downloadAttachment(attachment.filename)}
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4 text-[var(--text-secondary)]" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Book Selection Dialog for Creating Quotation */}
            <BookSelectionDialog
                open={bookDialogOpen}
                onOpenChange={setBookDialogOpen}
                onBooksSelected={handleBooksSelected}
                mode="create"
                buttonText="Generate Quotation"
            />
        </div>
    );
}