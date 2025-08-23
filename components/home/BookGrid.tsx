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
  console.log('BookGrid rendering with books:', books.length);
  
  return (
    <div className="grid gap-6 p-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <NewBookCard onClick={onNewBook} />
      
      {books.map((book) => (
        <BookCard
          key={book.id}
          data-testid="book-card"
          book={book}
          onClick={() => onBookClick(book.id)}
          onAction={(action) => onBookAction(book.id, action)}
        />
      ))}
    </div>
  );
}