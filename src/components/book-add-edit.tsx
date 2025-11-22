// "use client";

// import React from "react";
// import { X, Book, Save, Plus } from "lucide-react";
// import { Button } from "./ui/button";



// const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
//     if (!open) return null;
//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
//             onClick={() => onOpenChange(false)}
//         >
//             {children}
//         </div>
//     );
// };

// const DialogContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
//     <div onClick={(e) => e.stopPropagation()} className={`relative bg-slate-50 rounded-2xl shadow-2xl w-full ${className}`}>
//         {children}
//     </div>
// );



// const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
//     <input
//         ref={ref}
//         className={`flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//         {...props}
//     />
// ));
// Input.displayName = "Input";


// const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
//     <label ref={ref} className={`text-sm font-medium text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-2 ${className}`} {...props} />
// ));
// Label.displayName = "Label";


// const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
//     <textarea
//         ref={ref}
//         className={`flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//         {...props}
//     />
// ));
// Textarea.displayName = "Textarea";

// const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
//     <select
//         ref={ref}
//         className={`flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
//         {...props}
//     >
//         {children}
//     </select>
// ));
// Select.displayName = "Select";



// interface Book {
//     _id?: string;
//     book_id?: number;
//     isbn?: string;
//     title: string;
//     author: string;
//     edition?: string | null;
//     year: number;
//     publisher_id?: string;
//     publisher_name: string;
//     binding_type: string;
//     classification: string;
//     remarks?: string;
//     source: string;
//     price: number;
//     currency: string;
//     createdAt?: string;
//     updatedAt?: string;
//     __v?: number;
//     nonisbn?: string | null;
//     other_code?: string | null;
// }

// interface BookModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onSubmit: (e: React.FormEvent) => Promise<void>;
//     formData: Partial<Book> | null;
//     setFormData: React.Dispatch<React.SetStateAction<Partial<Book> | null>>;
//     isEditing: boolean;
// }

// const BookModal: React.FC<BookModalProps> = ({ isOpen, onClose, onSubmit, formData, setFormData, isEditing }) => {
//     return (
//         <Dialog open={isOpen} onOpenChange={onClose}>
//             <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
//                 {/* Header */}
//                 <header className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
//                     <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
//                             <Book className="w-6 h-6" />
//                         </div>
//                         <div>
//                             <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Book Details" : "Add a New Book"}</h2>
//                             <p className="text-sm text-slate-500">Fill in the fields below to {isEditing ? "update the" : "add a"} book.</p>
//                         </div>
//                     </div>
//                     <Button onClick={onClose} className="bg-transparent hover:bg-slate-200 text-slate-500 !p-0 w-9 h-9">
//                         <X className="h-5 w-5" />
//                     </Button>
//                 </header>

//                 {/* Form Body */}
//                 <div className="p-8 overflow-y-auto flex-grow">
//                     <form id="book-form" onSubmit={onSubmit} className="space-y-8">
//                         {/* Section 1: Book Information */}
//                         <section>
//                             <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-3">Book Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <Label htmlFor="book_id">Book ID *</Label>
//                                     <Input
//                                         id="book_id"
//                                         type="number"
//                                         placeholder="e.g., 1001"
//                                         value={formData?.book_id ?? ""}
//                                         onChange={(e) => setFormData({ ...formData!, book_id: parseInt(e.target.value) || 0 })}
//                                         min="1"
//                                         required
//                                     />
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <Label htmlFor="title">Title *</Label>
//                                     <Input id="title" placeholder="e.g., The Great Gatsby" value={formData?.title || ""} onChange={(e) => setFormData({ ...formData!, title: e.target.value })} required />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="author">Author *</Label>
//                                     <Input id="author" placeholder="e.g., F. Scott Fitzgerald" value={formData?.author || ""} onChange={(e) => setFormData({ ...formData!, author: e.target.value })} required />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="year">Publication Year *</Label>
//                                     <Input id="year" type="number" placeholder="e.g., 1925" value={formData?.year || ""} onChange={(e) => setFormData({ ...formData!, year: parseInt(e.target.value) || 0 })} min="1000" max={new Date().getFullYear() + 1} required />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="edition">Edition</Label>
//                                     <Input id="edition" placeholder="e.g., First Edition" value={formData?.edition || ""} onChange={(e) => setFormData({ ...formData!, edition: e.target.value })} />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="isbn">ISBN</Label>
//                                     <Input id="isbn" placeholder="e.g., 978-0743273565" value={formData?.isbn || ""} onChange={(e) => setFormData({ ...formData!, isbn: e.target.value })} />
//                                 </div>
//                             </div>
//                         </section>

