// "use client";

// import { useState, useEffect, Suspense } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// // Make sure this import path is correct for your project
// import { apiFunctions, ApiError } from '@/services/api.service';
// import { Input } from '@/app/components/ui/input';
// import { Label } from '@/app/components/ui/label';
// import { Button } from '@/app/components/ui/button';
// import { toast } from 'sonner';

// // A map to store quantities: { "bookId": quantity }
// type Quantities = {
//     [bookId: string]: number;
// };
// type QuotationPreviewBook = {
//     bookId: string;
//     title: string;
//     isbn: string;
//     publisher_name: string;
//     lowestPrice: number;
//     currency: string;
// };
// // === NEW ===: A map to store per-book discounts: { "bookId": discountPercent }
// type BookDiscounts = {
//  [bookId: string]: number;
// };
// type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
// function QuotationPage() {
//     const router = useRouter();
//     const searchParams = useSearchParams();

//     const [books, setBooks] = useState<QuotationPreviewBook[]>([]);
//     const [quantities, setQuantities] = useState<Quantities>({});
//     const [customerId, setCustomerId] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [isGenerating, setIsGenerating] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     // === NEW ===: State for discounts
// const [bookDiscounts, setBookDiscounts] = useState<BookDiscounts>({});
//     const [generalDiscount, setGeneralDiscount] = useState<string>(""); // Use string for flexible input
//     // 1. Fetch book data when the page loads
//     useEffect(() => {
//         const fetchQuotationPreview = async () => {
//             try {
//                 // Step 1: Read the selected book IDs from the URL
//                 const bookIds = searchParams.getAll('id');

//                 if (bookIds.length === 0) {
//                     toast.error("No books selected.");
//                     router.push('/books');
//                     return;
//                 }

//                 setLoading(true);

//                 // Step 2: Call the backend API to get preview data
//                 const data = await apiFunctions.getQuotationPreview(bookIds);
//                 const response = data.data;
//                 // 👆 You can log this to understand what you got:
//                 console.log("Quotation Preview Response:", response);

//                 // Step 3: Set state with response data
//                 setBooks(response);

//                 // Step 4: Initialize quantity = 1 for all fetched books
//                 const initialQuantities = response.reduce(
//                     (acc: Quantities, book: QuotationPreviewBook) => {
//                         acc[book.bookId] = 1;
//                         return acc;
//                     },
//                     {} as Quantities
//                 );
//                 setQuantities(initialQuantities);

//             } catch (err) {
//                 console.error("Quotation preview error:", err);
//                 setError(err instanceof ApiError ? err.message : "Failed to load book details");
//             } finally {
//                 // Step 5: Stop loading state
//                 setLoading(false);
//             }
//         };

//         // ✅ Call the async function
//         fetchQuotationPreview();

//         // Dependencies: re-run when these change
//     }, [searchParams, router]);

//     // Handler to update quantity
//     const handleQuantityChange = (bookId: string, value: string) => {
//         const quantity = parseInt(value, 10);
//         setQuantities(prev => ({
//             ...prev,
//             [bookId]: isNaN(quantity) || quantity < 1 ? 1 : quantity // Default to 1
//         }));
//     };

//     // This is your "Save" button's function
//     const handleGeneratePdf = async () => {
//         if (!customerId.trim()) {
//             toast.error("Please enter a Customer ID or Name.");
//             return;
//         }

//         setIsGenerating(true);
//         toast.loading("Generating your quotation... please wait.");

//         // Create the final payload
//         const items = books.map(book => ({
//             bookId: book.bookId,
//             quantity: quantities[book.bookId] || 1
//         }));

//         try {
//             // Call the final API with customer and items
//             // const pdfBlob = await apiFunctions.generateQuotation(customerId, items);

//             // downloadFile(pdfBlob, `quotation-${customerId}-${new Date().toISOString().split('T')[0]}.pdf`);

//             // toast.dismiss();
//             // toast.success("Quotation downloaded!");
//             // router.push('/'); // Go back home after success

//         } catch (err) {
//             console.error("Quotation error:", err);
//             toast.dismiss();
//             toast.error(err instanceof Error ? err.message : "Could not generate quotation.");
//         } finally {
//             setIsGenerating(false);
//         }
//     };

//     // Calculate totals for display
//     const subtotal = books.reduce((acc, book) => {
//         const price = book.lowestPrice || 0;
//         const quantity = quantities[book.bookId] || 1;
//         return acc + (price * quantity);
//     }, 0);

//     const tax = subtotal * 0.05; // Example 5% tax
//     const total = subtotal + tax;

