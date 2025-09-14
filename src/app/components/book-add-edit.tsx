"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import {
    BookOpen,
    User,
    Hash,
    Calendar,
    Building,
    DollarSign,
    Globe,
    MessageSquare,
    X,
    Save,
    Plus,
    Sparkles
} from "lucide-react";

interface Book {
    _id?: string;
    book_id?: number;
    isbn?: string;
    title: string;
    author: string;
    edition?: string | null;
    year: number;
    publisher_id?: string;
    publisher_name: string;
    binding_type: string;
    classification: string;
    remarks?: string;
    source: string;
    price: number;
    currency: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    nonisbn?: string | null;
    other_code?: string | null;
}

interface BookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    formData: Partial<Book> | null;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Book> | null>>;
    isEditing: boolean;
}

const BookModal: React.FC<BookModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isEditing
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 rounded-3xl shadow-2xl border-0 p-0">
                {/* Header with Gradient Background */}
                <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-8 py-6 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                {isEditing ? <Save className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                            </div>
                            {isEditing ? "Edit Book" : "Add New Book"}
                        </DialogTitle>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <p className="text-amber-100 mt-2 text-sm">
                        {isEditing ? "Update the book details below" : "Fill in the details to add a new book to your library"}
                    </p>
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-20 opacity-20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-20 opacity-20">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                    <form onSubmit={onSubmit} className="space-y-8">
                        {/* Book Information Section */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-100/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Book Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="title" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-amber-500" />
                                        Title *
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData?.title || ""}
                                        onChange={(e) => setFormData({ ...formData!, title: e.target.value })}
                                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-xl text-gray-900 placeholder:text-gray-500"
                                        placeholder="Enter the book title"
                                        required
                                    />
                                </div>

                                {/* Author */}
                                <div>
                                    <Label htmlFor="author" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-amber-500" />
                                        Author *
                                    </Label>
                                    <Input
                                        id="author"
                                        value={formData?.author || ""}
                                        onChange={(e) => setFormData({ ...formData!, author: e.target.value })}
                                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-xl text-gray-900"
                                        placeholder="Author name"
                                        required
                                    />
                                </div>

                                {/* ISBN */}
                                <div>
                                    <Label htmlFor="isbn" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Hash className="w-4 h-4 text-amber-500" />
                                        ISBN
                                    </Label>
                                    <Input
                                        id="isbn"
                                        value={formData?.isbn || ""}
                                        onChange={(e) => setFormData({ ...formData!, isbn: e.target.value })}
                                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-xl text-gray-900"
                                        placeholder="978-0-123456-78-9"
                                    />
                                </div>

                                {/* Year */}
                                <div>
                                    <Label htmlFor="year" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        Publication Year *
                                    </Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={formData?.year || ""}
                                        onChange={(e) => setFormData({ ...formData!, year: parseInt(e.target.value) || 0 })}
                                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-xl text-gray-900"
                                        placeholder="2024"
                                        min="1000"
                                        max="2100"
                                        required
                                    />
                                </div>

                                {/* Edition */}
                                <div>
                                    <Label htmlFor="edition" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-amber-500" />
                                        Edition
                                    </Label>
                                    <Input
                                        id="edition"
                                        value={formData?.edition || ""}
                                        onChange={(e) => setFormData({ ...formData!, edition: e.target.value })}
                                        className="h-12 bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-300 rounded-xl text-gray-900"
                                        placeholder="1st Edition, 2nd Edition, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Publisher & Format Section */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <Building className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Publisher & Format</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Publisher */}
                                <div>
                                    <Label htmlFor="publisher_name" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Building className="w-4 h-4 text-orange-500" />
                                        Publisher *
                                    </Label>
                                    <Input
                                        id="publisher_name"
                                        value={formData?.publisher_name || ""}
                                        onChange={(e) => setFormData({ ...formData!, publisher_name: e.target.value })}
                                        className="h-12 bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-300 rounded-xl text-gray-900"
                                        placeholder="Publisher name"
                                        required
                                    />
                                </div>

                                {/* Binding Type */}
                                <div>
                                    <Label htmlFor="binding_type" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-orange-500" />
                                        Binding Type *
                                    </Label>
                                    <Select
                                        value={formData?.binding_type || ""}
                                        onValueChange={(value) => setFormData({ ...formData!, binding_type: value })}
                                    >
                                        <SelectTrigger className="h-12 bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-300 rounded-xl text-gray-900">
                                            <SelectValue placeholder="Select binding type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white rounded-xl border-orange-200 shadow-xl">
                                            <SelectItem value="Hardcover" className="hover:bg-orange-50">Hardcover</SelectItem>
                                            <SelectItem value="Paperback" className="hover:bg-orange-50">Paperback</SelectItem>
                                            <SelectItem value="Ebook" className="hover:bg-orange-50">Ebook</SelectItem>
                                            <SelectItem value="Audiobook" className="hover:bg-orange-50">Audiobook</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Classification */}
                                <div className="md:col-span-2">
                                    <Label htmlFor="classification" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Hash className="w-4 h-4 text-orange-500" />
                                        Classification *
                                    </Label>
                                    <Select
                                        value={formData?.classification || ""}
                                        onValueChange={(value) => setFormData({ ...formData!, classification: value })}
                                    >
                                        <SelectTrigger className="h-12 bg-white/80 border-orange-200 focus:border-orange-400 focus:ring-orange-300 rounded-xl text-gray-900">
                                            <SelectValue placeholder="Select book classification" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white rounded-xl border-orange-200 shadow-xl">
                                            <SelectItem value="Fantasy" className="hover:bg-orange-50">Fantasy</SelectItem>
                                            <SelectItem value="Classic Literature" className="hover:bg-orange-50">Classic Literature</SelectItem>
                                            <SelectItem value="Dystopian Fiction" className="hover:bg-orange-50">Dystopian Fiction</SelectItem>
                                            <SelectItem value="Science Fiction" className="hover:bg-orange-50">Science Fiction</SelectItem>
                                            <SelectItem value="Mystery" className="hover:bg-orange-50">Mystery</SelectItem>
                                            <SelectItem value="Romance" className="hover:bg-orange-50">Romance</SelectItem>
                                            <SelectItem value="Non-Fiction" className="hover:bg-orange-50">Non-Fiction</SelectItem>
                                            <SelectItem value="Biography" className="hover:bg-orange-50">Biography</SelectItem>
                                            <SelectItem value="History" className="hover:bg-orange-50">History</SelectItem>
                                            <SelectItem value="Self-Help" className="hover:bg-orange-50">Self-Help</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Source Section */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-red-100/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Pricing & Source</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Price */}
                                <div>
                                    <Label htmlFor="price" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4 text-red-500" />
                                        Price *
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData?.price || ""}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value) || 0;
                                            setFormData({ ...formData!, price: Math.max(0, value) });
                                        }}
                                        className="h-12 bg-white/80 border-red-200 focus:border-red-400 focus:ring-red-300 rounded-xl text-gray-900"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                {/* Currency */}
                                <div>
                                    <Label htmlFor="currency" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4 text-red-500" />
                                        Currency
                                    </Label>
                                    <Select
                                        value={formData?.currency || "USD"}
                                        onValueChange={(value) => setFormData({ ...formData!, currency: value })}
                                    >
                                        <SelectTrigger className="h-12 bg-white/80 border-red-200 focus:border-red-400 focus:ring-red-300 rounded-xl text-gray-900">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white rounded-xl border-red-200 shadow-xl">
                                            <SelectItem value="USD" className="hover:bg-red-50">USD ($)</SelectItem>
                                            <SelectItem value="EUR" className="hover:bg-red-50">EUR (€)</SelectItem>
                                            <SelectItem value="GBP" className="hover:bg-red-50">GBP (£)</SelectItem>
                                            <SelectItem value="INR" className="hover:bg-red-50">INR (₹)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Source */}
                                <div>
                                    <Label htmlFor="source" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4 text-red-500" />
                                        Source *
                                    </Label>
                                    <Input
                                        id="source"
                                        value={formData?.source || ""}
                                        onChange={(e) => setFormData({ ...formData!, source: e.target.value })}
                                        className="h-12 bg-white/80 border-red-200 focus:border-red-400 focus:ring-red-300 rounded-xl text-gray-900"
                                        placeholder="Where was it acquired?"
                                        required
                                    />
                                </div>

                                {/* Remarks */}
                                <div className="md:col-span-3">
                                    <Label htmlFor="remarks" className="text-gray-700 font-semibold flex items-center gap-2 mb-2">
                                        <MessageSquare className="w-4 h-4 text-red-500" />
                                        Remarks
                                    </Label>
                                    <Textarea
                                        id="remarks"
                                        value={formData?.remarks || ""}
                                        onChange={(e) => setFormData({ ...formData!, remarks: e.target.value })}
                                        className="min-h-[100px] bg-white/80 border-red-200 focus:border-red-400 focus:ring-red-300 rounded-xl text-gray-900 resize-none"
                                        placeholder="Additional notes about this book (condition, special features, etc.)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-4 pb-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-12 px-8 bg-white/80 hover:bg-white border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-12 px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] flex items-center gap-2"
                            >
                                {isEditing ? (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Update Book
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Add Book
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookModal;