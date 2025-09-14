"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../app/components/ui/dialog";
import { Button } from "../app/components/ui/button";
import { Input } from "../app/components/ui/input";
import { Label } from "../app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../app/components/ui/select";
import { BookOpen, User, Hash, Calendar, Building, Type, DollarSign, Globe, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "./components/auth-context";
import BookModal from "./components/book-add-edit";



// Define the data type based on API response
interface Book {
  _id: string;
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  edition?: string | null;
  year: number;
  publisher_id: string;
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

interface ApiResponse {
  total: number;
  page: number;
  pages: number;
  books: Book[];
}

// Fetch data from the actual API
const fetchData = async (page: number = 1, limit: number = 20): Promise<ApiResponse> => {
  const response = await fetch(`http://localhost:5050/api/books?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export default function Home() {
  const { session, isAuthenticated, logout, pending } = useAuth();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Book> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data on page change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchData(page, limit);
        setData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [page, limit]);

  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      const body = JSON.stringify(formData);
      let response;

      if (isEditing && formData._id) {
        // Update existing book
        response = await fetch(`http://localhost:5050/api/books/${formData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        });
      } else {
        // Add new book
        response = await fetch('http://localhost:5050/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} book: ${response.status} ${response.statusText}`);
      }

      // Refresh data after successful operation
      const refreshedData = await fetchData(page, limit);
      setData(refreshedData);
      setIsModalOpen(false);
      setFormData(null);
    } catch (error) {
      console.error("Error saving data:", error);
      alert(error instanceof Error ? error.message : "Failed to save book");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`http://localhost:5050/api/books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book: ${response.status} ${response.statusText}`);
      }

      // Refresh data after successful deletion
      const refreshedData = await fetchData(page, limit);
      setData(refreshedData);
    } catch (error) {
      console.error("Error deleting data:", error);
      alert(error instanceof Error ? error.message : "Failed to delete book");
    }
  };

  // Open modal for adding
  const openAddModal = () => {
    setFormData({
      title: "",
      author: "",
      isbn: "",
      year: new Date().getFullYear(),
      publisher_name: "",
      binding_type: "",
      classification: "",
      source: "",
      price: 0,
      currency: "USD"
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (book: Book) => {
    setFormData(book);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (data?.pages || 1)) {
      setPage(newPage);
    }
  };

  // Render loading state
  if (loading || !isClient || pending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Book-Themed Header */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 shadow-lg rounded-b-3xl pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-9 h-9 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Book Inventory</h1>
              <p className="text-amber-100 text-sm mt-1">Manage your digital library with ease</p>
            </div>
          </div>
          {session && (
            <div className="flex items-center gap-4 bg-white/10 rounded-xl px-6 py-3 shadow-md">
              <span className="text-white text-lg font-semibold">Welcome, {session.user.name}</span>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-amber-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-lg transform rotate-12"></div>
          <div className="absolute top-32 right-16 w-24 h-24 border-2 border-white rounded-lg transform -rotate-12"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white rounded-lg transform rotate-45"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-white rounded-lg transform -rotate-45"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white/90 shadow-xl rounded-3xl p-8 border border-amber-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-amber-500" />
              Book List
            </h2>
            <Button
              onClick={openAddModal}
              className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              + Add Book
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-amber-100 bg-white">
            <table className="min-w-full divide-y divide-amber-100 rounded-2xl overflow-hidden">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Book ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Publisher</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Classification</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-amber-50">
                {data.books.map((book) => (
                  <tr key={book._id} className="hover:bg-amber-50 transition-colors duration-200">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{book.book_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate" title={book.title}>
                      {book.title}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{book.year}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{book.publisher_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        {book.classification}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${book.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(book)}
                          className="h-8 rounded-lg border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(book._id)}
                          className="h-8 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total} books
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  size="sm"
                  className="hover:bg-blue-50"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                  Page {page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === data.pages}
                  onClick={() => handlePageChange(page + 1)}
                  size="sm"
                  className="hover:bg-blue-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Modal for Add/Edit */}
          <BookModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            isEditing={isEditing}
          />
        </div>
      </div>
    </div>
  );
}