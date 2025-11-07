"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { apiFunctions } from "@/services/api.service";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

interface Email {
    id: string;
    threadId: string;
    from: string;
    subject: string;
    date: string;
    status?: string;
}

interface EmailListProps {
    onEmailSelect?: (email: Email) => void;
    selectedEmailUid?: string;
}

export default function EmailList({ onEmailSelect, selectedEmailUid }: EmailListProps) {
    const router = useRouter();
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const response = await apiFunctions.getGoogleEmail();
            console.log("Resposnse ****************", response);




            const emailsWithStatus = (response || []).map((email: Email) => ({
                ...email,
                status: email.status || 'pending'
            }));

            if (emailsWithStatus.length === 0) {
                setEmails([]);
                setError('No emails found');
            } else {
                setEmails(emailsWithStatus);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const updateEmailStatus = async (emailUid: string, newStatus: string) => {
        setEmails(prevEmails =>
            prevEmails.map(email =>
                email.id === emailUid
                    ? { ...email, status: newStatus }
                    : email
            )
        );

        setRecentlyUpdated(emailUid);
        setTimeout(() => setRecentlyUpdated(null), 2000);

        try {
            const response = await apiFunctions.updateEmailStatus(emailUid, newStatus);
            if (response.success) {
                toast.success(response.message || 'Email status updated successfully');
            }
            if (!response.success) {
                throw new Error(response.message || 'Failed to update email status');
            }
        } catch (err) {
            console.warn('Server update failed, but local update succeeded:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / 3600000;
        if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffInHours < 168) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getSenderName = (from: string) => {
        const match = from.match(/^(.+?)\s*<(.+)>$/);
        return match ? match[1].trim() : from.split('@')[0];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'done': return 'bg-green-100 text-green-800 border-green-200';
            case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'done': return 'bg-green-500';
            case 'in-progress': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const statusOptions = ['pending', 'in-progress', 'done'];

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
        <div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {emails.map((email) => (
                    <div
                        key={email.id}
                        className={`flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedEmailUid === email.id ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''}`}
                    >
                        <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => {
                                if (onEmailSelect) onEmailSelect(email);
                                else router.push(`/emails/${email.id}`);
                            }}
                        >
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
                                <div className="flex items-center space-x-2 ml-4">
                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {formatDate(email.date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="ml-4 " onClick={(e) => e.stopPropagation()}>
                            <Select
                                value={email.status || 'pending'}
                                onValueChange={(newStatus) => {
                                    updateEmailStatus(email.id, newStatus);
                                }}
                            >
                                <SelectTrigger className={`h-8 text-xs px-3 py-1 rounded-full border transition-all duration-100 ${getStatusColor(email.status || 'pending')} ${recentlyUpdated === email.id ? "" : ''}`}>
                                    <SelectValue placeholder="Set status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg">
                                    {statusOptions.map((status) => (
                                        <SelectItem key={status} value={status} className="text-sm hover:bg-gray-50 cursor-pointer">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(status)}`} />
                                                <span className="capitalize">{status}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
