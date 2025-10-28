"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
    BookOpen,
    ArrowLeft,
    Calendar,
    User,
    Building,
    Hash,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Minus,
    Edit,
    Plus,
    ExternalLink,
    Clock,
    Tag,
    Info,
    ShoppingCart
} from "lucide-react";
import { toast } from "sonner";
import { apiFunctions } from "@/services/api.service";
interface Book {
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
    createdAt: string;
    updatedAt: string;
}


interface Pricing {
    _id: string;
    rate: number;
    discount: number;
    source: string;
    currency: string;
    last_updated: string;
    createdAt: string;
}

interface BookDetailResponse {
    success: boolean;
    book: Book;
    pricing: Pricing[];
    statistics: {
        totalSources: number;
        averageRate: number;
        minRate: number;
        maxRate: number;
        averageDiscount: number;
    };
    message: string;
}

export default function BookDetailPage() {
    const router = useRouter();
    const params = useParams();
    const bookId = params.id as string;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
    const [bookData, setBookData] = useState<BookDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // --- PASTE THIS DUMMY DATA ---
    const lastPurchaseData = {
        date: "2025-09-15T10:30:00Z",
        edition: "2022 Revised Edition",
        price: 450.00,
        currency: "INR",
        customer: "Central Library",
    };
    // --- END OF DUMMY DATA ---
    useEffect(() => {
        if (bookId) {
            fetchBookDetails();
        }
    }, [bookId]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiFunctions.getBookDetails(bookId);

            if (!response.success) {
                const errorText = await response.message;
                throw new Error(`Failed to fetch book details: ${response.status} - ${errorText}`);
            }

            

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch book details');
            }

            setBookData(response);
        } catch (error) {
            console.error("Error fetching book details:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch book details");
            toast.error("Failed to load book details");
        } finally {
            setLoading(false);
        }
    };
    const markAsOutOfPrint = async () => {
        try {

            setError(null);

            const response = await apiFunctions.markAsOutOfPrint(bookId);

            if (!response.success) {
                const errorText = await response.message;
                throw new Error(`Failed to mark book as out of print: ${response.status} - ${errorText}`);
            }

            

            if (!response.success) {
                throw new Error(response.message || 'Failed to mark book as out of print');
            }
            toast.success("Book marked as out of print successfully");
        } catch (error) {
            console.error("Error marking book as out of print:", error);
            setError(error instanceof Error ? error.message : "Failed to mark book as out of print");
            toast.error("Failed to mark book as out of print");
        } finally {

        }
    }
    const formatPrice = (rate: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(rate);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriceTrend = (rate: number, averageRate: number) => {
        if (rate > averageRate) return { icon: TrendingUp, color: "text-red-500", label: "Above Average" };
        if (rate < averageRate) return { icon: TrendingDown, color: "text-green-500", label: "Below Average" };
        return { icon: Minus, color: "text-gray-500", label: "Average" };
    };

    const getBindingTypeColor = (bindingType: string) => {
        const colors: { [key: string]: string } = {
            'Hardcover': 'bg-blue-100 text-blue-800',
            'Paperback': 'bg-green-100 text-green-800',
            'Ebook': 'bg-purple-100 text-purple-800',
            'Audiobook': 'bg-orange-100 text-orange-800'
        };
        return colors[bindingType] || 'bg-gray-100 text-gray-800';
    };

    const getClassificationColor = (classification: string) => {
        const colors: { [key: string]: string } = {
            'Fantasy': 'bg-purple-100 text-purple-800',
            'Classic Literature': 'bg-amber-100 text-amber-800',
            'Science Fiction': 'bg-blue-100 text-blue-800',
            'Mystery': 'bg-red-100 text-red-800',
            'Romance': 'bg-pink-100 text-pink-800',
            'Non-Fiction': 'bg-green-100 text-green-800',
            'Biography': 'bg-indigo-100 text-indigo-800',
            'History': 'bg-yellow-100 text-yellow-800',
            'Self-Help': 'bg-teal-100 text-teal-800'
        };
        return colors[classification] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error: {error}</p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => router.push("/books")} variant="outline">
                                Back to Home
                            </Button>
                            <Button onClick={fetchBookDetails} className="bg-amber-600 hover:bg-amber-700">
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!bookData) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8">
                    <p className="text-gray-500">No book data available</p>
                </div>
            </div>
        );
    }

    const { book, pricing, statistics } = bookData;

    return (
        <div className="min-h-screen ">
            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* <Button
                                onClick={() => router.push("/books")}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Books
                            </Button> */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Book Details</h1>
                                <p className="text-gray-600">Complete book information and pricing</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => router.push(`/books/insert?edit=${bookId}`)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Book
                            </Button>
                            <Button
                                onClick={() => markAsOutOfPrint()}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Mark out of print
                            </Button>
                            <Button
                                onClick={() => router.push("/books/insert")}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Book
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    {/* Book Information */}
                    {/* Book Information Card */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">

                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">{book.title}</h1>
                                <p className="text-lg text-slate-600 mt-1">by {book.author}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0 mt-2 md:mt-0">
                                <Badge className={`border ${getBindingTypeColor(book.binding_type)}`}>{book.binding_type}</Badge>
                                <Badge className={`border ${getClassificationColor(book.classification)}`}>{book.classification}</Badge>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 my-6"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Publication Year</p>
                                <p className="font-medium text-slate-800 mt-1">{book.year}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><Building className="w-4 h-4" /> Publisher</p>
                                <p className="font-medium text-slate-800 mt-1">{book.publisher_name}</p>
                            </div>
                            {book.isbn && (
                                <div>
                                    <p className="text-sm text-slate-500 flex items-center gap-2"><Hash className="w-4 h-4" /> ISBN</p>
                                    <p className="font-medium text-slate-800 mt-1">{book.isbn}</p>
                                </div>
                            )}
                            {book.edition && (
                                <div>
                                    <p className="text-sm text-slate-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Edition</p>
                                    <p className="font-medium text-slate-800 mt-1">{book.edition}</p>
                                </div>
                            )}
                        </div>

                        {book.remarks && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <p className="text-sm font-medium text-slate-800 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Remarks</p>
                                <p className="text-slate-600 text-sm leading-relaxed">{book.remarks}</p>
                            </div>
                        )}

                        <div className="border-t border-slate-200 my-6"></div>
                        {/* Pricing Section */}

                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"> Pricing Analysis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>


                                {/* Pricing Overview */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md">
                                    <h3 className="font-semibold text-slate-800 mb-4">Overview</h3>
                                    <div className="space-y-">
                                        <div className="items-center text-sm grid grid-cols-2 gap-6 "><span className="text-slate-600">Total Sources</span><span className="font-medium text-slate-800">{statistics.totalSources}</span></div>
                                        <div className=" items-center text-sm grid grid-cols-2 gap-6"><span className="text-slate-600">Average Price</span><span className="font-medium text-slate-800">{formatPrice(statistics.averageRate, pricing[0]?.currency || 'USD')}</span></div>
                                        <div className="flex items-center text-sm grid grid-cols-2 gap-6"><span className="text-slate-600">Price Range</span><span className="font-medium text-slate-800">{formatPrice(statistics.minRate, pricing[0]?.currency || 'USD')} - {formatPrice(statistics.maxRate, pricing[0]?.currency || 'USD')}</span></div>
                                        <div className="flex  items-center text-sm grid grid-cols-2 gap-6"><span className="text-slate-600">Avg. Discount</span><span className="font-medium text-slate-800">{statistics.averageDiscount.toFixed(1)}%</span></div>
                                    </div>
                                </div>
                            </div>
                            {/* Pricing Sources */}
                            <div className="space-y-4">
                                {pricing.length > 0 ? (
                                    pricing.sort((a, b) => a.rate - b.rate).map((price, index) => {
                                        const trend = getPriceTrend(price.rate, statistics.averageRate);
                                        const TrendIcon = trend.icon;
                                        return (
                                            <div key={price._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 transition-all hover:border-slate-300 hover:shadow-md">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800">{price.source}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Updated: {formatDate(price.last_updated)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold text-slate-900">{formatPrice(price.rate, price.currency)}</p>
                                                        {price.discount > 0 && <p className="text-xs text-green-600 font-semibold">{price.discount}% discount</p>}
                                                    </div>
                                                </div>
                                                <div className="border-t border-slate-100 my-3"></div>
                                                <div className="flex justify-between items-center">
                                                    {index === 0 && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-200">Best Price</Badge>
                                                    )}
                                                    <div className={`flex items-center gap-1.5 ml-auto text-xs ${trend.color}`}>
                                                        <TrendIcon className="w-3.5 h-3.5" />
                                                        <span>{trend.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="bg-white text-center py-10 px-6 rounded-xl shadow-sm border border-slate-200">
                                        <p className="text-slate-500 mb-4">No pricing information available for this book.</p>
                                        <Button onClick={() => router.push(`/books/insert?bookId=${bookId}`)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Pricing Info
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    {/* --- PASTE THE NEW SECTION HERE --- */}
                    {/* Last Purchase Information */}
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-amber-600" />
                            Last Purchase Information
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Purchase Date</p>
                                <p className="font-medium text-slate-800 mt-1">{formatDate(lastPurchaseData.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><User className="w-4 h-4" /> Customer</p>
                                <p className="font-medium text-slate-800 mt-1">{lastPurchaseData.customer}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Purchased Edition</p>
                                <p className="font-medium text-slate-800 mt-1">{lastPurchaseData.edition}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Purchase Price</p>
                                <p className="font-medium text-slate-800 mt-1">{formatPrice(lastPurchaseData.price, lastPurchaseData.currency)}</p>
                            </div>
                        </div>
                    </section>
                    {/* --- END OF NEW SECTION --- */}
                </div>
            </main>
        </div>
    );
}


