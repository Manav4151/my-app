// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import React, { useState, useEffect, Suspense, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { BookOpen, ArrowLeft, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { debounce, set } from 'lodash';
// import { apiFunctions } from "@/services/api.service";
// // ISBN validation functions
// // Remove all non-alphanumeric characters; keep digits and allow 'X' (uppercase) only as ISBN-10 check digit
// const cleanIsbnInput = (raw: string): string => {
//     if (!raw) return '';
//     const upper = raw.toUpperCase();
//     // Keep only digits and 'X'
//     const alnum = upper.replace(/[^0-9X]/g, '');
//     // If length > 10, it's potentially ISBN-13 → must be digits only
//     if (alnum.length > 10) {
//         return alnum.replace(/[^0-9]/g, '');
//     }
//     // For length <= 10, allow X but only at last position; if X appears earlier, remove it
//     if (alnum.includes('X') && alnum.indexOf('X') !== alnum.length - 1) {
//         return alnum.replace(/X/g, '');
//     }
//     return alnum;
// };

// const validateISBN10 = (cleanISBN: string): boolean => {
//     // Check if it's exactly 10 characters
//     if (cleanISBN.length !== 10) return false;

//     // Check if all characters except the last are digits
//     if (!/^\d{9}[\dX]$/.test(cleanISBN)) return false;

//     // Calculate checksum
//     let sum = 0;
//     for (let i = 0; i < 9; i++) {
//         sum += parseInt(cleanISBN[i]) * (10 - i);
//     }

//     // Handle the check digit
//     const checkDigit = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9]);
//     sum += checkDigit;

//     return sum % 11 === 0;
// };

// const validateISBN13 = (cleanISBN: string): boolean => {
//     // Check if it's exactly 13 characters and all digits
//     if (cleanISBN.length !== 13 || !/^\d{13}$/.test(cleanISBN)) return false;

//     // Calculate checksum
//     let sum = 0;
//     for (let i = 0; i < 12; i++) {
//         const digit = parseInt(cleanISBN[i]);
//         sum += digit * (i % 2 === 0 ? 1 : 3);
//     }

//     const checkDigit = (10 - (sum % 10)) % 10;
//     return checkDigit === parseInt(cleanISBN[12]);
// };

// const validateISBN = (isbn: string): boolean => {
//     if (!isbn || isbn.trim() === '') return false;
//     const cleanISBN = cleanIsbnInput(isbn);

//     // Check if it's ISBN-10 or ISBN-13
//     if (cleanISBN.length === 10) {
//         return validateISBN10(cleanISBN);
//     } else if (cleanISBN.length === 13) {
//         return validateISBN13(cleanISBN);
//     }

//     return false;
// };

// // Helper function to normalize ISBN for comparison/storage (plain number, allow X only as ISBN-10 check digit)
// const normalizeISBN = (isbn: string): string => {
//     if (!isbn) return '';
//     return cleanIsbnInput(isbn);
// };

// // Types based on the controller
// interface BookData {
//     title: string;
//     author: string;
//     year: number | null;
//     isbn?: string;
//     nonisbn?: string;
//     other_code?: string;
//     edition?: string;
//     binding_type: string;
//     classification: string;
//     remarks?: string;
//     imprint?: string; // Added field
//     publisher_exclusive?: string; // Added field
//     // Added to handle populated publisher from API
//     publisher?: { name: string };
// }
// interface PublisherSuggestion {
//     name: string;
// }
// interface PricingData {
//     source: string;
//     rate: number;
//     discount: number;
//     currency: string;
// }

