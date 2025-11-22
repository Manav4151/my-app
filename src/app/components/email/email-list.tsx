"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Paperclip, Search, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
    
    // Search and filter state
    const [mainSearchText, setMainSearchText] = useState<string>("");
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        from: "",
        hasWords: "",
        dateWithin: "all",
        status: "all"
    });

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async (searchQuery?: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunctions.getGoogleEmail(searchQuery);
            console.log("Response ****************", response);

            const emailsWithStatus = (response || []).map((email: Email) => ({
                ...email,
                status: email.status || 'pending'
            }));

            // Empty results are not errors - they're just no matches
            setEmails(emailsWithStatus);
            setError(null);
        } catch (err) {
            // Only set error for actual API/network errors
            setError(err instanceof Error ? err.message : 'An error occurred');
            setEmails([]);
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
            case 'pending': return 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20';
            case 'done': return 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20';
            case 'in-progress': return 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20';
            default: return 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border)]';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-[var(--warning)]';
            case 'done': return 'bg-[var(--success)]';
            case 'in-progress': return 'bg-[var(--primary)]';
            default: return 'bg-[var(--text-secondary)]';
        }
    };

    const statusOptions = ['pending', 'in-progress', 'done'];

    // Build Gmail query string from advanced filters
    const buildAdvancedQuery = () => {
        const queryParts: string[] = [];

        if (advancedFilters.from.trim()) {
            queryParts.push(`from:${advancedFilters.from.trim()}`);
        }

        if (advancedFilters.hasWords.trim()) {
            queryParts.push(advancedFilters.hasWords.trim());
        }

        if (advancedFilters.dateWithin !== "all") {
            let dateQuery = "";
            switch (advancedFilters.dateWithin) {
                case "1d":
                    dateQuery = "newer_than:1d";
                    break;
                case "7d":
                    dateQuery = "newer_than:7d";
                    break;
                case "1m":
                    dateQuery = "newer_than:1m";
                    break;
            }
            if (dateQuery) queryParts.push(dateQuery);
        }

        if (advancedFilters.status !== "all") {
            if (advancedFilters.status === "unread") {
                queryParts.push("is:unread");
            } else if (advancedFilters.status === "read") {
                queryParts.push("is:read");
            }
        }

        return queryParts.join(" ");
    };

    // Handle search from main search bar
    const handleMainSearch = () => {
        if (mainSearchText.trim()) {
            fetchEmails(mainSearchText.trim());
        } else {
            fetchEmails();
        }
    };

    // Handle search from advanced filters
    const handleAdvancedSearch = () => {
        const query = buildAdvancedQuery();
        if (query) {
            setMainSearchText(query); // Update main search bar to show the query
            fetchEmails(query);
        } else {
            fetchEmails(); // If no filters, fetch all
        }
        setIsDropdownOpen(false);
    };

    // Handle Enter key in main search
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleMainSearch();
        }
    };

    // Clear all filters
    const handleClearFilters = () => {
        setMainSearchText("");
        setAdvancedFilters({
            from: "",
            hasWords: "",
            dateWithin: "all",
            status: "all"
        });
        fetchEmails();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    // Show error only for actual errors (not empty results)
    if (error) {
        return (
            <div className="text-center py-8">
                <Mail className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Failed to load emails</h3>
                <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                <Button onClick={() => fetchEmails(mainSearchText || undefined)} size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Bar and Advanced Filter Toggle */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search mail"
                            value={mainSearchText}
                            onChange={(e) => setMainSearchText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-10 pr-4"
                        />
                    </div>
                    <Button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                    {mainSearchText && (
                        <Button
                            onClick={handleClearFilters}
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </Button>
                    )}
                    <Button
                        onClick={handleMainSearch}
                        size="sm"
                        className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                    >
                        Search
                    </Button>
                </div>

                {/* Advanced Filter Dropdown */}
                {isDropdownOpen && (
                    <div className="mt-4 p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    From
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., saarang@example.com"
                                    value={advancedFilters.from}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, from: e.target.value })
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Has the words
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., report"
                                    value={advancedFilters.hasWords}
                                    onChange={(e) =>
                                        setAdvancedFilters({ ...advancedFilters, hasWords: e.target.value })
                                    }
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Date within
                                </label>
                                <Select
                                    value={advancedFilters.dateWithin}
                                    onValueChange={(value) =>
                                        setAdvancedFilters({ ...advancedFilters, dateWithin: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All time</SelectItem>
                                        <SelectItem value="1d">1 day</SelectItem>
                                        <SelectItem value="7d">7 days</SelectItem>
                                        <SelectItem value="1m">1 month</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Status
                                </label>
                                <Select
                                    value={advancedFilters.status}
                                    onValueChange={(value) =>
                                        setAdvancedFilters({ ...advancedFilters, status: value })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="unread">Unread</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                onClick={() => setIsDropdownOpen(false)}
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdvancedSearch}
                                size="sm"
                                className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Email List or No Results Message */}
            {emails.length === 0 ? (
                <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] p-8">
                    <div className="text-center">
                        <Mail className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No emails found</h3>
                        <p className="text-[var(--text-secondary)] mb-4">
                            {mainSearchText || Object.values(advancedFilters).some(v => v !== "" && v !== "all") 
                                ? "No emails match your search criteria" 
                                : "Your inbox is empty"}
                        </p>
                        {(mainSearchText || Object.values(advancedFilters).some(v => v !== "" && v !== "all")) && (
                            <Button onClick={handleClearFilters} size="sm" className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden">
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            className={`flex items-center p-3 border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors ${selectedEmailUid === email.id ? 'bg-[var(--primary)]/10 border-l-4 border-l-[var(--primary)]' : ''}`}
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
                                            <span className="font-medium text-[var(--text-primary)] truncate">
                                                {getSenderName(email.from)}
                                            </span>
                                            <span className="text-[var(--text-secondary)]">•</span>
                                            <span className="text-[var(--text-secondary)] truncate">
                                                {email.subject || '(No Subject)'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                                            {email.from}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
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
                                    <SelectContent className="bg-[var(--surface)] border-[var(--border)] rounded-lg shadow-lg">
                                        {statusOptions.map((status) => (
                                            <SelectItem key={status} value={status} className="text-sm hover:bg-[var(--surface-hover)] cursor-pointer">
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
            )}
        </div>
    );
}
