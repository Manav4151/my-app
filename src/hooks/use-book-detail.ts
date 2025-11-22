"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFunctions } from "@/services/api.service";
import { useRouter } from "next/navigation";

// Define interfaces (or import from @/types/book)
export interface BookDetail {
  _id: string;
  title: string;
  author: string;
  year: number;
  publisher_name: string;
  isbn?: string;
  edition?: string;
  binding_type: string;
  classification: string;
  remarks?: string;
}

export interface Pricing {
  _id: string;
  rate: number;
  discount: number;
  source: string;
  currency: string;
  last_updated: string;
}

export function useBookDetail(bookId: string) {
  const router = useRouter();
  const [data, setData] = useState<{ book: BookDetail; pricing: Pricing[]; statistics: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DUMMY DATA (Moved to Logic) ---
  const lastPurchaseData = {
    date: "2025-09-15T10:30:00Z",
    edition: "2022 Revised Edition",
    price: 450.00,
    currency: "INR",
    customer: "Central Library",
  };

  const fetchBookDetails = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunctions.getBookDetails(bookId);
      if (!response.success) throw new Error(response.message || "Failed to fetch");
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to load book");
      toast.error("Failed to load book details");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { fetchBookDetails(); }, [fetchBookDetails]);

  const markAsOutOfPrint = async () => {
    try {
      const res = await apiFunctions.markAsOutOfPrint(bookId);
      if (!res.success) throw new Error(res.message);
      toast.success("Marked as out of print");
      fetchBookDetails(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  return {
    data,
    loading,
    error,
    lastPurchaseData, // Exposed to UI
    markAsOutOfPrint,
    refresh: fetchBookDetails,
    router
  };
}