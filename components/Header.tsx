'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, HelpCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const isEditor = pathname.startsWith('/book/');

  return (
    <header className="w-full h-14 bg-white border-b flex items-center justify-between px-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-900 no-underline"
      >
        <BookOpen className="w-5 h-5" />
        {!isEditor && <span className="text-lg font-semibold">マイブック</span>}
      </Link>
      {isEditor && <span className="text-lg font-semibold">三分割エディタ</span>}
      <button
        aria-label="ヘルプ"
        className="text-gray-600 hover:text-gray-800"
        type="button"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </header>
  );
}
