"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { useAuth } from "../components/auth-context";
import { toast } from "sonner";
import ExcelImport from "../components/excel-import";
import ViewOnAmazonButton from "../components/ViewOnAmazonButton";
import SearchBookOnlineButton from "../components/ViewOnAmazonButton";
import { ApiError, apiFunctions } from "@/services/api.service";
import { set } from "lodash";

// Define the data type based on API response
interface Book {
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
  pricing?: Array<{
    _id: string;
    rate: number;
    discount: number;
    source: string;
    currency: string;
    last_updated: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  books: Book[];
  pagination: {
    totalBooks: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    showing: {
      from: number;
      to: number;
      total: number;
    };
  };
}

type Filters = {
  title?: string;
  author?: string;
  isbn?: string;
  year?: string;
  classification?: string;
  publisher_name?: string;
};

export default function Home() {
  const { session, pending } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pendingFilters, setPendingFilters] = useState<Filters>({});
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);




  useEffect(() => {
    if (selectionMode && headerCheckboxRef.current && data?.books) {
      const numSelected = selectedBooks.length;
      const numBooksOnPage = data.books.length;
      headerCheckboxRef.current.checked = numSelected === numBooksOnPage && numBooksOnPage > 0;
      headerCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numBooksOnPage;
    }
  }, [selectedBooks, data?.books, selectionMode]);

  // --- UPDATE loadData ---
  const loadData = useCallback(async () => {
    console.log('🔄 Refreshing books data...');
    setLoading(true);
    setError(null);
    try {
      // Create URLSearchParams like before
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (appliedFilters.title) params.set('title', appliedFilters.title);
      if (appliedFilters.author) params.set('author', appliedFilters.author);
      if (appliedFilters.isbn) params.set('isbn', appliedFilters.isbn);
      if (appliedFilters.year) params.set('year', appliedFilters.year);
      if (appliedFilters.classification) params.set('classification', appliedFilters.classification);
      if (appliedFilters.publisher_name) params.set('publisher_name', appliedFilters.publisher_name);

      // Call the API function directly
      const response = await apiFunctions.getBooks(params); // <-- 2. Use the imported function

      console.log('📊 Books API response:', response); // Axios gives you the JSON directly

      // Optional: Check for application-specific success flags if your backend sends them
      if (!response.success) { // Assuming your API returns { success: boolean, ... }
        throw new Error(response.message || 'Failed to fetch books');
      }

      setData(response);
      console.log('✅ Books data refreshed successfully:', response.pagination.totalBooks, 'total books');
    } catch (error) { // Catch ApiError or generic Error from the api-service
      console.error("Error fetching data:", error);
      const message = error instanceof ApiError ? error.message : "Failed to fetch books";
      setError(message);
      toast.error(message);
      // NOTE: Retry logic is removed here. Axios can be configured with interceptors for retries if needed.
      // NOTE: Timeout logic is removed. Axios has a 'timeout' config option if needed.
    } finally {
      setLoading(false);
    }
  }, [page, limit, appliedFilters]); // <-- Dependencies

  // --- useEffect hook remains the same, calling the new loadData ---
  useEffect(() => {
    loadData();
  }, [loadData]); // Dependency is the useCallback function
  // Apply filters
  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...pendingFilters });
  };

  // Clear filters
  const clearFilters = () => {
    setPendingFilters({});
    setAppliedFilters({});
    setPage(1);
  };
  const handleSelectBook = (bookId: string) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };
  // --- NEW --- Cancel selection mode
  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedBooks([]);
  };

  // Handle selecting all books on the current page
  const handleSelectAll = () => {
    if (data?.books && selectedBooks.length === data.books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(data?.books.map(book => book._id) || []);
    }
  };
  // Handle deleting selected books
  const handleDeleteSelected = async () => {
    if (selectedBooks.length === 0) {
      toast.warning("No books selected to delete.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedBooks.length} book(s)?`)) {
      try {
        setLoading(true);
        const result = await apiFunctions.deleteBooks(selectedBooks);
        if (result.success) {
          toast.success(result.message || "Books deleted successfully!");
          setSelectedBooks([]);
          setSelectionMode(false);
          if (data && data.books.length === selectedBooks.length && page > 1) {
            setPage(page - 1);
          } else {
            loadData();

          }
        } else {
          throw new Error(result.message || "Failed to delete books");
        }
      } catch (err) {
        console.error("Deletion error:", err);
        toast.error(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGenerateQuotes = () => {
    if (selectedBooks.length === 0) {
      toast.warning("No books selected to generate quotes for.");
      return;
    }
    try {
      // pass data to the preview page
      const params = new URLSearchParams();
      selectedBooks.forEach(id => {
        params.append('id', id); // We add the key 'id' for *each* item
      });
      router.push(`/quotation/preview?${params.toString()}`);
    } catch (error) {
      console.error("Error generating quotes:", error);
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    }

  };
  // Handle view pricing - navigate to book detail page
  const handleViewPricing = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.pagination.totalPages || 1)) {
      setPage(newPage);
    }
  };

  // Render loading state
  if (loading || pending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()} className="bg-amber-600 hover:bg-amber-700">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bflex items-center justify-center">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Inventory</h1>
              <p className="text-gray-600">Manage your digital library and book collection</p>
            </div>
            {session && (
              <div className="flex gap-3">
                <ExcelImport onImportComplete={loadData} />
                <Button
                  onClick={() => router.push('/books/insert')}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Insert Book
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Books</p>
              <p className="text-3xl font-bold text-amber-600">{data.pagination.totalBooks}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Current Page</p>
              <p className="text-3xl font-bold text-orange-600">{data.pagination.currentPage} / {data.pagination.totalPages}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Showing</p>
              <p className="text-3xl font-bold text-green-600">{data.pagination.showing.from}-{data.pagination.showing.to}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filters
            </h2>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-title" className="text-gray-700 font-medium">Title</Label>
                  <Input
                    id="filter-title"
                    placeholder="Search by title..."
                    value={pendingFilters.title || ''}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, title: e.target.value }))}
                    className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-isbn" className="text-gray-700 font-medium">ISBN</Label>
                  <Input
                    id="filter-isbn"
                    placeholder="Search by isbn..."
                    value={pendingFilters.isbn || ''}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, isbn: e.target.value }))}
                    className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-publisher_name" className="text-gray-700 font-medium">Publisher</Label>
                  <Input
                    id="filter-publisher_name"
                    placeholder="Search by publisher..."
                    value={pendingFilters.publisher_name || ''}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, publisher_name: e.target.value }))}
                    className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-author" className="text-gray-700 font-medium">Author</Label>
                  <Input
                    id="filter-author"
                    placeholder="Search by author..."
                    value={pendingFilters.author || ''}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, author: e.target.value }))}
                    className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-year" className="text-gray-700 font-medium">Year</Label>
                  <Input
                    id="filter-year"
                    placeholder="Search by year"
                    value={pendingFilters.year || ''}
                    onChange={(e) => setPendingFilters((f) => ({ ...f, year: e.target.value }))}
                    className="mt-1 h-12 w-40 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-classification" className="text-gray-700 font-medium">Classification</Label>
                  <Select
                    value={pendingFilters.classification || ''}
                    onValueChange={(v) => setPendingFilters((f) => ({ ...f, classification: v === 'all' ? undefined : v }))}
                  >
                    <SelectTrigger className="mt-1 h-12 bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl text-gray-900">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-2 border-gray-200 rounded-xl shadow-lg">
                      <SelectItem value="all" className="text-gray-900 hover:bg-amber-50">All</SelectItem>
                      <SelectItem value="Fantasy" className="text-gray-900 hover:bg-amber-50">Fantasy</SelectItem>
                      <SelectItem value="Classic Literature" className="text-gray-900 hover:bg-amber-50">Classic Literature</SelectItem>
                      <SelectItem value="Science Fiction" className="text-gray-900 hover:bg-amber-50">Science Fiction</SelectItem>
                      <SelectItem value="Mystery" className="text-gray-900 hover:bg-amber-50">Mystery</SelectItem>
                      <SelectItem value="Non-Fiction" className="text-gray-900 hover:bg-amber-50">Non-Fiction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={applyFilters} className="bg-amber-600 hover:bg-amber-700">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Contextual Action Bar for Deleting */}
        {selectionMode && selectedBooks.length > 0 && (
          <div className="bg-amber-100/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between mb-8 transition-all duration-300 ease-in-out">
            <p className="text-amber-800 font-semibold">{selectedBooks.length} book(s) selected</p>
            <Button onClick={handleDeleteSelected} variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>

            <Button onClick={handleGenerateQuotes} variant="destructive" className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Generate Quotation
            </Button>
          </div>
        )}
        {/* Books Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Books</h2>
            {/* --- NEW --- Toggle Selection Mode Button --- */}
            {data.books.length > 0 && (
              selectionMode ? (
                <Button variant="ghost" size="sm" onClick={handleCancelSelection} className="text-gray-600 hover:bg-gray-100">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSelectionMode(true)}>
                  Select
                </Button>
              )
            )}
          </div>

          {data.books.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or add a new book.</p>
              <Button onClick={() => router.push('/books/insert')} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Insert Book
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-amber-100">
                  <thead className="bg-amber-50">
                    <tr>
                      {selectionMode && (
                        <th className="px-6 py-3 text-left">
                          <Input
                            type="checkbox"
                            ref={headerCheckboxRef}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">ISBN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Edition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Publisher</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Price Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {data.books.map((book) => (
                      <tr key={book._id} className="hover:bg-amber-50 transition-colors">
                        {selectionMode && (
                          <td className="px-6 py-4">
                            <Input
                              type="checkbox"
                              checked={selectedBooks.includes(book._id)}
                              onChange={() => handleSelectBook(book._id)}
                              className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">{book.classification}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.isbn || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.edition || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.publisher?.name || 'N/A'}</td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {book.price && typeof book.price === 'number' ? `$${book.price.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.pricing && book.pricing.length > 0 ? book.pricing[0].source : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => handleViewPricing(book._id)}
                            variant="outline"
                            size="sm"
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            View Details
                          </Button>
                          {/* The new button that searches on Google */}
                          <SearchBookOnlineButton book={book} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-amber-100 flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing {data.pagination.showing.from} to {data.pagination.showing.to} of {data.pagination.showing.total} books
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasPrevPage}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                      Page {data.pagination.currentPage} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.pagination.hasNextPage}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}