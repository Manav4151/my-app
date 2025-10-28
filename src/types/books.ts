// Book-related type definitions
// This file contains all interfaces and types related to books and book operations

// Book interface
export interface Book {
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

  // Fetch books response interface for the API response
  export interface FetchBooksResponse {
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

  // Filter books parameters interface for the API request
  export interface FilterBooksParams {
    title?: string;
    author?: string;
    isbn?: string;
    year?: string;
    classification?: string;
    publisher_name?: string;
  }