//     if (loading) {
//         return <div className="p-8 text-center">Loading book details...</div>;
//     }
//     if (error) {
//         return <div className="p-8 text-center text-red-600">Error: {error}</div>;
//     }

//     // --- This is the JSX for your page ---
//     return (
//         <div className="max-w-6xl mx-auto p-8">
//             <h1 className="text-3xl font-bold mb-6">Create Quotation</h1>

//             {/* === 2. CUSTOMER ID FIELD === */}
//             <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
//                 <Label htmlFor="customer-id" className="text-lg font-medium">Customer ID / Name</Label>
//                 <Input
//                     id="customer-id"
//                     placeholder="Enter customer identifier..."
//                     value={customerId}
//                     onChange={(e: InputChangeEvent) => setCustomerId(e.target.value)}
//                     className="mt-2 text-lg h-12"
//                 />
//             </div>

//             {/* === 1. DISPLAY SELECTED BOOKS === */}
//             <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
//                 <table className="min-w-full divide-y divide-amber-100">
//                     <thead className="bg-amber-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left ...">Title</th>
//                             <th className="px-6 py-3 text-left ...">ISBN</th>
//                             <th className="px-6 py-3 text-left ...">Publisher</th>
//                             <th className="px-6 py-3 text-left ...">Unit Price</th>
//                             {/* === 3. QUANTITY FIELD === */}
//                             <th className="px-6 py-3 text-left ...">Quantity</th>
//                             <th className="px-6 py-3 text-right ...">Total</th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-amber-100">
//                         {books.map((book) => (
//                             <tr key={book.bookId}>
//                                 <td className="px-6 py-4">{book.title}</td>
//                                 <td className="px-6 py-4">{book.isbn}</td>
//                                 <td className="px-6 py-4">{book.publisher_name}</td>
//                                 <td className="px-6 py-4">{book.currency} ${book.lowestPrice.toFixed(2)}</td>
//                                 <td className="px-6 py-4">
//                                     {/* === 3. QUANTITY FIELD === */}
//                                     <Input
//                                         type="number"
//                                         min="1"
//                                         value={quantities[book.bookId] || 1}
//                                         onChange={(e: InputChangeEvent) => handleQuantityChange(book.bookId, e.target.value)}
//                                         className="w-20"
//                                     />
//                                 </td>
//                                 <td className="px-6 py-4 text-right font-medium">
//                                     ${(book.lowestPrice * (quantities[book.bookId] || 1)).toFixed(2)}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Totals Section */}
//             <div className="mt-6 flex justify-end">
//                 <div className="w-full max-w-sm space-y-2">
//                     <div className="flex justify-between">
//                         <span className="text-gray-600">Subtotal:</span>
//                         <span className="font-medium">${subtotal.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                         <span className="text-gray-600">Tax (5%):</span>
//                         <span className="font-medium">${tax.toFixed(2)}</span>
//                     </div>
//                     <div className="flex justify-between text-xl font-bold">
//                         <span>Total:</span>
//                         <span>${total.toFixed(2)}</span>
//                     </div>
//                 </div>
//             </div>

//             {/* === 4. SAVE BUTTON === */}
//             <div className="mt-8 text-right">
//                 <Button
//                     onClick={handleGeneratePdf}
//                     disabled={isGenerating || books.length === 0}
//                     className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-lg"
//                 >
//                     {isGenerating ? "Generating..." : "Generate & Download PDF"}
//                 </Button>
//             </div>
//         </div>
//     );
// }

// // We wrap the component in <Suspense> because useSearchParams() requires it.
// export default function QuotationPageWrapper() {
//     return (
//         <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
//             <QuotationPage />
//         </Suspense>
//     );
// }

"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// Make sure this import path is correct for your project
// I've added downloadFile here, assuming it's in your api.service
import { apiFunctions, ApiError } from '@/services/api.service';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

// A map to store quantities: { "bookId": quantity }
type Quantities = {
    [bookId: string]: number;
};

