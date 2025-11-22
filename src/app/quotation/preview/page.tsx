"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { apiFunctions, ApiError } from '@/services/api.service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Minus, ArrowLeft } from 'lucide-react';


type Quantities = {
    [bookId: string]: number;
};


type BookDiscounts = {
    [bookId: string]: number;
};


type CustomPrices = {
    [bookId: string]: number;
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
    book: string;       // bookId
    quantity: number;
    unitPrice: number;  // original unit price
    discount: number;   // per-item discount percentage
    totalPrice: number; // (unitPrice * (1 - discount/100)) * quantity
};

// Based on your quotationSchema
type QuotationPayload = {
    customer: string; // customerId
    items: QuotationPayloadItem[];
    subTotal: number; // Gross total (sum of all unitPrice * quantity)
    totalDiscount: number; // Total monetary value of all discounts
    grandTotal: number; // Final payable amount (after discounts and tax)
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    validUntil: string; // ISO date string
    emailInfo?: {
        messageId: string;
        sender: string;
        subject: string;
        receivedAt: string;
        snippet?: string;
    };
};
function QuotationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [books, setBooks] = useState<QuotationPreviewBook[]>([]);
    const [quantities, setQuantities] = useState<Quantities>({});
    const [customerId, setCustomerId] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for discounts
    const [bookDiscounts, setBookDiscounts] = useState<BookDiscounts>({});
    const [generalDiscount, setGeneralDiscount] = useState<string>(""); // Use string for flexible input

    // State for custom prices
    const [customPrices, setCustomPrices] = useState<CustomPrices>({});

    // Initialize validUntil to 30 days from now
    useEffect(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setValidUntil(date.toISOString().split('T')[0]);
    }, []);

    // 1. Fetch book data when the page loads
    useEffect(() => {
        const fetchQuotationPreview = async () => {
            try {
                const bookIds = searchParams.getAll('id');

                if (bookIds.length === 0) {
                    toast.error("No books selected.");
                    router.push('/books');
                    return;
                }

                setLoading(true);

                const data = await apiFunctions.getQuotationPreview(bookIds);
                const response = data.data;
                console.log("Quotation Preview Response:", response);

                setBooks(response);

                // Initialize quantity = 1 for all fetched books
                const initialQuantities = response.reduce(
                    (acc: Quantities, book: QuotationPreviewBook) => {
                        acc[book.bookId] = 1;
                        return acc;
                    },
                    {} as Quantities
                );
                setQuantities(initialQuantities);

                // Initialize custom prices with lowestPrice
                const initialCustomPrices = response.reduce(
                    (acc: CustomPrices, book: QuotationPreviewBook) => {
                        acc[book.bookId] = book.lowestPrice || 0;
                        return acc;
                    },
                    {} as CustomPrices
                );
                setCustomPrices(initialCustomPrices);

                // Initialize discounts to an empty object
                setBookDiscounts({});

            } catch (err) {
                console.error("Quotation preview error:", err);
                setError(err instanceof ApiError ? err.message : "Failed to load book details");
            } finally {
                setLoading(false);
            }
        };

        fetchQuotationPreview();
    }, [searchParams, router]);

    // Handler to update quantity
    const handleQuantityChange = (bookId: string, value: string) => {
        const quantity = parseInt(value, 10);
        setQuantities(prev => ({
            ...prev,
            [bookId]: isNaN(quantity) || quantity < 1 ? 1 : quantity
        }));
    };

    // Handler to increment quantity
    const handleQuantityIncrement = (bookId: string) => {
        setQuantities(prev => ({
            ...prev,
            [bookId]: (prev[bookId] || 1) + 1
        }));
    };

    // Handler to decrement quantity
    const handleQuantityDecrement = (bookId: string) => {
        setQuantities(prev => {
            const current = prev[bookId] || 1;
            return {
                ...prev,
                [bookId]: current > 1 ? current - 1 : 1
            };
        });
    };

    // Handler to update custom price
    const handleCustomPriceChange = (bookId: string, value: string) => {
        const price = parseFloat(value);
        setCustomPrices(prev => ({
            ...prev,
            [bookId]: isNaN(price) || price < 0 ? 0 : price
        }));
    };

    // Handler to update per-book discount
    const handleBookDiscountChange = (bookId: string, value: string) => {
        const discount = parseFloat(value);
        setBookDiscounts(prev => ({
            ...prev,
            // Store 0 if input is empty/invalid, else store the number
            [bookId]: isNaN(discount) || discount < 0 ? 0 : discount
        }));
    };
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
    // helper for build payload
    const buildQuotationPayload = (): QuotationPayload => {
        // Prepare calculated line items
        const calculatedItems: QuotationPayloadItem[] = books.map(book => {
            const unitPrice = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : (book.lowestPrice || 0);
            const quantity = quantities[book.bookId] || 1;
            const discountPercent = bookDiscounts[book.bookId] || 0;

            const lineItemGrossTotal = unitPrice * quantity;
            const lineItemDiscountAmount = lineItemGrossTotal * (discountPercent / 100);
            const lineItemFinalTotal = lineItemGrossTotal - lineItemDiscountAmount;

            return {
                book: book.bookId,            // Book reference (ObjectId string)
                quantity,                     // Number of units
                unitPrice,                    // Base price per unit
                discount: discountPercent,    // Per-book discount percentage
                totalPrice: lineItemFinalTotal // Final total after discount
            };
        });

        // Extract values from quotationSummary
        const {
            subtotal,
            total,
            generalDiscountPercent,
        } = quotationSummary;

        // Calculate combined discount amount (book + general)
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

        // Check for email info in query params
        const emailMessageId = searchParams.get('emailMessageId');
        const emailSender = searchParams.get('emailSender');
        const emailSubject = searchParams.get('emailSubject');
        const emailReceivedAt = searchParams.get('emailReceivedAt');
        const emailSnippet = searchParams.get('emailSnippet');

        // Assemble final payload
        const payload: QuotationPayload = {
            customer: customerId,
            items: calculatedItems,
            subTotal: subtotal,              // from quotationSummary
            totalDiscount: totalDiscountAmount,
            grandTotal: total,               // from quotationSummary
            status: "Draft",
            validUntil: validUntilDate.toISOString()
        };

        // Add email info if present
        if (emailMessageId && emailSender && emailSubject && emailReceivedAt) {
            payload.emailInfo = {
                messageId: emailMessageId,
                sender: emailSender,
                subject: emailSubject,
                receivedAt: emailReceivedAt,
                snippet: emailSnippet || undefined
            };
        }

        return payload;
    };


    // This is your "Save" button's function
    const handleGeneratePdf = async () => {
        const payload = buildQuotationPayload();

        try {

            const response = await apiFunctions.createQuotation(payload);

            if (!response.success) {
                throw new Error(response.message);
            }
            toast.success(response.message || "Quotation created successfully!");
            // Reset the form
            setGeneralDiscount("0");
            setQuantities({});
            setBookDiscounts({});
            setCustomPrices({});
            setBooks([]);
            router.push("/quotation");

        } catch (err) {
            console.error("Quotation error:", err);
            toast.dismiss();
            toast.error(err instanceof Error ? err.message : "Could not generate quotation.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Calculate totals for display, including discounts
    // const subtotal = books.reduce((acc, book) => {
    //     const price = book.lowestPrice || 0;
    //     const quantity = quantities[book.bookId] || 1;
    //     const discountPercent = bookDiscounts[book.bookId] || 0;
    //     // Apply per-book discount
    //     const discountedPrice = price * (1 - discountPercent / 100);
    //     return acc + (discountedPrice * quantity);
    // }, 0);

    // const generalDiscountPercent = parseFloat(generalDiscount) || 0;
    // const discountAmount = subtotal * (generalDiscountPercent / 100);
    // const subtotalAfterGeneralDiscount = subtotal - discountAmount;

    // const tax = subtotalAfterGeneralDiscount * 0.05; // 5% tax on the *discounted* subtotal
    // const total = subtotalAfterGeneralDiscount + tax;

    if (loading) {
        return <div className="p-8 text-center">Loading book details...</div>;
    }
    if (error) {
        return <div className="p-8 text-center text-red-600">Error: {error}</div>;
    }

    // --- This is the JSX for your page ---
    return (
        <div className="max-w-7xl mx-auto p-8 bg-[var(--background)]">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/quotation")}
                    className="mb-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Quotations
                </Button>
                <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Create Quotation</h1>
                <p className="text-[var(--text-secondary)]">Fill in the details to create a new quotation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* === CUSTOMER ID FIELD === */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
                    <Label htmlFor="customer-id" className="text-lg font-medium text-[var(--text-primary)]">Customer ID</Label>
                    <Input
                        id="customer-id"
                        placeholder="Enter customer ID..."
                        value={customerId}
                        onChange={(e: InputChangeEvent) => setCustomerId(e.target.value)}
                        className="mt-2 text-lg h-12"
                    />
                </div>

                {/* === GENERAL DISCOUNT FIELD === */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
                    <Label htmlFor="general-discount" className="text-lg font-medium text-[var(--text-primary)]">General Discount (%)</Label>
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

                {/* === VALID UNTIL DATE FIELD === */}
                <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
                    <Label htmlFor="valid-until" className="text-lg font-medium text-[var(--text-primary)]">Valid Until</Label>
                    <Input
                        id="valid-until"
                        type="date"
                        value={validUntil}
                        onChange={(e: InputChangeEvent) => setValidUntil(e.target.value)}
                        className="mt-2 text-lg h-12"
                    />
                </div>
            </div>

            {/* === DISPLAY SELECTED BOOKS === */}
            <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">Books</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--border)]" style={{ minWidth: '1000px', tableLayout: 'fixed' }}>
                        <thead className="bg-[var(--surface-hover)]">
                            <tr>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '25%' }}>Title & ISBN</th>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '10%' }}>Publisher</th>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '9%' }}>Original Price</th>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '10%' }}>Custom Price</th>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '8%' }}>Discount (%)</th>
                                <th className="px-3 py-3 text-left text-[var(--text-secondary)]" style={{ width: '10%' }}>Quantity</th>
                                <th className="px-3 py-3 text-right text-[var(--text-secondary)]" style={{ width: '15%' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                            {books.map((book) => {
                                const customPrice = customPrices[book.bookId] !== undefined ? customPrices[book.bookId] : book.lowestPrice;
                                const quantity = quantities[book.bookId] || 1;
                                const discountPercent = bookDiscounts[book.bookId] || 0;
                                const discountedPrice = customPrice * (1 - discountPercent / 100);
                                const lineTotal = discountedPrice * quantity;

                                return (
                                    <tr key={book.bookId} className="hover:bg-[var(--surface-hover)]">
                                        <td className="px-3 py-4">
                                            <div className="break-words whitespace-normal">
                                                <div className="font-medium text-[var(--text-primary)]">{book.title}</div>
                                                <div className="text-xs text-[var(--text-secondary)] mt-1">ISBN: {book.isbn}</div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 truncate text-[var(--text-primary)]">{book.publisher_name}</td>
                                        <td className="px-3 py-4 text-[var(--text-secondary)]">
                                            <div className="flex flex-col">
                                                <span className="text-xs">{book.currency}</span>
                                                <span className="font-medium text-[var(--text-primary)]">${book.lowestPrice.toFixed(2)}</span>
                                            </div>
                                        </td>

                                        {/* === NEW: CUSTOM PRICE FIELD === */}
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

                                        {/* === PER-BOOK DISCOUNT FIELD === */}
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

                                        {/* === QUANTITY WITH +/- BUTTONS === */}
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

                                        {/* === LINE TOTAL CALCULATION === */}
                                        <td className="px-3 py-4 text-right font-medium whitespace-nowrap">
                                            ${lineTotal.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* === UPDATED: Totals Section === */}
            <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Subtotal:</span>
                        <span className="font-medium text-[var(--text-primary)]">${quotationSummary.subtotal.toFixed(2)}</span>
                    </div>

                    {quotationSummary.generalDiscountPercent > 0 && (
                        <>
                            <div className="flex justify-between text-[var(--error)]">
                                <span className="text-[var(--text-secondary)]">General Discount ({quotationSummary.generalDiscountPercent}%)</span>
                                <span className="font-medium">-${quotationSummary.discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span className="text-[var(--text-primary)]">Subtotal (After Discount)</span>
                                <span className="font-medium text-[var(--text-primary)]">${quotationSummary.subtotalAfterGeneralDiscount.toFixed(2)}</span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-between border-t border-[var(--border)] pt-2 mt-2">
                        <span className="text-[var(--text-secondary)]">Tax (5%):</span>
                        <span className="font-medium text-[var(--text-primary)]">${quotationSummary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-[var(--border)] pt-2 mt-2">
                        <span className="text-[var(--text-primary)]">Total:</span>
                        <span className="text-[var(--text-primary)]">${quotationSummary.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* === SAVE BUTTON === */}
            <div className="mt-8 flex gap-3 justify-end">
                <Button
                    onClick={() => router.push("/quotation")}
                    variant="outline"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || books.length === 0}
                    className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 text-lg"
                >
                    {isGenerating ? "Creating..." : "Create Quotation"}
                </Button>
            </div>
        </div>
    );
}

// We wrap the component in <Suspense> because useSearchParams() requires it.
export default function QuotationPageWrapper() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <QuotationPage />
        </Suspense>
    );
}