'use client';

import { Book } from '@/lib/store';
import BookCard from './BookCard';
import NewBookCard from './NewBookCard';

interface BookGridProps {
  books: Book[];
  onBookClick: (bookId: string) => void;
  onBookAction: (bookId: string, action: string) => void;
  onNewBook: () => void;
}

export default function BookGrid({ books, onBookClick, onBookAction, onNewBook }: BookGridProps) {
  return (
    <div className="grid gap-6 p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
      <NewBookCard onClick={onNewBook} />
      
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick(book.id)}
          onAction={(action) => onBookAction(book.id, action)}
        />
      ))}
    </div>
  );
}