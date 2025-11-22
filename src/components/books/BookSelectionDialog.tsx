"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { apiFunctions } from "@/services/api.service";
import { toast } from "sonner";

// Type definitions
type Book = {
  _id: string;
  title: string;
  author: string;
  year: number;
  publisher: { name: string } | null;
  publisher_name: string;
  isbn?: string;
  edition?: string;
  binding_type: string;
  classification: string;
  price?: number | null;
};

type BooksApiResponse = {
  success: boolean;
  books: Book[];
  pagination: {
    totalBooks: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    showing: { from: number; to: number; total: number };
  };
};

type BookFilters = {
  title?: string;
  author?: string;
  isbn?: string;
  year?: string;
  classification?: string;
  publisher_name?: string;
};

interface BookSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooksSelected: (bookIds: string[]) => void;
  initialSelectedBooks?: string[]; // For edit mode - pre-selected books
  mode?: 'create' | 'edit'; // Different behavior for create vs edit
  buttonText?: string; // Custom button text
}

export function BookSelectionDialog({
  open,
  onOpenChange,
  onBooksSelected,
  initialSelectedBooks = [],
  mode = 'create',
  buttonText = 'Generate Quotation',
}: BookSelectionDialogProps) {
  const [bookData, setBookData] = useState<BooksApiResponse | null>(null);
  const [bookPage, setBookPage] = useState(1);
  const [bookLimit] = useState(25);
  const [pendingBookFilters, setPendingBookFilters] = useState<BookFilters>({});
  const [appliedBookFilters, setAppliedBookFilters] = useState<BookFilters>({});
  const [bookLoading, setBookLoading] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Memoize initialSelectedBooks to prevent infinite loops
  // Convert to a stable string for comparison
  const initialSelectedBooksKey = useMemo(() => {
    return initialSelectedBooks ? initialSelectedBooks.sort().join(',') : '';
  }, [initialSelectedBooks]);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialSelectedBooks && initialSelectedBooks.length > 0) {
        // In edit mode, start with existing books selected
        setSelectedBookIds([...initialSelectedBooks]);
      } else {
        // In create mode, reset selection (no books selected)
        setSelectedBookIds([]);
      }
      setBookPage(1);
      setAppliedBookFilters({});
      setPendingBookFilters({});
    } else {
      // Reset when dialog closes
      setSelectedBookIds([]);
    }
  }, [open, mode, initialSelectedBooksKey]);

  // Update header checkbox state
  useEffect(() => {
    if (open && headerCheckboxRef.current && bookData?.books) {
      const numSelected = selectedBookIds.length;
      const numBooksOnPage = bookData.books.length;
      headerCheckboxRef.current.checked = numSelected === numBooksOnPage && numBooksOnPage > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numBooksOnPage;
    }
  }, [selectedBookIds, bookData?.books, open]);

  // Memoize filters key to prevent unnecessary re-renders
  const filtersKey = useMemo(() => {
    return JSON.stringify(appliedBookFilters);
  }, [appliedBookFilters]);

  // Load books
  const loadBooks = useCallback(async () => {
    if (!open) return;
    setBookLoading(true);
    try {
      const params = new URLSearchParams({ page: String(bookPage), limit: String(bookLimit) });
      if (appliedBookFilters.title) params.set("title", appliedBookFilters.title);
      if (appliedBookFilters.author) params.set("author", appliedBookFilters.author);
      if (appliedBookFilters.isbn) params.set("isbn", appliedBookFilters.isbn);
      if (appliedBookFilters.year) params.set("year", appliedBookFilters.year);
      if (appliedBookFilters.classification) params.set("classification", appliedBookFilters.classification);
      if (appliedBookFilters.publisher_name) params.set("publisher_name", appliedBookFilters.publisher_name);

      const response = await apiFunctions.getBooks(params);
      if (!response.success) throw new Error(response.message || "Failed to fetch books");
      setBookData(response as BooksApiResponse);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to fetch books");
    } finally {
      setBookLoading(false);
    }
  }, [open, bookPage, bookLimit, filtersKey]);

  useEffect(() => {
    if (open) {
      loadBooks();
    }
  }, [open, loadBooks]);

  // Filter handlers
  const applyBookFilters = () => {
    setBookPage(1);
    const trimmedFilters: BookFilters = {};
    if (pendingBookFilters.title?.trim()) trimmedFilters.title = pendingBookFilters.title.trim();
    if (pendingBookFilters.author?.trim()) trimmedFilters.author = pendingBookFilters.author.trim();
    if (pendingBookFilters.isbn?.trim()) trimmedFilters.isbn = pendingBookFilters.isbn.trim();
    if (pendingBookFilters.year?.trim()) trimmedFilters.year = pendingBookFilters.year.trim();
    if (pendingBookFilters.classification?.trim()) trimmedFilters.classification = pendingBookFilters.classification.trim();
    if (pendingBookFilters.publisher_name?.trim()) trimmedFilters.publisher_name = pendingBookFilters.publisher_name.trim();
    setAppliedBookFilters(trimmedFilters);
    setPendingBookFilters(trimmedFilters);
  };

  const clearBookFilters = () => {
    setPendingBookFilters({});
    setAppliedBookFilters({});
    setBookPage(1);
  };

  // Selection handlers
  const toggleSelectBook = (bookId: string) => {
    setSelectedBookIds(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
  };

  const handleSelectAllBooks = () => {
    if (!bookData?.books) return;

    const currentPageBookIds = bookData.books.map(b => b._id);
    const allCurrentPageSelected = currentPageBookIds.every(id => selectedBookIds.includes(id));

    if (allCurrentPageSelected) {
      // Deselect all books on current page
      setSelectedBookIds(prev => prev.filter(id => !currentPageBookIds.includes(id)));
    } else {
      // Select all books on current page (merge with existing selections)
      setSelectedBookIds(prev => {
        const merged = [...new Set([...prev, ...currentPageBookIds])];
        return merged;
      });
    }
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (selectedBookIds.length === 0) {
      toast.warning("Please select at least one book.");
      return;
    }
    onBooksSelected(selectedBookIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Add or Remove Books' : 'Select Books for Quotation'}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
          {/* Filters */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="q-filter-title" className="text-[var(--text-primary)] font-medium">Title</Label>
                <Input
                  id="q-filter-title"
                  placeholder="Search by title..."
                  value={pendingBookFilters.title || ''}
                  onChange={(e) => setPendingBookFilters((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="q-filter-isbn" className="text-[var(--text-primary)] font-medium">ISBN</Label>
                <Input
                  id="q-filter-isbn"
                  placeholder="Search by isbn..."
                  value={pendingBookFilters.isbn || ''}
                  onChange={(e) => setPendingBookFilters((f) => ({ ...f, isbn: e.target.value }))}
                  className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="q-filter-publisher" className="text-[var(--text-primary)] font-medium">Publisher</Label>
                <Input
                  id="q-filter-publisher"
                  placeholder="Search by publisher..."
                  value={pendingBookFilters.publisher_name || ''}
                  onChange={(e) => setPendingBookFilters((f) => ({ ...f, publisher_name: e.target.value }))}
                  className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="q-filter-author" className="text-[var(--text-primary)] font-medium">Author</Label>
                <Input
                  id="q-filter-author"
                  placeholder="Search by author..."
                  value={pendingBookFilters.author || ''}
                  onChange={(e) => setPendingBookFilters((f) => ({ ...f, author: e.target.value }))}
                  className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="q-filter-year" className="text-[var(--text-primary)] font-medium">Year</Label>
                <Input
                  id="q-filter-year"
                  placeholder="Search by year"
                  value={pendingBookFilters.year || ''}
                  onChange={(e) => setPendingBookFilters((f) => ({ ...f, year: e.target.value }))}
                  className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="q-filter-classification" className="text-[var(--text-primary)] font-medium">Classification</Label>
                <Select
                  value={pendingBookFilters.classification || ''}
                  onValueChange={(v) => setPendingBookFilters((f) => ({ ...f, classification: v === 'all' ? undefined : v }))}
                >
                  <SelectTrigger className="mt-1 h-12 bg-[var(--surface)] border-2 border-[var(--border)] focus:border-[var(--primary)] focus:ring-[var(--primary)] rounded-xl text-[var(--text-primary)]">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl shadow-lg">
                    <SelectItem value="all" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">All</SelectItem>
                    <SelectItem value="Fantasy" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Fantasy</SelectItem>
                    <SelectItem value="Classic Literature" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Classic Literature</SelectItem>
                    <SelectItem value="Science Fiction" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Science Fiction</SelectItem>
                    <SelectItem value="Mystery" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Mystery</SelectItem>
                    <SelectItem value="Non-Fiction" className="text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Non-Fiction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={applyBookFilters} disabled={bookLoading} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
                Apply Filters
              </Button>
              <Button onClick={clearBookFilters} variant="outline" disabled={bookLoading}>
                Clear
              </Button>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Books</h3>
              <div className="text-sm text-[var(--text-secondary)]">
                {bookData?.pagination.showing.from}-{bookData?.pagination.showing.to} of {bookData?.pagination.showing.total}
              </div>
            </div>
            {bookLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
              </div>
            ) : (bookData && bookData.books.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-[var(--border)] table-fixed">
                    <thead className="bg-[var(--surface-hover)]">
                      <tr>
                        <th className="w-10 px-2 py-2 text-left">
                          <Input
                            type="checkbox"
                            ref={headerCheckboxRef}
                            onChange={handleSelectAllBooks}
                            className="h-4 w-4"
                          />
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[32%]">
                          Title
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[15%]">
                          ISBN
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[20%]">
                          Author
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[10%]">
                          Year
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider w-[15%]">
                          Publisher
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                      {bookData.books.map((book) => (
                        <tr key={book._id} className="hover:bg-[var(--surface-hover)]">
                          <td className="px-2 py-2">
                            <Input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedBookIds.includes(book._id)}
                              onChange={() => toggleSelectBook(book._id)}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <div className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-tight">
                              {book.title}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-sm text-[var(--text-primary)] truncate" title={book.isbn || 'N/A'}>
                            {book.isbn || 'N/A'}
                          </td>
                          <td className="px-2 py-2 text-sm text-[var(--text-primary)] truncate" title={book.author}>
                            {book.author}
                          </td>
                          <td className="px-2 py-2 text-sm text-[var(--text-primary)]">{book.year}</td>
                          <td className="px-2 py-2 text-sm text-[var(--text-primary)] truncate" title={book.publisher?.name || 'N/A'}>
                            {book.publisher?.name || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {bookData.pagination.totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!bookData.pagination.hasPrevPage}
                      onClick={() => setBookPage(p => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-[var(--text-secondary)]">
                      Page {bookData.pagination.currentPage} of {bookData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!bookData.pagination.hasNextPage}
                      onClick={() => setBookPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-[var(--text-secondary)]">No books found</div>
            ))}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="mt-4 flex items-center justify-between sticky bottom-0 bg-[var(--surface)] border-t border-[var(--border)] pt-3 pb-2">
          <div className="text-sm text-[var(--text-secondary)]">{selectedBookIds.length} selected</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
              {buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

