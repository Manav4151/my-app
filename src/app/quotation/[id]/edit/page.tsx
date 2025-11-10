"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFunctions, ApiError } from '@/services/api.service';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import { Plus, Minus, ArrowLeft, Trash2 } from 'lucide-react';
import { BookSelectionDialog } from '@/app/components/BookSelectionDialog';

// Type definitions
type Quantities = {
    [bookId: string]: number;
};

type BookDiscounts = {
    [bookId: string]: number;
};

type CustomPrices = {
    [bookId: string]: number;
};

type Book = {
    _id: string;
    title: string;
    isbn: string;
    author?: string;
    publisher?: string;
    edition?: string;
};

type QuotationItem = {
    _id: string;
    book: Book | string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
};

type Customer = {
    _id: string;
    name?: string;
    customerName?: string;
};

type Quotation = {
    _id: string;
    quotationId: string;
    customer: Customer;
    items: QuotationItem[];
    subTotal: number;
    totalDiscount: number;
    grandTotal: number;
    status: string;
    validUntil: string;
    createdAt: string;
    updatedAt: string;
};

type QuotationPreviewBook = {
    bookId: string;
    title: string;
    isbn: string;
    publisher_name: string;
    lowestPrice: number;
    currency: string;
};

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type QuotationPayloadItem = {
    book: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
};

type QuotationPayload = {
    customer: string;
    items: QuotationPayloadItem[];
    subTotal: number;
    totalDiscount: number;
    grandTotal: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    validUntil: string;
};

