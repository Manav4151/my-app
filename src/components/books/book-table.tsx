import { useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import SearchBookOnlineButton from "../ViewOnAmazonButton";
import { Book, PaginationData } from "@/types/books";

interface BookTableProps {
    books: Book[];
    pagination: PaginationData;
    selectionMode: boolean;
    selectedBooks: string[];
    onSelectBook: (id: string) => void;
    onSelectAll: () => void;
    onCancelSelection: () => void;
    onPageChange: (page: number) => void;
    onStartSelection: () => void;
    onView: (id: string) => void;
}

export function BookTable({
    books, pagination, selectionMode, selectedBooks,
    onSelectBook, onSelectAll, onCancelSelection, onPageChange, onStartSelection, onView
}: BookTableProps) {

    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectionMode && headerCheckboxRef.current && books.length > 0) {
            const numSelected = selectedBooks.length;
            headerCheckboxRef.current.checked = numSelected === books.length;
            headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < books.length;
        }
    }, [selectedBooks, books.length, selectionMode]);

    return (
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Books</h2>
                {books.length > 0 && (
                    selectionMode ? (
                        <Button variant="ghost" size="sm" onClick={onCancelSelection} className="hover:bg-[var(--surface-hover)]">
                            <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={onStartSelection}>Select</Button>
                    )
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-[var(--border)]">
                    <thead className="bg-[var(--surface-hover)]">
                        <tr>
                            {selectionMode && (
                                <th className="px-6 py-3 w-12 text-left">
                                    <Input type="checkbox" ref={headerCheckboxRef} onChange={onSelectAll} className="h-4 w-4" />
                                </th>
                            )}

                            {/* TITLE: Increased to 45% */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[45%]">
                                Title / Classification
                            </th>

                            <Th>ISBN</Th>

                            {/* AUTHOR: Narrower (15%) but allows wrapping */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[15%]">
                                Author
                            </th>

                            <Th>Year</Th>

                            {/* PUBLISHER: Adjusted to 20% */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[20%]">
                                Publisher
                            </th>

                            {/* Actions: Fixed width */}
                            <th className="px-6 py-3 w-[100px]"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                        {books.map((book) => (
                            <tr key={book._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                                {selectionMode && (
                                    <td className="px-6 py-4">
                                        <Input type="checkbox" checked={selectedBooks.includes(book._id)} onChange={() => onSelectBook(book._id)} className="h-4 w-4" />
                                    </td>
                                )}

                                {/* Title - Multi-line */}
                                <td className="px-6 py-4 align-top">
                                    <div className="text-base font-semibold text-[var(--text-primary)] leading-snug mb-1.5">
                                        {book.title}
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                                        {book.classification}
                                    </span>
                                </td>

                                {/* ISBN - Single Line */}
                                <td className="px-6 py-4 text-sm text-[var(--text-primary)] whitespace-nowrap align-top pt-5">
                                    {book.isbn || '—'}
                                </td>

                                {/* Author - Multi-line enabled (removed whitespace-nowrap) */}
                                <td className="px-6 py-4 text-sm text-[var(--text-primary)] align-top pt-5 leading-snug">
                                    {book.author}
                                </td>

                                {/* Year - Single Line */}
                                <td className="px-6 py-4 text-sm text-[var(--text-primary)] whitespace-nowrap align-top pt-5">
                                    {book.year}
                                </td>

                                {/* Publisher - Multi-line */}
                                <td className="px-6 py-4 text-sm text-[var(--text-primary)] align-top pt-5 leading-snug">
                                    {book.publisher?.name || book.publisher_name || '—'}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap align-top pt-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <Button onClick={() => onView(book._id)} variant="outline" size="sm" className="h-8">View</Button>
                                        <SearchBookOnlineButton book={book} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
                    <p className="text-sm text-[var(--text-secondary)]">
                        Showing <span className="font-medium">{pagination.showing.from}-{pagination.showing.to}</span> of {pagination.showing.total}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => onPageChange(pagination.currentPage - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.currentPage + 1)}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper for small fixed-content headers (ISBN, Year)
const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap w-auto">
        {children}
    </th>
);