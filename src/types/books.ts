export interface Book {
  _id: string;
  title: string;
  author: string;
  year: number;
  publisher: { name: string } | null;
  publisher_name: string;
  isbn?: string;
  edition?: string;
  classification: string;
  price?: number | null;
  pricing?: Array<{ source: string }>;
}

export interface PaginationData {
  totalBooks: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  showing: { from: number; to: number; total: number };
}

export interface BookFilters {
  title?: string;
  author?: string;
  isbn?: string;
  year?: string;
  classification?: string;
  publisher_name?: string;
}