// interface PublisherData {
//     publisher_name: string;
// }
// interface CheckResponse {
//     bookStatus: "NEW" | "DUPLICATE" | "CONFLICT";
//     pricingStatus?: "ADD_PRICE" | "UPDATE_PRICE" | "NO_CHANGE";
//     message: string;
//     details: {
//         existingBook?: any;
//         bookId?: string;
//         pricingId?: string;
//         conflictFields?: {
//             [key: string]: { old: any; new: any };
//         };
//         differences?: {
//             rate?: { old: number; new: number };
//             discount?: { old: number; new: number };
//         };
//     };
// }
// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
// function InsertBookPageContent() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const [step, setStep] = useState<"form" | "check" | "result">("form");
//     const [loading, setLoading] = useState(false);
//     const [checkResponse, setCheckResponse] = useState<CheckResponse | null>(null);
//     const [isEditMode, setIsEditMode] = useState(false);
//     const [editBookId, setEditBookId] = useState<string | null>(null);
//     const [initialLoading, setInitialLoading] = useState(false);
//     const [isNonISBN, setIsNonISBN] = useState(false);
//     const [isbnError, setIsbnError] = useState("");
//     // State for suggestions
//     const [bookSuggestions, setBookSuggestions] = useState<BookData[]>([]);
//     const [publisherSuggestions, setPublisherSuggestions] = useState<PublisherSuggestion[]>([]);
//     const [bookData, setBookData] = useState<BookData>({
//         title: "",
//         author: "",
//         year: 0,
//         isbn: "",
//         other_code: "",
//         edition: "",
//         binding_type: "",
//         classification: "",
//         remarks: "",
//         imprint: "", // Added field
//         publisher_exclusive: "", // Added field
//     });
//     const [publisherData, setPublisherData] = useState<PublisherData>(
//         {
//             publisher_name: "",
//         }
//     );
//     const [pricingData, setPricingData] = useState<PricingData>({
//         source: "",
//         rate: 0,
//         discount: 0,
//         currency: "USD",
//     });

//     // Handle URL parameters and fetch existing book data for edit mode
//     useEffect(() => {
//         const editParam = searchParams.get('edit');
//         const bookIdParam = searchParams.get('bookId');

//         if (editParam || bookIdParam) {
//             const bookId = editParam || bookIdParam;
//             if (bookId) {
//                 setIsEditMode(true);
//                 setEditBookId(bookId);
//                 fetchExistingBookData(bookId);
//             }
//         }
//     }, [searchParams]);

//     const fetchExistingBookData = async (bookId: string) => {
//         try {
//             setInitialLoading(true);
//             const result = await apiFunctions.getBookDetails(bookId);

//             if (!result.success) {
//                 throw new Error(`Failed to fetch book data: ${result.status}`);
//             }



//             if (result.success && result.book) {
//                 // Populate book data
//                 setBookData({

//                     title: result.book.title || "",
//                     author: result.book.author || "",
//                     year: result.book.year || 0,
//                     isbn: result.book.isbn || "",

//                     other_code: result.book.other_code || "",
//                     edition: result.book.edition || "",
//                     binding_type: result.book.binding_type || "",
//                     classification: result.book.classification || "",
//                     remarks: result.book.remarks || "",
//                     imprint: result.book.imprint || "", // Added field
//                     publisher_exclusive: result.book.publisher_exclusive || "", // Added field

//                 });

//                 // Populate publisher data separately
//                 setPublisherData({
//                     publisher_name: result.book.publisher_name || "",
//                 });

//                 // Set non-ISBN checkbox based on whether other_code exists
//                 setIsNonISBN(!!result.book.other_code && !result.book.isbn);

//                 // If there's pricing data, populate the first pricing entry
//                 if (result.pricing && result.pricing.length > 0) {
//                     const firstPricing = result.pricing[0];
//                     setPricingData({
//                         source: firstPricing.source || "",
//                         rate: firstPricing.rate || 0,
//                         discount: firstPricing.discount || 0,
//                         currency: firstPricing.currency || "USD",
//                     });
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching existing book data:", error);
//             toast.error("Failed to load book data for editing");
//         } finally {
//             setInitialLoading(false);
//         }
//     };
//     // Fetch Book Suggestions
//     const fetchBookSuggestions = async (query: string) => {
//         if (query.length < 2) {
//             setBookSuggestions([]);
//             return;
//         }
//         try {
//             const response = await apiFunctions.getBookSuggestions(query);
//             if (response.success) {
//                 setBookSuggestions(response.books);
//             }
//         } catch (error) {
//             console.error("Failed to fetch book suggestions:", error);
//         }
//     };

//     // Fetch Publisher Suggestions
//     const fetchPublisherSuggestions = async (query: string) => {
//         if (query.length < 2) {
//             setPublisherSuggestions([]);
//             return;
//         }
//         try {
//             const response = await apiFunctions.getPublisherSuggestions(query);
//             if (response.success) {
//                 setPublisherSuggestions(response.publishers);
//             }
//         } catch (error) {
//             console.error("Failed to fetch publisher suggestions:", error);
//         }
//     };

//     const debouncedFetchBookSuggestions = useCallback(debounce(fetchBookSuggestions, 300), []);
//     const debouncedFetchPublisherSuggestions = useCallback(debounce(fetchPublisherSuggestions, 300), []);