export default function EditQuotationPage() {
    const router = useRouter();
    const params = useParams();
    const quotationId = params.id as string;

    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [books, setBooks] = useState<QuotationPreviewBook[]>([]);
    const [quantities, setQuantities] = useState<Quantities>({});
    const [customerId, setCustomerId] = useState("");
    const [status, setStatus] = useState<'Draft' | 'Sent' | 'Accepted' | 'Rejected'>('Draft');
    const [validUntil, setValidUntil] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [bookDiscounts, setBookDiscounts] = useState<BookDiscounts>({});
    const [generalDiscount, setGeneralDiscount] = useState<string>("");
    const [customPrices, setCustomPrices] = useState<CustomPrices>({});
    const [bookDialogOpen, setBookDialogOpen] = useState(false);

    // Load quotation data
    useEffect(() => {
        const fetchQuotation = async () => {
            try {
                setLoading(true);
                const response = await apiFunctions.getQuotationById(quotationId);

                if (!response.success || !response.quotation) {
                    throw new Error(response.message || "Failed to fetch quotation");
                }

                const quotationData = response.quotation as Quotation;
                setQuotation(quotationData);

                // Set customer ID
                setCustomerId(quotationData.customer._id);

                // Set status
                setStatus(quotationData.status as 'Draft' | 'Sent' | 'Accepted' | 'Rejected');

                // Set valid until date
                const validUntilDate = new Date(quotationData.validUntil);
                setValidUntil(validUntilDate.toISOString().split('T')[0]);

                // Convert quotation items to preview books format
                const previewBooks: QuotationPreviewBook[] = quotationData.items.map((item) => {
                    const book = typeof item.book === "object" ? item.book : null;
                    return {
                        bookId: typeof item.book === "object" ? item.book._id : item.book,
                        title: book?.title || "Unknown Book",
                        isbn: book?.isbn || "",
                        publisher_name: book?.publisher || "Unknown Publisher",
                        lowestPrice: item.unitPrice,
                        currency: "USD",
                    };
                });

                setBooks(previewBooks);

                // Initialize quantities, prices, and discounts from quotation items
                const initialQuantities: Quantities = {};
                const initialCustomPrices: CustomPrices = {};
                const initialBookDiscounts: BookDiscounts = {};

                quotationData.items.forEach((item) => {
                    const bookId = typeof item.book === "object" ? item.book._id : item.book;
                    initialQuantities[bookId] = item.quantity;
                    initialCustomPrices[bookId] = item.unitPrice;
                    initialBookDiscounts[bookId] = item.discount;
                });

                setQuantities(initialQuantities);
                setCustomPrices(initialCustomPrices);
                setBookDiscounts(initialBookDiscounts);

                // Calculate general discount percentage
                // This is an approximation since we don't store it separately
                const calculatedGeneralDiscount = quotationData.totalDiscount > 0 
                    ? ((quotationData.totalDiscount / quotationData.subTotal) * 100).toFixed(2)
                    : "0";
                setGeneralDiscount(calculatedGeneralDiscount);

            } catch (err) {
                console.error("Error fetching quotation:", err);
                setError(err instanceof ApiError ? err.message : "Failed to load quotation");
                toast.error("Failed to load quotation");
            } finally {
                setLoading(false);
            }
        };

        if (quotationId) {
            fetchQuotation();
        }
    }, [quotationId]);

    // Handlers
    const handleQuantityChange = (bookId: string, value: string) => {
        const quantity = parseInt(value, 10);
        setQuantities(prev => ({
            ...prev,
            [bookId]: isNaN(quantity) || quantity < 1 ? 1 : quantity
        }));
    };

    const handleQuantityIncrement = (bookId: string) => {
        setQuantities(prev => ({
            ...prev,
            [bookId]: (prev[bookId] || 1) + 1
        }));
    };

    const handleQuantityDecrement = (bookId: string) => {
        setQuantities(prev => {
            const current = prev[bookId] || 1;
            return {
                ...prev,
                [bookId]: current > 1 ? current - 1 : 1
            };
        });
    };

    const handleCustomPriceChange = (bookId: string, value: string) => {
        const price = parseFloat(value);
        setCustomPrices(prev => ({
            ...prev,
            [bookId]: isNaN(price) || price < 0 ? 0 : price
        }));
    };

    const handleBookDiscountChange = (bookId: string, value: string) => {
        const discount = parseFloat(value);
        setBookDiscounts(prev => ({
            ...prev,
            [bookId]: isNaN(discount) || discount < 0 ? 0 : discount
        }));
    };

    // Calculate quotation summary
    const quotationSummary = useMemo(() => {
        const subtotal = books.reduce((acc, book) => {
            const price = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : (book.lowestPrice || 0);
            const quantity = quantities[book.bookId] || 1;
            const discountPercent = bookDiscounts[book.bookId] || 0;
            const discountedPrice = price * (1 - discountPercent / 100);
            return acc + discountedPrice * quantity;
        }, 0);

        const generalDiscountPercent = parseFloat(generalDiscount) || 0;
        const discountAmount = subtotal * (generalDiscountPercent / 100);
        const subtotalAfterGeneralDiscount = subtotal - discountAmount;
        const tax = subtotalAfterGeneralDiscount * 0.05;
        const total = subtotalAfterGeneralDiscount + tax;

        return {
            subtotal,
            discountAmount,
            generalDiscountPercent,
            subtotalAfterGeneralDiscount,
            tax,
            total,
        };
    }, [books, quantities, bookDiscounts, generalDiscount, customPrices]);

    // Build payload
    const buildQuotationPayload = (): QuotationPayload => {
        const calculatedItems: QuotationPayloadItem[] = books.map(book => {
            const unitPrice = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : (book.lowestPrice || 0);
            const quantity = quantities[book.bookId] || 1;
            const discountPercent = bookDiscounts[book.bookId] || 0;

            const lineItemGrossTotal = unitPrice * quantity;
            const lineItemDiscountAmount = lineItemGrossTotal * (discountPercent / 100);
            const lineItemFinalTotal = lineItemGrossTotal - lineItemDiscountAmount;

            return {
                book: book.bookId,
                quantity,
                unitPrice,
                discount: discountPercent,
                totalPrice: lineItemFinalTotal
            };
        });

        const {
            subtotal,
            total,
            generalDiscountPercent,
        } = quotationSummary;

        const totalItemDiscountAmount = books.reduce((acc, book) => {
            const unitPrice = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : (book.lowestPrice || 0);
            const quantity = quantities[book.bookId] || 1;
            const discountPercent = bookDiscounts[book.bookId] || 0;
            const lineItemGrossTotal = unitPrice * quantity;
            return acc + (lineItemGrossTotal * discountPercent / 100);
        }, 0);

        const subTotalAfterItemDiscounts = subtotal - totalItemDiscountAmount;
        const generalDiscountAmount = subTotalAfterItemDiscounts * (generalDiscountPercent / 100);
        const totalDiscountAmount = totalItemDiscountAmount + generalDiscountAmount;

        // Use provided validUntil or default to 30 days from now
        const validUntilDate = validUntil 
            ? new Date(validUntil)
            : (() => {
                const date = new Date();
                date.setDate(date.getDate() + 30);
                return date;
            })();

        return {
            customer: customerId,
            items: calculatedItems,
            subTotal: subtotal,
            totalDiscount: totalDiscountAmount,
            grandTotal: total,
            status: status,
            validUntil: validUntilDate.toISOString()
        };
    };

    // Handle books selected from dialog
    const handleBooksSelected = async (selectedBookIds: string[]) => {
        try {
            // Get current book IDs
            const currentBookIds = books.map(b => b.bookId);
            
            // Find newly added books (not in current list)
            const newBookIds = selectedBookIds.filter(id => !currentBookIds.includes(id));
            
            // Find removed books (in current list but not in selected)
            const removedBookIds = currentBookIds.filter(id => !selectedBookIds.includes(id));
            
            // Remove books that were deselected
            if (removedBookIds.length > 0) {
                setBooks(prev => prev.filter(book => !removedBookIds.includes(book.bookId)));
                setQuantities(prev => {
                    const updated = { ...prev };
                    removedBookIds.forEach(id => delete updated[id]);
                    return updated;
                });
                setCustomPrices(prev => {
                    const updated = { ...prev };
                    removedBookIds.forEach(id => delete updated[id]);
                    return updated;
                });
                setBookDiscounts(prev => {
                    const updated = { ...prev };
                    removedBookIds.forEach(id => delete updated[id]);
                    return updated;
                });
            }
            
            // Fetch preview data for newly added books
            if (newBookIds.length > 0) {
                const previewResponse = await apiFunctions.getQuotationPreview(newBookIds);
                if (previewResponse.success && previewResponse.data) {
                    const newBooks: QuotationPreviewBook[] = previewResponse.data.map((book: any) => ({
                        bookId: book.bookId,
                        title: book.title,
                        isbn: book.isbn,
                        publisher_name: book.publisher_name,
                        lowestPrice: book.lowestPrice || 0,
                        currency: book.currency || "USD",
                    }));
                    
                    // Add new books to the list
                    setBooks(prev => [...prev, ...newBooks]);
                    
                    // Initialize quantities, prices, and discounts for new books
                    newBooks.forEach(book => {
                        setQuantities(prev => ({ ...prev, [book.bookId]: 1 }));
                        setCustomPrices(prev => ({ ...prev, [book.bookId]: book.lowestPrice }));
                        setBookDiscounts(prev => ({ ...prev, [book.bookId]: 0 }));
                    });
                }
            }
            
            toast.success("Books updated successfully");
        } catch (err) {
            console.error("Error updating books:", err);
            toast.error("Failed to update books");
        }
    };

    // Handle remove book
    const handleRemoveBook = (bookId: string) => {
        setBooks(prev => prev.filter(book => book.bookId !== bookId));
        setQuantities(prev => {
            const updated = { ...prev };
            delete updated[bookId];
            return updated;
        });
        setCustomPrices(prev => {
            const updated = { ...prev };
            delete updated[bookId];
            return updated;
        });
        setBookDiscounts(prev => {
            const updated = { ...prev };
            delete updated[bookId];
            return updated;
        });
        toast.success("Book removed");
    };

    // Get current book IDs for the dialog
    const currentBookIds = books.map(b => b.bookId);

    // Handle save
    const handleSave = async () => {
        if (!customerId) {
            toast.error("Please enter a customer ID");
            return;
        }

        if (books.length === 0) {
            toast.error("At least one item is required");
            return;
        }

        try {
            setIsSaving(true);
            const payload = buildQuotationPayload();

            const response = await apiFunctions.updateQuotation(quotationId, payload);

            if (!response.success) {
                throw new Error(response.message);
            }

            toast.success(response.message || "Quotation updated successfully!");
            router.push(`/quotation/${quotationId}`);
        } catch (err) {
            console.error("Update error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to update quotation");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Loading quotation...</p>
                </div>
            </div>
        );
    }

    if (error || !quotation) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">Error: {error || "Quotation not found"}</p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => router.push("/quotation")} variant="outline">
                                Back to List
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/quotation/${quotationId}`)}
                    className="mb-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quotation
                </Button>
                <h1 className="text-3xl font-bold mb-2">Edit Quotation</h1>
                <p className="text-gray-600">Quotation ID: {quotation.quotationId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                    <Label htmlFor="customer-id" className="text-lg font-medium">Customer ID</Label>
                    <Input
                        id="customer-id"
                        placeholder="Enter customer ID..."
                        value={customerId}
                        onChange={(e: InputChangeEvent) => setCustomerId(e.target.value)}
                        className="mt-2 text-lg h-12"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                    <Label htmlFor="general-discount" className="text-lg font-medium">General Discount (%)</Label>
                    <Input
                        id="general-discount"
                        type="number"
                        placeholder="e.g., 5 (optional)"
                        value={generalDiscount}
                        onChange={(e: InputChangeEvent) => setGeneralDiscount(e.target.value)}
                        className="mt-2 text-lg h-12"
                        min="0"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                    <Label htmlFor="status" className="text-lg font-medium">Status</Label>
                    <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                        <SelectTrigger id="status" className="mt-2 text-lg h-12">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Sent">Sent</SelectItem>
                            <SelectItem value="Accepted">Accepted</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                    <Label htmlFor="valid-until" className="text-lg font-medium">Valid Until</Label>
                    <Input
                        id="valid-until"
                        type="date"
                        value={validUntil}
                        onChange={(e: InputChangeEvent) => setValidUntil(e.target.value)}
                        className="mt-2 text-lg h-12"
                    />
                </div>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Books</h2>
                    <Button
                        onClick={() => setBookDialogOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Books
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-amber-100" style={{ minWidth: '1000px', tableLayout: 'fixed' }}>
                        <thead className="bg-amber-50">
                            <tr>
                                <th className="px-3 py-3 text-left" style={{ width: '25%' }}>Title & ISBN</th>
                                <th className="px-3 py-3 text-left" style={{ width: '10%' }}>Publisher</th>
                                <th className="px-3 py-3 text-left" style={{ width: '9%' }}>Original Price</th>
                                <th className="px-3 py-3 text-left" style={{ width: '10%' }}>Custom Price</th>
                                <th className="px-3 py-3 text-left" style={{ width: '8%' }}>Discount (%)</th>
                                <th className="px-3 py-3 text-left" style={{ width: '10%' }}>Quantity</th>
                                <th className="px-3 py-3 text-right" style={{ width: '15%' }}>Total</th>
                                <th className="px-3 py-3 text-center" style={{ width: '5%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-amber-100">
                            {books.map((book) => {
                                const customPrice = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : book.lowestPrice;
                                const quantity = quantities[book.bookId] || 1;
                                const discountPercent = bookDiscounts[book.bookId] || 0;
                                const discountedPrice = customPrice * (1 - discountPercent / 100);
                                const lineTotal = discountedPrice * quantity;

                                return (
                                    <tr key={book.bookId}>
                                        <td className="px-3 py-4">
                                            <div className="break-words whitespace-normal">
                                                <div className="font-medium">{book.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">ISBN: {book.isbn}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 truncate">{book.publisher_name}</td>
                                        <td className="px-3 py-4 text-gray-500">
                                            <div className="flex flex-col">
                                                <span className="text-xs">{book.currency}</span>
                                                <span className="font-medium">${book.lowestPrice.toFixed(2)}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={customPrices[book.bookId] !== undefined ? customPrices[book.bookId].toFixed(2) : book.lowestPrice.toFixed(2)}
                                                onChange={(e: InputChangeEvent) => handleCustomPriceChange(book.bookId, e.target.value)}
                                                className="w-full min-w-[90px] max-w-[110px]"
                                            />
                                        </td>
                                        <td className="px-3 py-4">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={bookDiscounts[book.bookId] || ''}
                                                onChange={(e: InputChangeEvent) => handleBookDiscountChange(book.bookId, e.target.value)}
                                                className="w-full min-w-[70px] max-w-[90px]"
                                                placeholder="0"
                                            />
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-2 justify-start">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityDecrement(book.bookId)}
                                                    className="h-8 w-8 p-0 flex-shrink-0"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e: InputChangeEvent) => handleQuantityChange(book.bookId, e.target.value)}
                                                    className="w-16 text-center"
                                                    style={{ minWidth: '64px', maxWidth: '64px' }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleQuantityIncrement(book.bookId)}
                                                    className="h-8 w-8 p-0 flex-shrink-0"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-right font-medium whitespace-nowrap">
                                            ${lineTotal.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-4 text-center">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRemoveBook(book.bookId)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals Section */}
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${quotationSummary.subtotal.toFixed(2)}</span>
                    </div>

                    {quotationSummary.generalDiscountPercent > 0 && (
                        <>
                            <div className="flex justify-between text-red-600">
                                <span className="text-gray-600">General Discount ({quotationSummary.generalDiscountPercent}%)</span>
                                <span className="font-medium">-${quotationSummary.discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-gray-800">Subtotal (After Discount)</span>
                                <span className="font-medium">${quotationSummary.subtotalAfterGeneralDiscount.toFixed(2)}</span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-600">Tax (5%):</span>
                        <span className="font-medium">${quotationSummary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-gray-300 pt-2 mt-2">
                        <span>Total:</span>
                        <span>${quotationSummary.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex gap-3 justify-end">
                <Button
                    onClick={() => router.push(`/quotation/${quotationId}`)}
                    variant="outline"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || books.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Book Selection Dialog */}
            <BookSelectionDialog
                open={bookDialogOpen}
                onOpenChange={setBookDialogOpen}
                onBooksSelected={handleBooksSelected}
                initialSelectedBooks={currentBookIds}
                mode="edit"
                buttonText="Update Books"
            />
        </div>
    );
}