// A map to store per-book discounts: { "bookId": discountPercent }
type BookDiscounts = {
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
// === NEW: This is the structure for the API payload ===
// Based on your quotationItemSchema
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
};
function QuotationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [books, setBooks] = useState<QuotationPreviewBook[]>([]);
    const [quantities, setQuantities] = useState<Quantities>({});
    const [customerId, setCustomerId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for discounts
    const [bookDiscounts, setBookDiscounts] = useState<BookDiscounts>({});
    const [generalDiscount, setGeneralDiscount] = useState<string>(""); // Use string for flexible input

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
            const price = book.lowestPrice || 0;
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
    }, [books, quantities, bookDiscounts, generalDiscount]);
    // helper for build payload
    const buildQuotationPayload = (): QuotationPayload => {
        // Prepare calculated line items
        const calculatedItems: QuotationPayloadItem[] = books.map(book => {
            const unitPrice = book.lowestPrice || 0;
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
            const unitPrice = book.lowestPrice || 0;
            const quantity = quantities[book.bookId] || 1;
            const discountPercent = bookDiscounts[book.bookId] || 0;
            const lineItemGrossTotal = unitPrice * quantity;
            return acc + (lineItemGrossTotal * discountPercent / 100);
        }, 0);

        const subTotalAfterItemDiscounts = subtotal - totalItemDiscountAmount;
        const generalDiscountAmount = subTotalAfterItemDiscounts * (generalDiscountPercent / 100);
        const totalDiscountAmount = totalItemDiscountAmount + generalDiscountAmount;

        // Set validity for 30 days from now
        const validUntilDate = new Date();
        validUntilDate.setDate(validUntilDate.getDate() + 30);

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

        return payload;
    };


    // This is your "Save" button's function
    const handleGeneratePdf = async () => {
        const payload = buildQuotationPayload();

        try {

          const response = await apiFunctions.createQuotation( payload);

          if (!response.success) {
            throw new Error(response.message);
          }
          toast.success(response.message || "Quotation created successfully!");
          // Reset the form
          setGeneralDiscount("0");
          setQuantities({});
          setBookDiscounts({});
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
        <div className="max-w-6xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Create Quotation</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* === CUSTOMER ID FIELD === */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
                    <Label htmlFor="customer-id" className="text-lg font-medium">Customer ID / Name</Label>
                    <Input
                        id="customer-id"
                        placeholder="Enter customer identifier..."
                        value={customerId}
                        onChange={(e: InputChangeEvent) => setCustomerId(e.target.value)}
                        className="mt-2 text-lg h-12"
                    />
                </div>

                {/* === NEW: GENERAL DISCOUNT FIELD === */}
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
            </div>

            {/* === DISPLAY SELECTED BOOKS === */}
            <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
                <table className="min-w-full divide-y divide-amber-100">
                    <thead className="bg-amber-50">
                        <tr>
                            <th className="px-6 py-3 text-left ...">Title</th>
                            <th className="px-6 py-3 text-left ...">ISBN</th>
                            <th className="px-6 py-3 text-left ...">Publisher</th>
                            <th className="px-6 py-3 text-left ...">Unit Price</th>
                            <th className="px-6 py-3 text-left ...">Discount (%)</th>
                            <th className="px-6 py-3 text-left ...">Quantity</th>
                            <th className="px-6 py-3 text-right ...">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-amber-100">
                        {books.map((book) => (
                            <tr key={book.bookId}>
                                <td className="px-6 py-4">{book.title}</td>
                                <td className="px-6 py-4">{book.isbn}</td>
                                <td className="px-6 py-4">{book.publisher_name}</td>
                                <td className="px-6 py-4">{book.currency} ${book.lowestPrice.toFixed(2)}</td>

                                {/* === NEW: PER-BOOK DISCOUNT FIELD === */}
                                <td className="px-6 py-4">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        // Use `|| ''` to show an empty box instead of '0'
                                        value={bookDiscounts[book.bookId] || ''}
                                        onChange={(e: InputChangeEvent) => handleBookDiscountChange(book.bookId, e.target.value)}
                                        className="w-20"
                                        placeholder="0"
                                    />
                                </td>

                                <td className="px-6 py-4">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={quantities[book.bookId] || 1}
                                        onChange={(e: InputChangeEvent) => handleQuantityChange(book.bookId, e.target.value)}
                                        className="w-20"
                                    />
                                </td>

                                {/* === UPDATED: LINE TOTAL CALCULATION === */}
                                <td className="px-6 py-4 text-right font-medium">
                                    ${
                                        (
                                            (book.lowestPrice * (1 - (bookDiscounts[book.bookId] || 0) / 100)) *
                                            (quantities[book.bookId] || 1)
                                        ).toFixed(2)
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* === UPDATED: Totals Section === */}
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

            {/* === SAVE BUTTON === */}
            <div className="mt-8 text-right">
                <Button
                    onClick={handleGeneratePdf}
                    disabled={isGenerating || books.length === 0}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 text-lg"
                >
                    {isGenerating ? "Generating..." : "Generate & Download PDF"}
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