//     // --- Input Handlers ---

//     const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const newTitle = e.target.value;
//         setBookData({ ...bookData, title: newTitle });
//         debouncedFetchBookSuggestions(newTitle);
//     };

//     const handlePublisherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const newPublisherName = e.target.value;
//         setPublisherData({ publisher_name: newPublisherName });
//         debouncedFetchPublisherSuggestions(newPublisherName);
//     };

//     const handleBookSuggestionClick = (book: BookData) => {
//         setBookData({
//             ...bookData,
//             title: book.title,
//             author: book.author,
//             year: book.year,

//         });
//         setBookSuggestions([]);
//     };

//     const handlePublisherSuggestionClick = (publisher: PublisherSuggestion) => {
//         setPublisherData({ publisher_name: publisher.name });
//         setPublisherSuggestions([]);
//     };
//     // Handle ISBN validation
//     const handleISBNChange = (value: string) => {
//         // Store the normalized version (digits only; 'X' allowed only as ISBN-10 check digit)
//         const normalizedISBN = normalizeISBN(value);
//         setBookData({ ...bookData, isbn: normalizedISBN });

//         if (value && !validateISBN(value)) {
//             setIsbnError("Please enter a valid ISBN (10 or 13 digits)");
//         } else {
//             setIsbnError("");
//         }
//     };

//     // Handle other code change
//     const handleOtherCodeChange = (value: string) => {
//         setBookData({ ...bookData, other_code: value });
//     };


//     // Handle checkbox toggle
//     const handleNonISBNToggle = (checked: boolean) => {
//         setIsNonISBN(checked);
//         if (checked) {
//             // Clear ISBN when switching to other code
//             setBookData({ ...bookData, isbn: "", other_code: "" });
//             setIsbnError("");
//         } else {
//             // Clear other code when switching to ISBN
//             setBookData({ ...bookData, other_code: "", isbn: "" });
//         }
//     };

//     // Helper function to sanitize bookData before sending to backend
//     // Converts year: 0 to null since backend expects null for empty year
//     const sanitizeBookData = (data: BookData): BookData => {
//         const sanitized = { ...data };
//         // If year is 0 (default/not entered), set it to null for backend
//         if (sanitized.year === 0) {
//             sanitized.year = null;
//         }
//         return sanitized;
//     };

//     // Validate form before submission
//     const validateForm = (): boolean => {
//         if (!isNonISBN) {
//             // If not non-ISBN, ISBN is required and must be valid
//             if (!bookData.isbn || bookData.isbn.trim() === '') {
//                 setIsbnError("ISBN is required");
//                 return false;
//             }
//             // Validate the normalized ISBN
//             if (!validateISBN(bookData.isbn)) {
//                 setIsbnError("Please enter a valid ISBN (10 or 13 digits)");
//                 return false;
//             }
//         } else {
//             // If non-ISBN, other_code is required
//             if (!bookData.other_code || bookData.other_code.trim() === '') {
//                 toast.error("Other code is required for non-ISBN books");
//                 return false;
//             }
//         }
//         return true;
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // Validate form
//         if (!validateForm()) {
//             return;
//         }

//         setLoading(true);

//         try {
//             // Sanitize bookData before sending (convert year: 0 to null)
//             const sanitizedBookData = sanitizeBookData(bookData);

//             if (isEditMode && editBookId) {
//                 // Direct update for edit mode
//                 const response = await apiFunctions.updateBook(editBookId, {
//                     bookData: sanitizedBookData,
//                     pricingData,

//                 });

//                 if (!response.success) {
//                     throw new Error(`Failed to update book: ${response.status}`);
//                 }

//                 toast.success("Book updated successfully!");
//                 router.push(`/books/${editBookId}`);
//             } else {
//                 console.log("Publisher data in check", publisherData);

//                 // Check for duplicates in create mode
//                 const response = await apiFunctions.checkBookDuplicate({ bookData: sanitizedBookData, pricingData, publisherData });

//                 const result = await response.data;

//                 // Handle different response statuses
//                 if (response.statusCode === 409) {
//                     // Conflict response - this is expected and should be handled
//                     setCheckResponse(result);
//                     setStep("check");
//                 } else if (!result.success) {
//                     throw new Error(`Failed to check book: ${result.message}`);
//                 } else {
//                     // Success response (200)
//                     setCheckResponse(result);
//                     setStep("check");
//                 }
//             }
//         } catch (error) {
//             console.error("Error processing book:", error);
//             toast.error(isEditMode ? "Failed to update book" : "Failed to check book status");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleAction = async (action: string) => {
//         if (!checkResponse) return;

