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
    <div className="grid gap-6 p-6" style={{
      gridTemplateColumns: 'repeat(auto-fit, minmax(312px, 1fr))',
      '@media (min-width: 1536px)': {
        gridTemplateColumns: 'repeat(5, 1fr)'
      },
      '@media (min-width: 1280px) and (max-width: 1535px)': {
        gridTemplateColumns: 'repeat(4, 1fr)'
      },
      '@media (min-width: 1024px) and (max-width: 1279px)': {
        gridTemplateColumns: 'repeat(3, 1fr)'
      },
      '@media (min-width: 768px) and (max-width: 1023px)': {
        gridTemplateColumns: 'repeat(2, 1fr)'
      },
      '@media (max-width: 767px)': {
        gridTemplateColumns: '1fr'
      }
    }}>
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