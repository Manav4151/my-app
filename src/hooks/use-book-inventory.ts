"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFunctions, ApiError } from "@/services/api.service";
import { Book, BookFilters, PaginationData } from "@/types/books";

export function useBookInventory() {
    const router = useRouter();

    // State
    const [data, setData] = useState<{ books: Book[]; pagination: PaginationData } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [pendingFilters, setPendingFilters] = useState<BookFilters>({});
    const [appliedFilters, setAppliedFilters] = useState<BookFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    // API Load
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(limit) });
            Object.entries(appliedFilters).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });

            const response = await apiFunctions.getBooks(params);
            if (!response.success) throw new Error(response.message || 'Failed');
            setData(response);
        } catch (err: any) {
            const msg = err instanceof ApiError ? err.message : "Failed to fetch books";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, limit, appliedFilters]);

    useEffect(() => { loadData(); }, [loadData]);

    // Handlers
    const applyFilters = () => { setPage(1); setAppliedFilters({ ...pendingFilters }); };
    const clearFilters = () => { setPendingFilters({}); setAppliedFilters({}); setPage(1); };

    const handleSelectBook = (id: string) => {
        setSelectedBooks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (!data?.books) return;
        if (selectedBooks.length === data.books.length) setSelectedBooks([]);
        else setSelectedBooks(data.books.map(b => b._id));
    };

    const handleDeleteSelected = async () => {
        if (!selectedBooks.length) return;
        if (confirm(`Delete ${selectedBooks.length} items?`)) {
            setLoading(true);
            try {
                const res = await apiFunctions.deleteBooks(selectedBooks);
                if (res.success) {
                    toast.success("Deleted successfully");
                    setSelectedBooks([]);
                    setSelectionMode(false);
                    loadData();
                }
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return {
        data, loading, error,
        page, setPage,
        selectedBooks, selectionMode, setSelectionMode, setSelectedBooks,
        pendingFilters, setPendingFilters,
        showFilters, setShowFilters,
        refresh: loadData,
        applyFilters, clearFilters,
        handleSelectBook, handleSelectAll, handleDeleteSelected,
        router
    };
}