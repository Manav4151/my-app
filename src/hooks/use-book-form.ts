"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { debounce } from 'lodash';
import { apiFunctions } from "@/services/api.service";
import { validateISBN, normalizeISBN } from "@/lib/isbn-utils";

// Define types internally or import from a shared types file
export interface BookData {
    title: string;
    author: string;
    year: number | null;
    isbn?: string;
    other_code?: string;
    edition?: string;
    binding_type: string;
    classification: string;
    remarks?: string;
    imprint?: string;
    publisher_exclusive?: string;
}

export interface PricingData {
    source: string;
    rate: number;
    discount: number;
    currency: string;
}

export interface CheckResponse {
    bookStatus: "NEW" | "DUPLICATE" | "CONFLICT";
    pricingStatus?: "ADD_PRICE" | "UPDATE_PRICE" | "NO_CHANGE";
    message: string;
    details: any;
}

export function useBookForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<"form" | "check">("form");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBookId, setEditBookId] = useState<string | null>(null);

    // Data State
    const [bookData, setBookData] = useState<BookData>({
        title: "", author: "", year: 0, isbn: "", other_code: "",
        edition: "", binding_type: "", classification: "", remarks: "",
        imprint: "", publisher_exclusive: "",
    });
    const [publisherData, setPublisherData] = useState({ publisher_name: "" });
    const [pricingData, setPricingData] = useState<PricingData>({
        source: "", rate: 0, discount: 0, currency: "USD",
    });

    // UI State
    const [isNonISBN, setIsNonISBN] = useState(false);
    const [isbnError, setIsbnError] = useState("");
    const [checkResponse, setCheckResponse] = useState<CheckResponse | null>(null);
    const [bookSuggestions, setBookSuggestions] = useState<any[]>([]);
    const [publisherSuggestions, setPublisherSuggestions] = useState<any[]>([]);

    // --- Logic ---

    useEffect(() => {
        const editParam = searchParams.get('edit');
        const bookIdParam = searchParams.get('bookId');
        const bookId = editParam || bookIdParam;

        if (bookId) {
            setIsEditMode(true);
            setEditBookId(bookId);
            fetchBook(bookId);
        }
    }, [searchParams]);

    const fetchBook = async (id: string) => {
        setInitialLoading(true);
        try {
            const res = await apiFunctions.getBookDetails(id);
            if (res.success && res.book) {
                setBookData({
                    ...res.book,
                    year: res.book.year || 0,
                });
                setPublisherData({ publisher_name: res.book.publisher_name || "" });
                setIsNonISBN(!!res.book.other_code && !res.book.isbn);

                if (res.pricing?.[0]) {
                    const p = res.pricing[0];
                    setPricingData({
                        source: p.source || "", rate: p.rate || 0,
                        discount: p.discount || 0, currency: p.currency || "USD",
                    });
                }
            }
        } catch (err) {
            toast.error("Failed to load book data");
        } finally {
            setInitialLoading(false);
        }
    };

    // Suggestions
    const debouncedFetchBooks = useCallback(debounce(async (q) => {
        if (q.length < 2) return setBookSuggestions([]);
        const res = await apiFunctions.getBookSuggestions(q);
        if (res.success) setBookSuggestions(res.books);
    }, 300), []);

    const debouncedFetchPublishers = useCallback(debounce(async (q) => {
        if (q.length < 2) return setPublisherSuggestions([]);
        const res = await apiFunctions.getPublisherSuggestions(q);
        if (res.success) setPublisherSuggestions(res.publishers);
    }, 300), []);

    // Handlers
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBookData({ ...bookData, title: e.target.value });
        debouncedFetchBooks(e.target.value);
    };

    const handlePublisherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPublisherData({ publisher_name: e.target.value });
        debouncedFetchPublishers(e.target.value);
    };

    const handleISBNChange = (val: string) => {
        const norm = normalizeISBN(val);
        setBookData({ ...bookData, isbn: norm });
        setIsbnError((val && !validateISBN(val)) ? "Invalid ISBN" : "");
    };

    const handleNonISBNToggle = (checked: boolean) => {
        setIsNonISBN(checked);
        if (checked) {
            setBookData(prev => ({ ...prev, isbn: "", other_code: "" }));
            setIsbnError("");
        } else {
            setBookData(prev => ({ ...prev, other_code: "", isbn: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!isNonISBN && (!bookData.isbn || !validateISBN(bookData.isbn))) {
            return setIsbnError("Valid ISBN required");
        }
        if (isNonISBN && !bookData.other_code?.trim()) {
            return toast.error("Other code required");
        }

        setLoading(true);
        try {
            const sanitized = { ...bookData, year: bookData.year === 0 ? null : bookData.year };

            if (isEditMode && editBookId) {
                const res = await apiFunctions.updateBook(editBookId, { bookData: sanitized, pricingData });
                if (!res.success) throw new Error();
                toast.success("Updated successfully");
                router.push(`/books/${editBookId}`);
            } else {
                const res = await apiFunctions.checkBookDuplicate({ bookData: sanitized, pricingData, publisherData });
                const result = await res.data; // Based on your original code structure

                // Handle both conflict (409) and success (200)
                if (result.success || res.statusCode === 409) {
                    setCheckResponse(result);
                    setStep("check");
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (err) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (!checkResponse) return;
        setLoading(true);
        try {
            const sanitized = { ...bookData, year: bookData.year === 0 ? null : bookData.year };
            const payload = {
                bookData: sanitized, pricingData, publisherData,
                status: checkResponse.bookStatus,
                pricingAction: action,
                bookId: checkResponse.details?.bookId,
                pricingId: checkResponse.details?.pricingId,
            };

            const res = await apiFunctions.createBook(payload);
            if (!res.success) throw new Error(res.message);

            toast.success(res.message || "Success!");
            router.push(res.book?._id ? `/books/${res.book._id}` : "/books");
        } catch (err: any) {
            toast.error(err.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        step, setStep, loading, initialLoading, isEditMode, editBookId,
        bookData, setBookData, publisherData, pricingData, setPricingData,
        isNonISBN, isbnError, checkResponse,
        bookSuggestions, setBookSuggestions,
        publisherSuggestions, setPublisherSuggestions,
        router,
        // Handlers
        handleTitleChange, handlePublisherChange, handleISBNChange,
        handleNonISBNToggle, handleSubmit, handleAction,
        // Helpers
        setPublisherData,
    };
}