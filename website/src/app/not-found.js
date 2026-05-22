'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[--ice-blue] mb-4">404</h1>
        <p className="text-2xl font-semibold mb-2">Page Not Found</p>
        <p className="text-[--glacial]/60 mb-8 max-w-md mx-auto">
          Looks like you&apos;ve wandered into the frosty void. Let&apos;s get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            <Home size={18} className="mr-2" />
            Back Home
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            <Search size={18} className="mr-2" />
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}