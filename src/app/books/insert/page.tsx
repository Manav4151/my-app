/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { BookOpen, ArrowLeft, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { debounce, set } from 'lodash';
// ISBN validation functions
// Remove all non-alphanumeric characters; keep digits and allow 'X' (uppercase) only as ISBN-10 check digit
const cleanIsbnInput = (raw: string): string => {
    if (!raw) return '';
    const upper = raw.toUpperCase();
    // Keep only digits and 'X'
    const alnum = upper.replace(/[^0-9X]/g, '');
    // If length > 10, it's potentially ISBN-13 → must be digits only
    if (alnum.length > 10) {
        return alnum.replace(/[^0-9]/g, '');
    }
    // For length <= 10, allow X but only at last position; if X appears earlier, remove it
    if (alnum.includes('X') && alnum.indexOf('X') !== alnum.length - 1) {
        return alnum.replace(/X/g, '');
    }
    return alnum;
};

const validateISBN10 = (cleanISBN: string): boolean => {
    // Check if it's exactly 10 characters
    if (cleanISBN.length !== 10) return false;

    // Check if all characters except the last are digits
    if (!/^\d{9}[\dX]$/.test(cleanISBN)) return false;

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanISBN[i]) * (10 - i);
    }

    // Handle the check digit
    const checkDigit = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9]);
    sum += checkDigit;

    return sum % 11 === 0;
};

const validateISBN13 = (cleanISBN: string): boolean => {
    // Check if it's exactly 13 characters and all digits
    if (cleanISBN.length !== 13 || !/^\d{13}$/.test(cleanISBN)) return false;

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(cleanISBN[i]);
        sum += digit * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(cleanISBN[12]);
};

const validateISBN = (isbn: string): boolean => {
    if (!isbn || isbn.trim() === '') return false;
    const cleanISBN = cleanIsbnInput(isbn);

    // Check if it's ISBN-10 or ISBN-13
    if (cleanISBN.length === 10) {
        return validateISBN10(cleanISBN);
    } else if (cleanISBN.length === 13) {
        return validateISBN13(cleanISBN);
    }

    return false;
};

// Helper function to normalize ISBN for comparison/storage (plain number, allow X only as ISBN-10 check digit)
const normalizeISBN = (isbn: string): string => {
    if (!isbn) return '';
    return cleanIsbnInput(isbn);
};

// Types based on the controller
interface BookData {
    title: string;
    author: string;
    year: number;
    isbn?: string;
    nonisbn?: string;
    other_code?: string;
    edition?: string;
    binding_type: string;
    classification: string;
    remarks?: string;
    // Added to handle populated publisher from API
    publisher?: { name: string };
}
interface PublisherSuggestion {
    name: string;
}
interface PricingData {
    source: string;
    rate: number;
    discount: number;
    currency: string;
}

