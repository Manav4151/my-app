import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

// Helper for consistent styling across the form
const inputStyles = "mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl transition-all";
const labelStyles = "text-[var(--text-primary)] font-medium";

interface BookFormProps {
    logic: any;
}

export function BookForm({ logic }: BookFormProps) {
    const {
        isEditMode, editBookId, router, loading, handleSubmit,
        bookData, setBookData, publisherData,
        pricingData, setPricingData,
        isNonISBN, handleNonISBNToggle, isbnError, handleISBNChange,
        handleTitleChange, handlePublisherChange,
        // bookSuggestions, // Uncomment if using suggestions for title
        publisherSuggestions, setPublisherData, setPublisherSuggestions
    } = logic;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-[var(--surface)] rounded-2xl p-8 shadow-sm border border-[var(--border)]">

                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            onClick={() => router.push(isEditMode && editBookId ? `/books/${editBookId}` : "/books")}
                            variant="ghost"
                            className="mb-6 text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> {isEditMode ? "Back" : "Back"}
                        </Button>
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-[var(--primary)]/20">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-[var(--text-primary)]">{isEditMode ? "Edit Book" : "Insert Book"}</h1>
                            </div>
                            <p className="text-[var(--text-secondary)] text-lg">Fill in the details below to {isEditMode ? "update the" : "add a new"} book.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* --- BOOK INFO SECTION --- */}
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                Book Information
                                <div className="h-px flex-1 bg-[var(--border)] ml-4"></div>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Title */}
                                <div>
                                    <Label htmlFor="title" className={labelStyles}>Title *</Label>
                                    <Input
                                        id="title"
                                        value={bookData.title}
                                        onChange={handleTitleChange}
                                        required
                                        placeholder="e.g., The Great Gatsby"
                                        className={inputStyles}
                                    />
                                </div>

                                {/* Author */}
                                <div>
                                    <Label htmlFor="author" className={labelStyles}>Author *</Label>
                                    <Input
                                        id="author"
                                        value={bookData.author}
                                        onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                                        required
                                        placeholder="e.g., F. Scott Fitzgerald"
                                        className={inputStyles}
                                    />
                                </div>

                                {/* Year */}
                                <div>
                                    <Label htmlFor="year" className={labelStyles}>Publication Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        placeholder="e.g., 1925"
                                        className={inputStyles}
                                        value={bookData.year || ''}
                                        onChange={(e) => setBookData({ ...bookData, year: e.target.value ? parseInt(e.target.value) : 0 })}
                                    />
                                </div>

                                {/* Publisher with Suggestions */}
                                <div className="relative">
                                    <Label htmlFor="publisher_name" className={labelStyles}>Publisher *</Label>
                                    <Input
                                        id="publisher_name"
                                        value={publisherData.publisher_name}
                                        onChange={handlePublisherChange}
                                        required
                                        placeholder="e.g., Scribner"
                                        className={inputStyles}
                                        autoComplete="off"
                                    />
                                    {publisherSuggestions.length > 0 && (
                                        <div className="absolute z-20 w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
                                            {publisherSuggestions.map((pub: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="px-4 py-3 cursor-pointer hover:bg-[var(--primary)]/10 text-[var(--text-primary)] transition-colors"
                                                    onClick={() => { setPublisherData({ publisher_name: pub.name }); setPublisherSuggestions([]); }}
                                                >
                                                    {pub.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ISBN / Other Code Logic */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <input
                                            type="checkbox"
                                            id="no-isbn"
                                            checked={isNonISBN}
                                            onChange={(e) => handleNonISBNToggle(e.target.checked)}
                                            className="w-4 h-4 text-[var(--primary)] rounded border-[var(--border)] focus:ring-[var(--primary)]"
                                        />
                                        <Label htmlFor="no-isbn" className="text-[var(--text-secondary)] cursor-pointer">This book doesn&apos;t have an ISBN</Label>
                                    </div>

                                    {!isNonISBN ? (
                                        <div>
                                            <Label className={labelStyles}>ISBN *</Label>
                                            <Input
                                                value={bookData.isbn}
                                                onChange={(e) => handleISBNChange(e.target.value)}
                                                placeholder="e.g., 978-3-16-148410-0"
                                                className={`${inputStyles} ${isbnError ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]' : ''}`}
                                            />
                                            {isbnError && <p className="text-sm text-[var(--error)] mt-2 font-medium flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-[var(--error)]"></span>{isbnError}</p>}
                                        </div>
                                    ) : (
                                        <div>
                                            <Label className={labelStyles}>Other Code *</Label>
                                            <Input
                                                value={bookData.other_code}
                                                onChange={(e) => setBookData({ ...bookData, other_code: e.target.value })}
                                                placeholder="Internal Code / SKU"
                                                className={inputStyles}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Extra Fields */}
                                <div>
                                    <Label className={labelStyles}>Imprint</Label>
                                    <Input
                                        value={bookData.imprint}
                                        onChange={(e) => setBookData({ ...bookData, imprint: e.target.value })}
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Publisher Exclusive</Label>
                                    <Input
                                        value={bookData.publisher_exclusive}
                                        onChange={(e) => setBookData({ ...bookData, publisher_exclusive: e.target.value })}
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Edition</Label>
                                    <Input
                                        value={bookData.edition}
                                        onChange={(e) => setBookData({ ...bookData, edition: e.target.value })}
                                        placeholder="e.g., 1st Edition"
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Binding</Label>
                                    <Select value={bookData.binding_type} onValueChange={(v) => setBookData({ ...bookData, binding_type: v })}>
                                        <SelectTrigger className={inputStyles}>
                                            <SelectValue placeholder="Select Binding" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
                                            <SelectItem value="Hardcover">Hardcover</SelectItem>
                                            <SelectItem value="Paperback">Paperback</SelectItem>
                                            <SelectItem value="Spiral">Spiral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className={labelStyles}>Classification</Label>
                                    <Input
                                        value={bookData.classification}
                                        onChange={(e) => setBookData({ ...bookData, classification: e.target.value })}
                                        placeholder="e.g., Fiction"
                                        className={inputStyles}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <Label className={labelStyles}>Remarks</Label>
                                    <Textarea
                                        value={bookData.remarks}
                                        onChange={(e) => setBookData({ ...bookData, remarks: e.target.value })}
                                        placeholder="Enter any additional notes here..."
                                        className="mt-1 min-h-[100px] bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl p-4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- PRICING SECTION --- */}
                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                Pricing Information
                                <div className="h-px flex-1 bg-[var(--border)] ml-4"></div>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <Label className={labelStyles}>Source *</Label>
                                    <Input
                                        value={pricingData.source}
                                        onChange={(e) => setPricingData({ ...pricingData, source: e.target.value })}
                                        required
                                        placeholder="e.g., Vendor A"
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Rate *</Label>
                                    <Input
                                        type="number"
                                        value={pricingData.rate || ''}
                                        onChange={(e) => setPricingData({ ...pricingData, rate: parseFloat(e.target.value) || 0 })}
                                        required
                                        placeholder="0.00"
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Discount %</Label>
                                    <Input
                                        type="number"
                                        value={pricingData.discount || ''}
                                        onChange={(e) => setPricingData({ ...pricingData, discount: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                        className={inputStyles}
                                    />
                                </div>

                                <div>
                                    <Label className={labelStyles}>Currency</Label>
                                    <Select value={pricingData.currency} onValueChange={(v) => setPricingData({ ...pricingData, currency: v })}>
                                        <SelectTrigger className={inputStyles}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="INR">INR (₹)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-[var(--border)]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/books")}
                                className="h-12 px-6 rounded-xl border-2 border-[var(--border)] hover:bg-[var(--surface-hover)]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-12 px-8 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                    <><CheckCircle className="w-5 h-5 mr-2" /> {isEditMode ? "Update Book" : "Check Status"}</>
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}