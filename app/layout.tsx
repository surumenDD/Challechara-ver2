import '@openameba/spindle-ui/index.css';
import './globals.css';
import type { Metadata } from 'next';

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
      <body className="font-sans">{children}</body>
    </html>
  );
}