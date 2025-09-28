/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { BookOpen, ArrowLeft, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Types based on the controller
interface BookData {
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

interface PricingData {
    source: string;
    rate: number;
    discount: number;
    currency: string;
}

interface CheckResponse {
    status: "NEW" | "DUPLICATE" | "CONFLICT" | "AUTHOR_CONFLICT";
    message: string;
    existingBook?: any;
    newData?: BookData;
    conflictFields?: any;
    pricingAction?: "ADD_PRICE" | "UPDATE_POSSIBLE" | "NO_CHANGE";
    differences?: Array<{ field: string; existing: any; new: any }>;
    bookId?: string;
    pricingId?: string;
}

export default function InsertBookPage() {
    const router = useRouter();
    const [step, setStep] = useState<"form" | "check" | "result">("form");
    const [loading, setLoading] = useState(false);
    const [checkResponse, setCheckResponse] = useState<CheckResponse | null>(null);

    const [bookData, setBookData] = useState<BookData>({
        title: "",
        author: "",
        year: new Date().getFullYear(),
        publisher_name: "",
        isbn: "",
        edition: "",
        binding_type: "",
        classification: "",
        remarks: "",
    });

    const [pricingData, setPricingData] = useState<PricingData>({
        source: "",
        rate: 0,
        discount: 0,
        currency: "USD",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5050/api/books/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookData,
                    pricingData,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to check book: ${response.status}`);
            }

            const result = await response.json();
            console.log("TEst", result);

            setCheckResponse(result);
            setStep("check");
        } catch (error) {
            console.error("Error checking book:", error);
            toast.error("Failed to check book status");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        if (!checkResponse) return;

        setLoading(true);
        try {
            const payload = {
                bookData,
                pricingData,
                status: checkResponse.status,
                pricingAction: action,
                bookId: checkResponse.bookId,
                pricingId: checkResponse.pricingId,
            };

            const response = await fetch("http://localhost:5050/api/books", {
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
            router.push("/");
        } catch (error) {
            console.error("Error performing action:", error);
            toast.error(`Failed to ${action.toLowerCase()}`);
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        className="mb-6 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insert New Book</h1>
                        <p className="text-gray-600 text-lg">
                            Fill in the book details and pricing information below
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Book Information Section */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Book Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <Label htmlFor="year" className="text-gray-700 font-medium">Publication Year *</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={bookData.year}
                                        onChange={(e) =>
                                            setBookData({ ...bookData, year: parseInt(e.target.value) })
                                        }
                                        required
                                        min="1000"
                                        max={new Date().getFullYear() + 1}
                                        className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="publisher_name" className="text-gray-700 font-medium">Publisher *</Label>
                                    <Input
                                        id="publisher_name"
                                        value={bookData.publisher_name}
                                        onChange={(e) =>
                                            setBookData({ ...bookData, publisher_name: e.target.value })
                                        }
                                        required
                                        placeholder="e.g., Charles Scribner's Sons"
                                        className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="isbn" className="text-gray-700 font-medium">ISBN</Label>
                                    <Input
                                        id="isbn"
                                        value={bookData.isbn}
                                        onChange={(e) =>
                                            setBookData({ ...bookData, isbn: e.target.value })
                                        }
                                        placeholder="e.g., 978-0743273565"
                                        className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                                    />
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
                                    <Label htmlFor="binding_type" className="text-gray-700 font-medium">Binding Type *</Label>
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
                                    <Label htmlFor="classification" className="text-gray-700 font-medium">Classification *</Label>
                                    <Select
                                        value={bookData.classification}
                                        onValueChange={(value) =>
                                            setBookData({ ...bookData, classification: value })
                                        }
                                    >
                                        <SelectTrigger className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl text-gray-900">
                                            <SelectValue placeholder="Select classification" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                                            <SelectItem value="Fantasy" className="text-gray-900 hover:bg-amber-50">Fantasy</SelectItem>
                                            <SelectItem value="Classic Literature" className="text-gray-900 hover:bg-amber-50">Classic Literature</SelectItem>
                                            <SelectItem value="Dystopian Fiction" className="text-gray-900 hover:bg-amber-50">Dystopian Fiction</SelectItem>
                                            <SelectItem value="Science Fiction" className="text-gray-900 hover:bg-amber-50">Science Fiction</SelectItem>
                                            <SelectItem value="Mystery" className="text-gray-900 hover:bg-amber-50">Mystery</SelectItem>
                                            <SelectItem value="Romance" className="text-gray-900 hover:bg-amber-50">Romance</SelectItem>
                                            <SelectItem value="Non-Fiction" className="text-gray-900 hover:bg-amber-50">Non-Fiction</SelectItem>
                                            <SelectItem value="Biography" className="text-gray-900 hover:bg-amber-50">Biography</SelectItem>
                                            <SelectItem value="History" className="text-gray-900 hover:bg-amber-50">History</SelectItem>
                                            <SelectItem value="Self-Help" className="text-gray-900 hover:bg-amber-50">Self-Help</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                    <Label htmlFor="currency" className="text-gray-700 font-medium">Currency *</Label>
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
                                onClick={() => router.push("/")}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Check Book Status
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    const renderCheckResult = () => {
        if (!checkResponse) return null;

        const { status, message, existingBook, conflictFields, pricingAction, differences } = checkResponse;

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
                        {conflictFields && (
                            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Conflict Details</h3>
                                <div className="space-y-4">
                                    {Object.entries(conflictFields).map(([field, data]: [string, any]) => (
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
                                                "Insert New"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => router.push("/")}
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
                                    </>
                                )}

                                {status === "DUPLICATE" && (
                                    <>
                                        {pricingAction === "ADD_PRICE" && (
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
                                        {pricingAction === "UPDATE_POSSIBLE" && (
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
                                        {pricingAction === "NO_CHANGE" && (
                                            <div className="text-center py-4">
                                                <p className="text-gray-600">Book and pricing are already up-to-date.</p>
                                                <Button
                                                    onClick={() => router.push("/")}
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