interface PublisherData {
    publisher_name: string;
}
interface CheckResponse {
    bookStatus: "NEW" | "DUPLICATE" | "CONFLICT" | "AUTHOR_CONFLICT";
    pricingStatus?: "ADD_PRICE" | "UPDATE_PRICE" | "NO_CHANGE";
    message: string;
    existingBook?: any;
    newData?: BookData;
    conflictFields?: any;
    pricingAction?: "ADD_PRICE" | "UPDATE_POSSIBLE" | "NO_CHANGE";
    differences?: Array<{ field: string; existing: any; new: any }>;
    bookId?: string;
    pricingId?: string;
    details?: {
        conflictFields?: any;
        existingBook?: any;
        bookId?: string;
        pricingId?: string;
        differences?: any;
    };
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
function InsertBookPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState<"form" | "check" | "result">("form");
    const [loading, setLoading] = useState(false);
    const [checkResponse, setCheckResponse] = useState<CheckResponse | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBookId, setEditBookId] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(false);
    const [isNonISBN, setIsNonISBN] = useState(false);
    const [isbnError, setIsbnError] = useState("");
    // State for suggestions
    const [bookSuggestions, setBookSuggestions] = useState<BookData[]>([]);
    const [publisherSuggestions, setPublisherSuggestions] = useState<PublisherSuggestion[]>([]);
    const [bookData, setBookData] = useState<BookData>({
        title: "",
        author: "",
        year: 0,
        isbn: "",
        other_code: "",
        edition: "",
        binding_type: "",
        classification: "",
        remarks: "",
    });
    const [publisherData, setPublisherData] = useState<PublisherData>(
        {
            publisher_name: "",
        }
    );
    const [pricingData, setPricingData] = useState<PricingData>({
        source: "",
        rate: 0,
        discount: 0,
        currency: "USD",
    });

    // Handle URL parameters and fetch existing book data for edit mode
    useEffect(() => {
        const editParam = searchParams.get('edit');
        const bookIdParam = searchParams.get('bookId');

        if (editParam || bookIdParam) {
            const bookId = editParam || bookIdParam;
            if (bookId) {
                setIsEditMode(true);
                setEditBookId(bookId);
                fetchExistingBookData(bookId);
            }
        }
    }, [searchParams]);

    const fetchExistingBookData = async (bookId: string) => {
        try {
            setInitialLoading(true);
            const response = await fetch(`${API_URL}/api/books/${bookId}/pricing`);

            if (!response.ok) {
                throw new Error(`Failed to fetch book data: ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.book) {
                // Populate book data
                setBookData({
                  
                    title: result.book.title || "",
                    author: result.book.author || "",
                    year: result.book.year || 0,
                    isbn: result.book.isbn || "",
                    
                    other_code: result.book.other_code || "",
                    edition: result.book.edition || "",
                    binding_type: result.book.binding_type || "",
                    classification: result.book.classification || "",
                    remarks: result.book.remarks || "",
                });

                // Populate publisher data separately
                setPublisherData({
                    publisher_name: result.book.publisher_name || "",
                });

                // Set non-ISBN checkbox based on whether other_code exists
                setIsNonISBN(!!result.book.other_code && !result.book.isbn);

                // If there's pricing data, populate the first pricing entry
                if (result.pricing && result.pricing.length > 0) {
                    const firstPricing = result.pricing[0];
                    setPricingData({
                        source: firstPricing.source || "",
                        rate: firstPricing.rate || 0,
                        discount: firstPricing.discount || 0,
                        currency: firstPricing.currency || "USD",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching existing book data:", error);
            toast.error("Failed to load book data for editing");
        } finally {
            setInitialLoading(false);
        }
    };
    // Fetch Book Suggestions
    const fetchBookSuggestions = async (query: string) => {
        if (query.length < 2) {
            setBookSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/books/suggestions?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (result.success) {
                setBookSuggestions(result.books);
            }
        } catch (error) {
            console.error("Failed to fetch book suggestions:", error);
        }
    };

    // Fetch Publisher Suggestions
    const fetchPublisherSuggestions = async (query: string) => {
        if (query.length < 2) {
            setPublisherSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/publisher-suggestions?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (result.success) {
                setPublisherSuggestions(result.publishers);
            }
        } catch (error) {
            console.error("Failed to fetch publisher suggestions:", error);
        }
    };

    const debouncedFetchBookSuggestions = useCallback(debounce(fetchBookSuggestions, 300), []);
    const debouncedFetchPublisherSuggestions = useCallback(debounce(fetchPublisherSuggestions, 300), []);

    // --- Input Handlers ---

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setBookData({ ...bookData, title: newTitle });
        debouncedFetchBookSuggestions(newTitle);
    };

    const handlePublisherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPublisherName = e.target.value;
        setPublisherData({ publisher_name: newPublisherName });
        debouncedFetchPublisherSuggestions(newPublisherName);
    };

    const handleBookSuggestionClick = (book: BookData) => {
        setBookData({
            ...bookData,
            title: book.title,
            author: book.author,
            year: book.year,

        });
        setBookSuggestions([]);
    };

    const handlePublisherSuggestionClick = (publisher: PublisherSuggestion) => {
        setPublisherData({ publisher_name: publisher.name });
        setPublisherSuggestions([]);
    };
    // Handle ISBN validation
    const handleISBNChange = (value: string) => {
        // Store the normalized version (digits only; 'X' allowed only as ISBN-10 check digit)
        const normalizedISBN = normalizeISBN(value);
        setBookData({ ...bookData, isbn: normalizedISBN });

        if (value && !validateISBN(value)) {
            setIsbnError("Please enter a valid ISBN (10 or 13 digits)");
        } else {
            setIsbnError("");
        }
    };

    // Handle other code change
    const handleOtherCodeChange = (value: string) => {
        setBookData({ ...bookData, other_code: value });
    };


    // Handle checkbox toggle
    const handleNonISBNToggle = (checked: boolean) => {
        setIsNonISBN(checked);
        if (checked) {
            // Clear ISBN when switching to other code
            setBookData({ ...bookData, isbn: "", other_code: "" });
            setIsbnError("");
        } else {
            // Clear other code when switching to ISBN
            setBookData({ ...bookData, other_code: "", isbn: "" });
        }
    };

    // Validate form before submission
    const validateForm = (): boolean => {
        if (!isNonISBN) {
            // If not non-ISBN, ISBN is required and must be valid
            if (!bookData.isbn || bookData.isbn.trim() === '') {
                setIsbnError("ISBN is required");
                return false;
            }
            // Validate the normalized ISBN
            if (!validateISBN(bookData.isbn)) {
                setIsbnError("Please enter a valid ISBN (10 or 13 digits)");
                return false;
            }
        } else {
            // If non-ISBN, other_code is required
            if (!bookData.other_code || bookData.other_code.trim() === '') {
                toast.error("Other code is required for non-ISBN books");
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (isEditMode && editBookId) {
                // Direct update for edit mode
                const response = await fetch(`${API_URL}/api/books/${editBookId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bookData,
                        pricingData,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to update book: ${response.status}`);
                }

                const result = await response.json();
                toast.success("Book updated successfully!");
                router.push(`/books/${editBookId}`);
            } else {
                console.log("Publisher data in check", publisherData);

                // Check for duplicates in create mode
                const response = await fetch(`${API_URL}/api/books/check-duplicate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        bookData,
                        pricingData,
                        publisherData,
                    }),
                });

                const result = await response.json();
                
                // Handle different response statuses
                if (response.status === 409) {
                    // Conflict response - this is expected and should be handled
                    setCheckResponse(result);
                    setStep("check");
                } else if (!response.ok) {
                    throw new Error(`Failed to check book: ${response.status}`);
                } else {
                    // Success response (200)
                    setCheckResponse(result);
                    setStep("check");
                }
            }
        } catch (error) {
            console.error("Error processing book:", error);
            toast.error(isEditMode ? "Failed to update book" : "Failed to check book status");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (!checkResponse) return;

        setLoading(true);
        try {
            console.log("publisher data", publisherData);

            const payload = {
                bookData,
                pricingData,
                publisherData,
                status: checkResponse.bookStatus,
                pricingAction: action,
                bookId: checkResponse.bookId || checkResponse.details?.bookId,
                pricingId: checkResponse.pricingId || checkResponse.details?.pricingId,
            };

            const response = await fetch(`${API_URL}/api/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${action.toLowerCase()}: ${response.status}`);
            }

            const result = await response.json();
            toast.success("Book operation completed successfully!");
            router.push("/books");
        } catch (error) {
            console.error("Error performing action:", error);
            toast.error(`Failed to ${action.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        if (initialLoading) {
            return (
                <div className="min-h-screen  flex items-center justify-center">
                    <div className="bg-white shadow-lg rounded-2xl p-8">
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                            <span className="ml-3 text-gray-600">Loading book data...</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">



                    {/* Form */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 ">
                        {/* Header */}
                        <div className="mb-8">
                            <Button
                                onClick={() => router.push(isEditMode && editBookId ? `/books/${editBookId}` : "/books")}
                                variant="ghost"
                                className="mb-6 text-gray-700 hover:bg-gray-50 border-gray-300"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {isEditMode ? "Back to Book Details" : "Back"}
                            </Button>

                            <div className="text-center">
                                <div className="flex items-center justify-center">

                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mr-4 mb-4">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {isEditMode ? "Edit Book Details" : "Insert New Book"}
                                    </h1>
                                </div>
                                <p className="text-gray-600 text-lg">
                                    {isEditMode
                                        ? "Update the book details and pricing information below"
                                        : "Fill in the book details and pricing information below"
                                    }
                                </p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Book Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Book Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* title  */}
                                    <div>
                                        <Label htmlFor="title" className="text-gray-700 font-medium">Title *</Label>
                                        <Input
                                            id="title"
                                            value={bookData.title}
                                            onChange={(e) =>
                                                setBookData({ ...bookData, title: e.target.value })
                                            }
                                            required
                                            placeholder="e.g., The Great Gatsby"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    {/* Title Input with Suggestions */}
                                    {/* <div className="relative">
                                        <Label htmlFor="title" className="text-gray-700 font-medium">Title *</Label>
                                        <Input
                                            id="title"
                                            value={bookData.title}
                                            onChange={handleTitleChange}
                                            required
                                            placeholder="e.g., The Great Gatsby"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                            autoComplete="off"
                                        />
                                        {bookSuggestions.length > 0 && (
                                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                {bookSuggestions.map((book, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-4 py-2 cursor-pointer hover:bg-amber-50"
                                                        onClick={() => handleBookSuggestionClick(book)}
                                                    >
                                                        <p className="font-semibold">{book.title}</p>
                                                        <p className="text-sm text-gray-500">{book.author}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div> */}
                                    <div>
                                        <Label htmlFor="author" className="text-gray-700 font-medium">Author *</Label>
                                        <Input
                                            id="author"
                                            value={bookData.author}
                                            onChange={(e) =>
                                                setBookData({ ...bookData, author: e.target.value })
                                            }
                                            required
                                            placeholder="e.g., F. Scott Fitzgerald"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="year" className="text-gray-700 font-medium">Publication Year</Label>
                                        <Input
                                            id="year"
                                            type="number"
                                            value={bookData.year || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    setBookData({ ...bookData, year: 0 });
                                                } else {
                                                    const numValue = parseInt(value);
                                                    if (!isNaN(numValue) && value.length <= 4) {
                                                        setBookData({ ...bookData, year: numValue });
                                                    }
                                                }
                                            }}
                                            min="1000"
                                            max={new Date().getFullYear() + 1}
                                            placeholder="e.g., 2023"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    {/* Publisher Input with Suggestions */}
                                    <div className="relative">
                                        <Label htmlFor="publisher_name" className="text-gray-700 font-medium">Publisher *</Label>
                                        <Input
                                            id="publisher_name"
                                            value={publisherData.publisher_name}
                                            onChange={handlePublisherChange}
                                            required
                                            placeholder="e.g., Charles Scribner's Sons"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                            autoComplete="off"
                                        />
                                        {publisherSuggestions.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                {publisherSuggestions.map((pub, index) => (
                                                    <div
                                                        key={index}
                                                        className="px-4 py-2 cursor-pointer hover:bg-amber-50"
                                                        onClick={() => handlePublisherSuggestionClick(pub)}
                                                    >
                                                        <p>{pub.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="checkbox"
                                                id="non-isbn"
                                                checked={isNonISBN}
                                                onChange={(e) => handleNonISBNToggle(e.target.checked)}
                                                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                                            />
                                            <Label htmlFor="non-isbn" className="text-gray-700 font-medium">
                                                This book doesn&apos;t have an ISBN
                                            </Label>
                                        </div>

                                        {!isNonISBN ? (
                                            <div>
                                                <Label htmlFor="isbn" className="text-gray-700 font-medium">
                                                    ISBN *
                                                </Label>
                                                <Input
                                                    id="isbn"
                                                    value={bookData.isbn}
                                                    onChange={(e) => handleISBNChange(e.target.value)}
                                                    placeholder="e.g., 978-0743273565 or 0743273567"
                                                    className={`mt-1 h-12 bg-white border-2 focus:border-amber-500 focus:ring-amber-500 rounded-xl ${isbnError ? 'border-red-300' : 'border-gray-200'
                                                        }`}
                                                />
                                                {isbnError && (
                                                    <p className="mt-1 text-sm text-red-600">{isbnError}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <Label htmlFor="other_code" className="text-gray-700 font-medium">
                                                    Other Code *
                                                </Label>
                                                <Input
                                                    id="other_code"
                                                    value={bookData.other_code}
                                                    onChange={(e) => handleOtherCodeChange(e.target.value)}
                                                    placeholder="e.g., Internal code, SKU, or other identifier"
                                                    className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="edition" className="text-gray-700 font-medium">Edition</Label>
                                        <Input
                                            id="edition"
                                            value={bookData.edition}
                                            onChange={(e) =>
                                                setBookData({ ...bookData, edition: e.target.value })
                                            }
                                            placeholder="e.g., First Edition"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="binding_type" className="text-gray-700 font-medium">Binding Type</Label>
                                        <Select
                                            value={bookData.binding_type}
                                            onValueChange={(value) =>
                                                setBookData({ ...bookData, binding_type: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl text-gray-900">
                                                <SelectValue placeholder="Select binding type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                                                <SelectItem value="Hardcover" className="text-gray-900 hover:bg-amber-50">Hardcover</SelectItem>
                                                <SelectItem value="Paperback" className="text-gray-900 hover:bg-amber-50">Paperback</SelectItem>

                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="classification" className="text-gray-700 font-medium">Classification</Label>
                                        <Input
                                            id="classification"
                                            value={bookData.classification}
                                            onChange={(e) =>
                                                setBookData({ ...bookData, classification: e.target.value })
                                            }
                                            placeholder="e.g., Fiction, Non-Fiction, Science, etc."
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="remarks" className="text-gray-700 font-medium">Remarks</Label>
                                        <Textarea
                                            id="remarks"
                                            value={bookData.remarks}
                                            onChange={(e) =>
                                                setBookData({ ...bookData, remarks: e.target.value })
                                            }
                                            placeholder="Condition, special features, etc."
                                            rows={3}
                                            className="mt-1 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Pricing Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <Label htmlFor="source" className="text-gray-700 font-medium">Source *</Label>
                                        <Input
                                            id="source"
                                            value={pricingData.source}
                                            onChange={(e) =>
                                                setPricingData({ ...pricingData, source: e.target.value })
                                            }
                                            required
                                            placeholder="e.g., Local Bookstore"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rate" className="text-gray-700 font-medium">Rate *</Label>
                                        <Input
                                            id="rate"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={pricingData.rate || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setPricingData({ ...pricingData, rate: value === '' ? 0 : parseFloat(value) || 0 })
                                            }}
                                            required
                                            placeholder="0.00"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="discount" className="text-gray-700 font-medium">Discount (%)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={pricingData.discount || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setPricingData({ ...pricingData, discount: value === '' ? 0 : parseFloat(value) || 0 })
                                            }}
                                            placeholder="0.00"
                                            className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="currency" className="text-gray-700 font-medium">Currency</Label>
                                        <Select
                                            value={pricingData.currency}
                                            onValueChange={(value) =>
                                                setPricingData({ ...pricingData, currency: value })
                                            }
                                        >
                                            <SelectTrigger className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl text-gray-900">
                                                <SelectValue placeholder="Select currency" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                                                <SelectItem value="USD" className="text-gray-900 hover:bg-amber-50">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR" className="text-gray-900 hover:bg-amber-50">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP" className="text-gray-900 hover:bg-amber-50">GBP - British Pound</SelectItem>
                                                <SelectItem value="CAD" className="text-gray-900 hover:bg-amber-50">CAD - Canadian Dollar</SelectItem>
                                                <SelectItem value="AUD" className="text-gray-900 hover:bg-amber-50">AUD - Australian Dollar</SelectItem>
                                                <SelectItem value="JPY" className="text-gray-900 hover:bg-amber-50">JPY - Japanese Yen</SelectItem>
                                                <SelectItem value="INR" className="text-gray-900 hover:bg-amber-50">INR - Indian Rupee</SelectItem>
                                                <SelectItem value="PKR" className="text-gray-900 hover:bg-amber-50">PKR - Pakistani Rupee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(isEditMode && editBookId ? `/books/${editBookId}` : "/books")}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 h-10 px-4 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-10 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            {isEditMode ? "Updating..." : "Checking..."}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            {isEditMode ? "Update Book" : "Check Book Status"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const renderCheckResult = () => {
        if (!checkResponse) return null;

        const { bookStatus, pricingStatus, message, existingBook, conflictFields, pricingAction, differences, details } = checkResponse;
        
        // Map the new API response format to the expected format
        const status = bookStatus;
        const pricingActionFromResponse = pricingStatus;

        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            onClick={() => setStep("form")}
                            variant="outline"
                            className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Form
                        </Button>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Info className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Status Check</h1>
                            <p className="text-gray-600 text-lg">
                                Review the results and choose your action
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status Message */}
                        <div className={`p-6 rounded-2xl border ${status === "NEW" ? "bg-green-50 border-green-200" :
                            status === "DUPLICATE" ? "bg-blue-50 border-blue-200" :
                                "bg-yellow-50 border-yellow-200"
                            }`}>
                            <div className="flex items-center gap-3 mb-2">
                                {status === "NEW" && <CheckCircle className="w-6 h-6 text-green-600" />}
                                {status === "DUPLICATE" && <Info className="w-6 h-6 text-blue-600" />}
                                {(status === "CONFLICT" || status === "AUTHOR_CONFLICT") && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                                <h2 className="text-xl font-semibold">
                                    {status === "NEW" && "New Book Detected"}
                                    {status === "DUPLICATE" && "Duplicate Book Found"}
                                    {(status === "CONFLICT" || status === "AUTHOR_CONFLICT") && "Conflict Detected"}
                                </h2>
                            </div>
                            <p className="text-gray-700">{message}</p>
                        </div>

                        {/* Conflict Fields Display */}
                        {(conflictFields || details?.conflictFields) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflict Details</h3>
                                <div className="space-y-4">
                                    {Object.entries(conflictFields || details?.conflictFields || {}).map(([field, data]: [string, any]) => (
                                        data && (
                                            <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-yellow-50 rounded-xl">
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Field</Label>
                                                    <p className="text-sm text-gray-900 capitalize">{field.replace('_', ' ')}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">Existing Value</Label>
                                                    <p className="text-sm text-gray-900">{data.old}</p>
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium text-gray-700">New Value</Label>
                                                    <p className="text-sm text-gray-900">{data.new}</p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing Differences */}
                        {differences && differences.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Differences</h3>
                                <div className="space-y-4">
                                    {differences.map((diff, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Field</Label>
                                                <p className="text-sm text-gray-900 capitalize">{diff.field}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Existing Value</Label>
                                                <p className="text-sm text-gray-900">{diff.existing}</p>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">New Value</Label>
                                                <p className="text-sm text-gray-900">{diff.new}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Action</h3>
                            <div className="flex flex-wrap gap-4">
                                {status === "NEW" && (
                                    <Button
                                        onClick={() => handleAction("INSERT")}
                                        disabled={loading}
                                        className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Inserting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Insert Book
                                            </>
                                        )}
                                    </Button>
                                )}

                                {(status === "CONFLICT" || status === "AUTHOR_CONFLICT") && (
                                    <>
                                        <Button
                                            onClick={() => handleAction("KEEP_NEW")}
                                            disabled={loading}
                                            className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                "Keep New"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleAction("KEEP_OLD")}
                                            disabled={loading}
                                            variant="outline"
                                            className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Keeping...
                                                </>
                                            ) : (
                                                "Keep Old"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => handleAction("KEEP_BOTH")}
                                            disabled={loading}
                                            className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                "Keep Both"
                                            )}
                                        </Button>
                                    </>
                                )}

                                {status === "DUPLICATE" && (
                                    <>
                                        {(pricingAction === "ADD_PRICE" || pricingActionFromResponse === "ADD_PRICE") && (
                                            <Button
                                                onClick={() => handleAction("ADD_PRICE")}
                                                disabled={loading}
                                                className="h-12 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 mr-2" />
                                                        Add Price
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {(pricingAction === "UPDATE_POSSIBLE" || pricingActionFromResponse === "UPDATE_PRICE") && (
                                            <>
                                                <Button
                                                    onClick={() => handleAction("UPDATE_PRICE")}
                                                    disabled={loading}
                                                    className="h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        "Update Price"
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction("IGNORE")}
                                                    disabled={loading}
                                                    variant="outline"
                                                    className="h-12 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                                                >
                                                    {loading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                            Ignoring...
                                                        </>
                                                    ) : (
                                                        "Keep Old"
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                        {(pricingAction === "NO_CHANGE" || pricingActionFromResponse === "NO_CHANGE") && (
                                            <div className="text-center py-4">
                                                <p className="text-gray-600">Book and pricing are already up-to-date.</p>
                                                <Button
                                                    onClick={() => router.push("/books")}
                                                    className="mt-4 bg-amber-600 hover:bg-amber-700"
                                                >
                                                    Return to Home
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {step === "form" && renderForm()}
            {step === "check" && renderCheckResult()}
        </>
    );
}

export default function InsertBookPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-2xl p-8">
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                </div>
            </div>
        </div>}>
            <InsertBookPageContent />
        </Suspense>
    );
}