//         setLoading(true);
//         try {
//             // Sanitize bookData before sending (convert year: 0 to null)
//             const sanitizedBookData = sanitizeBookData(bookData);

//             // Simplified: The status is now always taken directly from the check response.
//             const payload = {
//                 bookData: sanitizedBookData,
//                 pricingData,
//                 publisherData,
//                 status: checkResponse.bookStatus,
//                 pricingAction: action,
//                 bookId: checkResponse.details?.bookId,
//                 pricingId: checkResponse.details?.pricingId,
//             };

//             const response = await apiFunctions.createBook(payload);

//             if (!response.success) {

//                 throw new Error(response.message || `Failed to ${action.toLowerCase()}: ${response.status}`);
//             }


//             toast.success(response.message || "Book operation completed successfully!");

//             if (response.book?._id) {
//                 router.push(`/books/${response.book._id}`);
//             } else {
//                 router.push("/books");
//             }

//         } catch (error: any) {
//             console.error("Error performing action:", error);
//             toast.error(error.message || `Failed to perform action.`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const renderForm = () => {
//         if (initialLoading) {
//             return (
//                 <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
//                     <div className="bg-[var(--surface)] shadow-lg rounded-2xl p-8 border border-[var(--border)]">
//                         <div className="flex justify-center items-center">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
//                             <span className="ml-3 text-[var(--text-secondary)]">Loading book data...</span>
//                         </div>
//                     </div>
//                 </div>
//             );
//         }

//         return (
//             <div className="min-h-screen bg-[var(--background)]">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">



//                     {/* Form */}
//                     <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--border)]">
//                         {/* Header */}
//                         <div className="mb-8">
//                             <Button
//                                 onClick={() => router.push(isEditMode && editBookId ? `/books/${editBookId}` : "/books")}
//                                 variant="ghost"
//                                 className="mb-6 text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border-[var(--border)]"
//                             >
//                                 <ArrowLeft className="w-4 h-4 mr-2" />
//                                 {isEditMode ? "Back to Book Details" : "Back"}
//                             </Button>

//                             <div className="text-center">
//                                 <div className="flex items-center justify-center">

