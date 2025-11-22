// components/SearchBookOnlineButton.tsx
import React from 'react';

// Define a simple Book type for our props
interface Book {
  title: string;
  author?: string; // Optional author
  isbn_13?: string; // Optional ISBN-13
  isbn_10?: string; // Optional ISBN-10
}

interface SearchBookOnlineButtonProps {
  book: Book;
}

const SearchBookOnlineButton = ({ book }: SearchBookOnlineButtonProps) => {
  if (!book || !book.title) {
    return null; // Don't render if there's no book or title
  }


  const searchQuery = 
    book.isbn_13 || 
    book.isbn_10 || 
    (book.author ? `"${book.title}" by ${book.author}` : `"${book.title}" book`);

  // It's crucial to encode the query for the URL
  const encodedSearchQuery = encodeURIComponent(searchQuery);

  const googleSearchURL = `https://www.google.com/search?q=${encodedSearchQuery}`;

  return (
    <a
      href={googleSearchURL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a6.83 6.83 0 00-1.02-2.92A8.04 8.04 0 0118.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.59 1.94 1.55 3.63 2.79 4.92A8.01 8.01 0 015.08 16zm2.95-8H5.08a8.01 8.01 0 014.81-4.92C8.58 4.37 7.62 6.06 7.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.34.16-2h4.68c.09.66.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.58c1.24-1.29 2.2-2.98 2.79-4.92h2.95a8.04 8.04 0 01-4.81 4.92zM16.92 14h3.38c.16-.64.26-1.31.26-2s-.1-1.36-.26-2h-3.38c.08.66.14 1.32.14 2s-.06 1.34-.14 2z"></path></svg>
      Search Online
    </a>
  );
};

export default SearchBookOnlineButton;