//                         {/* Section 2: Publisher & Format */}
//                         <section>
//                             <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-3">Publisher & Format</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <Label htmlFor="publisher_name">Publisher *</Label>
//                                     <Input id="publisher_name" placeholder="e.g., Charles Scribner's Sons" value={formData?.publisher_name || ""} onChange={(e) => setFormData({ ...formData!, publisher_name: e.target.value })} required />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="binding_type">Binding Type *</Label>
//                                     <Select id="binding_type" value={formData?.binding_type || ""} onChange={(e) => setFormData({ ...formData!, binding_type: e.target.value })} required>
//                                         <option value="" disabled>Select a binding type</option>
//                                         <option value="Hardcover">Hardcover</option>
//                                         <option value="Paperback">Paperback</option>
                                        
//                                     </Select>
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <Label htmlFor="classification">Classification *</Label>
//                                     <Select id="classification" value={formData?.classification || ""} onChange={(e) => setFormData({ ...formData!, classification: e.target.value })} required>
//                                         <option value="" disabled>Select a classification</option>
//                                         <option value="Fantasy">Fantasy</option>
//                                         <option value="Classic Literature">Classic Literature</option>
//                                         <option value="Dystopian Fiction">Dystopian Fiction</option>
//                                         <option value="Science Fiction">Science Fiction</option>
//                                         <option value="Mystery">Mystery</option>
//                                         <option value="Romance">Romance</option>
//                                         <option value="Non-Fiction">Non-Fiction</option>
//                                         <option value="Biography">Biography</option>
//                                         <option value="History">History</option>
//                                         <option value="Self-Help">Self-Help</option>
//                                     </Select>
//                                 </div>
//                             </div>
//                         </section>

//                         {/* Section 3: Acquisition */}
//                         <section>
//                             <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-3">Acquisition Details</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <div>
//                                     <Label htmlFor="price">Price *</Label>
//                                     <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" value={formData?.price || ""} onChange={(e) => setFormData({ ...formData!, price: parseFloat(e.target.value) || 0 })} required />
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="currency">Currency</Label>
//                                     <Select id="currency" value={formData?.currency || "USD"} onChange={(e) => setFormData({ ...formData!, currency: e.target.value })}>
//                                         <option value="USD">USD ($)</option>
//                                         <option value="EUR">EUR (€)</option>
//                                         <option value="GBP">GBP (£)</option>
//                                         <option value="INR">INR (₹)</option>
//                                     </Select>
//                                 </div>
//                                 <div>
//                                     <Label htmlFor="source">Source *</Label>
//                                     <Input id="source" placeholder="e.g., Local Bookstore" value={formData?.source || ""} onChange={(e) => setFormData({ ...formData!, source: e.target.value })} required />
//                                 </div>
//                                 <div className="md:col-span-3">
//                                     <Label htmlFor="remarks">Remarks</Label>
//                                     <Textarea id="remarks" placeholder="Condition, special features, etc." value={formData?.remarks || ""} onChange={(e) => setFormData({ ...formData!, remarks: e.target.value })} className="min-h-[100px] resize-y" />
//                                 </div>
//                             </div>
//                         </section>

//                         <div className="hidden"></div>
//                     </form>
//                 </div>

//                 {/* Footer */}
//                 <footer className="flex justify-end gap-4 p-6 border-t border-slate-200 bg-white/50 flex-shrink-0">
//                     <Button type="button" onClick={onClose} className="bg-transparent hover:bg-slate-100 text-slate-800 border border-slate-300 text-lg rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
//                         Cancel
//                     </Button>
//                     <Button type="submit" form="book-form" className=" bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
//                         {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
//                         Submit
//                     </Button>
//                 </footer>
//             </DialogContent>
//         </Dialog>
//     );
// };

// export default BookModal;