//                                     <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mr-4 mb-4">
//                                         <BookOpen className="w-8 h-8 text-white" />
//                                     </div>
//                                     <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
//                                         {isEditMode ? "Edit Book Details" : "Insert New Book"}
//                                     </h1>
//                                 </div>
//                                 <p className="text-[var(--text-secondary)] text-lg">
//                                     {isEditMode
//                                         ? "Update the book details and pricing information below"
//                                         : "Fill in the book details and pricing information below"
//                                     }
//                                 </p>
//                             </div>
//                         </div>
//                         <form onSubmit={handleSubmit} className="space-y-8">
//                             {/* Book Information Section */}
//                             <div>
//                                 <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
//                                     Book Information
//                                 </h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     {/* title  */}
//                                     <div>
//                                         <Label htmlFor="title" className="text-[var(--text-primary)] font-medium">Title *</Label>
//                                         <Input
//                                             id="title"
//                                             value={bookData.title}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, title: e.target.value })
//                                             }
//                                             required
//                                             placeholder="e.g., The Great Gatsby"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     {/* Title Input with Suggestions */}
//                                     {/* <div className="relative">
//                                         <Label htmlFor="title" className="text-[var(--text-primary)] font-medium">Title *</Label>
//                                         <Input
//                                             id="title"
//                                             value={bookData.title}
//                                             onChange={handleTitleChange}
//                                             required
//                                             placeholder="e.g., The Great Gatsby"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                             autoComplete="off"
//                                         />
//                                         {bookSuggestions.length > 0 && (
//                                             <div className="absolute z-20 w-full mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg">
//                                                 {bookSuggestions.map((book, index) => (
//                                                     <div
//                                                         key={index}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-[var(--primary)]/10"
//                                                         onClick={() => handleBookSuggestionClick(book)}
//                                                     >
//                                                         <p className="font-semibold">{book.title}</p>
//                                                         <p className="text-sm text-[var(--text-secondary)]">{book.author}</p>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div> */}
//                                     <div>
//                                         <Label htmlFor="author" className="text-[var(--text-primary)] font-medium">Author *</Label>
//                                         <Input
//                                             id="author"
//                                             value={bookData.author}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, author: e.target.value })
//                                             }
//                                             required
//                                             placeholder="e.g., F. Scott Fitzgerald"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="year" className="text-[var(--text-primary)] font-medium">Publication Year</Label>
//                                         <Input
//                                             id="year"
//                                             type="number"
//                                             value={bookData.year || ''}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 if (value === '') {
//                                                     setBookData({ ...bookData, year: 0 });
//                                                 } else {
//                                                     const numValue = parseInt(value);
//                                                     if (!isNaN(numValue) && value.length <= 4) {
//                                                         setBookData({ ...bookData, year: numValue });
//                                                     }
//                                                 }
//                                             }}
//                                             min="1000"
//                                             max={new Date().getFullYear() + 1}
//                                             placeholder="e.g., 2023"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     {/* Publisher Input with Suggestions */}
//                                     <div className="relative">
//                                         <Label htmlFor="publisher_name" className="text-[var(--text-primary)] font-medium">Publisher *</Label>
//                                         <Input
//                                             id="publisher_name"
//                                             value={publisherData.publisher_name}
//                                             onChange={handlePublisherChange}
//                                             required
//                                             placeholder="e.g., Charles Scribner's Sons"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                             autoComplete="off"
//                                         />
//                                         {publisherSuggestions.length > 0 && (
//                                             <div className="absolute z-10 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-lg">
//                                                 {publisherSuggestions.map((pub, index) => (
//                                                     <div
//                                                         key={index}
//                                                         className="px-4 py-2 cursor-pointer hover:bg-[var(--primary)]/10 text-[var(--text-primary)]"
//                                                         onClick={() => handlePublisherSuggestionClick(pub)}
//                                                     >
//                                                         <p>{pub.name}</p>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <div className="flex items-center space-x-2 mb-2">
//                                             <input
//                                                 type="checkbox"
//                                                 id="non-isbn"
//                                                 checked={isNonISBN}
//                                                 onChange={(e) => handleNonISBNToggle(e.target.checked)}
//                                                 className="w-4 h-4 text-[var(--primary)] bg-[var(--surface-hover)] border-[var(--border)] rounded focus:ring-amber-500 focus:ring-2"
//                                             />
//                                             <Label htmlFor="non-isbn" className="text-[var(--text-primary)] font-medium">
//                                                 This book doesn&apos;t have an ISBN
//                                             </Label>
//                                         </div>

//                                         {!isNonISBN ? (
//                                             <div>
//                                                 <Label htmlFor="isbn" className="text-[var(--text-primary)] font-medium">
//                                                     ISBN *
//                                                 </Label>
//                                                 <Input
//                                                     id="isbn"
//                                                     value={bookData.isbn}
//                                                     onChange={(e) => handleISBNChange(e.target.value)}
//                                                     placeholder="e.g., 978-0743273565 or 0743273567"
//                                                     className={`mt-1 h-12 bg-[var(--surface)] border-2 focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl ${isbnError ? 'border-[var(--error)]' : 'border-[var(--border)]'
//                                                         }`}
//                                                 />
//                                                 {isbnError && (
//                                                     <p className="mt-1 text-sm text-[var(--error)]">{isbnError}</p>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             <div>
//                                                 <Label htmlFor="other_code" className="text-[var(--text-primary)] font-medium">
//                                                     Other Code *
//                                                 </Label>
//                                                 <Input
//                                                     id="other_code"
//                                                     value={bookData.other_code}
//                                                     onChange={(e) => handleOtherCodeChange(e.target.value)}
//                                                     placeholder="e.g., Internal code, SKU, or other identifier"
//                                                     className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                                 />
//                                             </div>
//                                         )}
//                                     </div>
//                                     {/* imprint */}
//                                     <div>
//                                         <Label htmlFor="imprint" className="text-[var(--text-primary)] font-medium">Imprint</Label>
//                                         <Input
//                                             id="imprint"
//                                             value={bookData.imprint}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, imprint: e.target.value })
//                                             }
//                                             placeholder="Imprint"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>

//                                     {/* publisher_exclusive */}
//                                     <div>
//                                         <Label htmlFor="publisher_exclusive" className="text-[var(--text-primary)] font-medium">Publisher Exclusive</Label>
//                                         <Input
//                                             id="publisher_exclusive"
//                                             value={bookData.publisher_exclusive}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, publisher_exclusive: e.target.value })
//                                             }
//                                             placeholder="Publisher Exclusive"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="edition" className="text-[var(--text-primary)] font-medium">Edition</Label>
//                                         <Input
//                                             id="edition"
//                                             value={bookData.edition}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, edition: e.target.value })
//                                             }
//                                             placeholder="e.g., First Edition"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="binding_type" className="text-[var(--text-primary)] font-medium">Binding Type</Label>
//                                         <Select
//                                             value={bookData.binding_type}
//                                             onValueChange={(value) =>
//                                                 setBookData({ ...bookData, binding_type: value })
//                                             }
//                                         >
//                                             <SelectTrigger className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl text-[var(--text-primary)]">
//                                                 <SelectValue placeholder="Select binding type" />
//                                             </SelectTrigger>
//                                             <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
//                                                 <SelectItem value="Hardcover" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">Hardcover</SelectItem>
//                                                 <SelectItem value="Paperback" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">Paperback</SelectItem>

//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="classification" className="text-[var(--text-primary)] font-medium">Classification</Label>
//                                         <Input
//                                             id="classification"
//                                             value={bookData.classification}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, classification: e.target.value })
//                                             }
//                                             placeholder="e.g., Fiction, Non-Fiction, Science, etc."
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div className="md:col-span-2">
//                                         <Label htmlFor="remarks" className="text-[var(--text-primary)] font-medium">Remarks</Label>
//                                         <Textarea
//                                             id="remarks"
//                                             value={bookData.remarks}
//                                             onChange={(e) =>
//                                                 setBookData({ ...bookData, remarks: e.target.value })
//                                             }
//                                             placeholder="Condition, special features, etc."
//                                             rows={3}
//                                             className="mt-1 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Pricing Information Section */}
//                             <div>
//                                 <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
//                                     Pricing Information
//                                 </h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                                     <div>
//                                         <Label htmlFor="source" className="text-[var(--text-primary)] font-medium">Source *</Label>
//                                         <Input
//                                             id="source"
//                                             value={pricingData.source}
//                                             onChange={(e) =>
//                                                 setPricingData({ ...pricingData, source: e.target.value })
//                                             }
//                                             required
//                                             placeholder="e.g., Local Bookstore"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="rate" className="text-[var(--text-primary)] font-medium">Rate *</Label>
//                                         <Input
//                                             id="rate"
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             value={pricingData.rate || ''}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 setPricingData({ ...pricingData, rate: value === '' ? 0 : parseFloat(value) || 0 })
//                                             }}
//                                             required
//                                             placeholder="0.00"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="discount" className="text-[var(--text-primary)] font-medium">Discount (%)</Label>
//                                         <Input
//                                             id="discount"
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             max="100"
//                                             value={pricingData.discount || ''}
//                                             onChange={(e) => {
//                                                 const value = e.target.value;
//                                                 setPricingData({ ...pricingData, discount: value === '' ? 0 : parseFloat(value) || 0 })
//                                             }}
//                                             placeholder="0.00"
//                                             className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
//                                         />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor="currency" className="text-[var(--text-primary)] font-medium">Currency</Label>
//                                         <Select
//                                             value={pricingData.currency}
//                                             onValueChange={(value) =>
//                                                 setPricingData({ ...pricingData, currency: value })
//                                             }
//                                         >
//                                             <SelectTrigger className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl text-[var(--text-primary)]">
//                                                 <SelectValue placeholder="Select currency" />
//                                             </SelectTrigger>
//                                             <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
//                                                 <SelectItem value="USD" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">USD - US Dollar</SelectItem>
//                                                 <SelectItem value="EUR" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">EUR - Euro</SelectItem>
//                                                 <SelectItem value="GBP" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">GBP - British Pound</SelectItem>
//                                                 <SelectItem value="CAD" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">CAD - Canadian Dollar</SelectItem>
//                                                 <SelectItem value="AUD" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">AUD - Australian Dollar</SelectItem>
//                                                 <SelectItem value="JPY" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">JPY - Japanese Yen</SelectItem>
//                                                 <SelectItem value="INR" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">INR - Indian Rupee</SelectItem>
//                                                 <SelectItem value="PKR" className="text-[var(--text-primary)] hover:bg-[var(--primary)]/10">PKR - Pakistani Rupee</SelectItem>
//                                             </SelectContent>
//                                         </Select>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Submit Button */}
//                             <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border)]">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={() => router.push(isEditMode && editBookId ? `/books/${editBookId}` : "/books")}
//                                     className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] h-10 px-4 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
//                                 >
//                                     Cancel
//                                 </Button>
//                                 <Button
//                                     type="submit"
//                                     disabled={loading}
//                                     className="h-10 px-8 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                                             {isEditMode ? "Updating..." : "Checking..."}
//                                         </>
//                                     ) : (
//                                         <>
//                                             <CheckCircle className="w-5 h-5 mr-2" />
//                                             {isEditMode ? "Update Book" : "Check Book Status"}
//                                         </>
//                                     )}
//                                 </Button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     const renderCheckResult = () => {
//         if (!checkResponse) return null;

