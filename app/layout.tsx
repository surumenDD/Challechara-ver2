import './globals.css';
import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'My Books Editor',
  description: 'A beautiful three-pane editor for creative writing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <ThemeRegistry>
          <Header />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
