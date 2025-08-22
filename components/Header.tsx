'use client';

import { Button } from '@openameba/spindle-ui';
import { BookOpen, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isEditor = pathname.startsWith('/book/');

  return (
    <header className="h-14 px-4 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
        >
          <BookOpen className="w-6 h-6" />
          {!isEditor && <span className="font-semibold text-lg">マイブック</span>}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isEditor && (
          <div className="text-center">
            <h1 className="font-semibold text-lg text-gray-900">三分割エディタ</h1>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="lighted"
          size="small"
          aria-label="ヘルプ"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}