//         // Simplified Destructuring: Get everything from the new response structure
//         const { bookStatus, pricingStatus, message, details } = checkResponse;

//         return (
//             <div className="min-h-screen bg-[var(--background)]">
//                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     {/* Header */}
//                     <div className="mb-8">
//                         <Button
//                             onClick={() => setStep("form")}
//                             variant="outline"
//                             className="mb-6 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
//                         >
//                             <ArrowLeft className="w-4 h-4 mr-2" />
//                             Back to Form
//                         </Button>

//                         <div className="text-center">
//                             <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
//                                 <Info className="w-8 h-8 text-white" />
//                             </div>
//                             <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Book Status Check</h1>
//                             <p className="text-[var(--text-secondary)] text-lg">
//                                 Review the results and choose your action
//                             </p>
//                         </div>
//                     </div>

//                     <div className="space-y-6">
//                         {/* Status Message */}
//                         <div className={`p-6 rounded-2xl border ${bookStatus === "NEW" ? "bg-[var(--success)]/10 border-[var(--success)]/20" :
//                             bookStatus === "DUPLICATE" ? "bg-[var(--primary)]/10 border-[var(--primary)]/20" :
//                                 "bg-[var(--warning)]/10 border-[var(--warning)]/20"
//                             }`}>
//                             <div className="flex items-center gap-3 mb-2">
//                                 {bookStatus === "NEW" && <CheckCircle className="w-6 h-6 text-[var(--success)]" />}
//                                 {bookStatus === "DUPLICATE" && <Info className="w-6 h-6 text-[var(--primary)]" />}
//                                 {bookStatus === "CONFLICT" && <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />}
//                                 <h2 className="text-xl font-semibold text-[var(--text-primary)]">
//                                     {bookStatus === "NEW" && "New Book Detected"}
//                                     {bookStatus === "DUPLICATE" && "Duplicate Book Found"}
//                                     {bookStatus === "CONFLICT" && "Conflict Detected"}
//                                 </h2>
//                             </div>
//                             <p className="text-[var(--text-primary)]">{message}</p>
//                         </div>

//                         {/* Conflict Fields Display */}
//                         {bookStatus === "CONFLICT" && details?.conflictFields && (
//                             <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
//                                 <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Conflict Details</h3>
//                                 <div className="space-y-4">
//                                     {Object.entries(details.conflictFields).map(([field, data]: [string, any]) => (
//                                         data && (
//                                             <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--warning)]/10 rounded-xl border border-[var(--warning)]/20">
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">Field</Label>
//                                                     <p className="text-sm text-[var(--text-primary)] capitalize">{field.replace('_', ' ')}</p>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">Existing Value</Label>
//                                                     <p className="text-sm text-[var(--text-primary)]">{String(data.old) || "N/A"}</p>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">New Value</Label>
//                                                     <p className="text-sm text-[var(--text-primary)]">{String(data.new) || "N/A"}</p>
//                                                 </div>
//                                             </div>
//                                         )
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Pricing Differences Display */}
//                         {bookStatus === "DUPLICATE" && pricingStatus === "UPDATE_PRICE" && details?.differences && (
//                             <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
//                                 <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Pricing Differences</h3>
//                                 <div className="space-y-4">
//                                     {Object.entries(details.differences).map(([field, data]: [string, any]) => (
//                                         data && (
//                                             <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/20">
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">Field</Label>
//                                                     <p className="text-sm text-[var(--text-primary)] capitalize">{field}</p>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">Existing Value</Label>
//                                                     <p className="text-sm text-[var(--text-primary)]">{data.old}</p>
//                                                 </div>
//                                                 <div>
//                                                     <Label className="text-sm font-medium text-[var(--text-primary)]">New Value</Label>
//                                                     <p className="text-sm text-[var(--text-primary)]">{data.new}</p>
//                                                 </div>
//                                             </div>
//                                         )
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Action Buttons */}
//                         <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
//                             <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Choose Your Action</h3>
//                             <div className="flex flex-wrap gap-4">

//                                 {/* Case 1: NEW BOOK */}
//                                 {bookStatus === "NEW" && (
//                                     <Button
//                                         onClick={() => handleAction("INSERT")}
//                                         disabled={loading}
//                                         className="h-12 px-6 bg-[var(--success)] hover:bg-[var(--success)]/90 text-white font-semibold rounded-xl"
//                                     >
//                                         {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Inserting...</> : <><CheckCircle className="w-5 h-5 mr-2" /> Insert Book</>}
//                                     </Button>
//                                 )}

//                                 {/* Case 2: CONFLICT DETECTED */}
//                                 {bookStatus === "CONFLICT" && (
//                                     <>

//                                         <Button
//                                             onClick={() => setStep("form")}
//                                             disabled={loading}
//                                             variant="outline"
//                                             className="h-12 px-6 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl"
//                                         >
//                                             Discard
//                                         </Button>
//                                     </>
//                                 )}

//                                 {/* Case 3: DUPLICATE BOOK FOUND */}
//                                 {bookStatus === "DUPLICATE" && (
//                                     <>
//                                         {pricingStatus === "ADD_PRICE" && (
//                                             <>
//                                                 <Button
//                                                     onClick={() => handleAction("ADD_PRICE")}
//                                                     disabled={loading}
//                                                     className="h-12 px-6 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl"
//                                                 >
//                                                     {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Adding...</> : "Add Price"}
//                                                 </Button>
//                                                 <Button
//                                                     onClick={() => setStep("form")}
//                                                     disabled={loading}
//                                                     variant="outline"
//                                                     className="h-12 px-6 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl"
//                                                 >
//                                                     Discard
//                                                 </Button>
//                                             </>
//                                         )}
//                                         {pricingStatus === "UPDATE_PRICE" && (
//                                             <>
//                                                 <Button
//                                                     onClick={() => handleAction("UPDATE_PRICE")}
//                                                     disabled={loading}
//                                                     className="h-12 px-6 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl"
//                                                 >
//                                                     {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...</> : "Update Price"}
//                                                 </Button>
//                                                 <Button
//                                                     onClick={() => setStep("form")}
//                                                     disabled={loading}
//                                                     variant="outline"
//                                                     className="h-12 px-6 border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] rounded-xl"
//                                                 >
//                                                     Discard Changes
//                                                 </Button>
//                                             </>
//                                         )}
//                                         {pricingStatus === "NO_CHANGE" && (
//                                             <div className="text-center py-4 w-full">
//                                                 <p className="text-[var(--text-secondary)]">Book and pricing are already up-to-date.</p>
//                                                 <Button
//                                                     onClick={() => router.push("/books")}
//                                                     className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)]"
//                                                 >
//                                                     Return to Book List
//                                                 </Button>
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     };
//     return (
//         <>
//             {step === "form" && renderForm()}
//             {step === "check" && renderCheckResult()}
//         </>
//     );
// }

// export default function InsertBookPage() {
//     return (
//         <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
//             <div className="bg-[var(--surface)] shadow-lg rounded-2xl p-8 border border-[var(--border)]">
//                 <div className="flex justify-center items-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
//                 </div>
//             </div>
//         </div>}>
//             <InsertBookPageContent />
//         </Suspense>
//     );
// }


"use client";

import React, { Suspense } from "react";
import { useBookForm } from "@/hooks/use-book-form";
import { BookForm } from "@/components/books/book-form";
import { CheckResult } from "@/components/books/check-result";

function InsertBookPageContent() {
    // All logic is inside this hook
    const logic = useBookForm();

    if (logic.initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="bg-[var(--surface)] p-8 rounded-2xl shadow-lg border">
                    <div className="flex items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><span className="ml-3">Loading...</span></div>
                </div>
            </div>
        );
    }

    // Simple Switch
    return logic.step === "check" && logic.checkResponse ? (
        <CheckResult
            checkResponse={logic.checkResponse}
            loading={logic.loading}
            onAction={logic.handleAction}
            onBack={() => logic.setStep("form")}
        />
    ) : (
        <BookForm logic={logic} />
    );
}

export default function InsertBookPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InsertBookPageContent />
        </Suspense>
    );
}