'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const authed = status === 'authenticated' && !!session?.user;

  const linkCls = (href: string) => {
    const active = pathname === href;
    return `text-sm ${
      active ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold text-gray-900 tracking-tight"
        >
          GrowthX <span className="text-violet-600">⚡</span>
        </Link>

        <div className="flex items-center gap-5">
          {status === 'loading' ? null : authed ? (
            <>
              <Link href="/dashboard" className={linkCls('/dashboard')}>
                Dashboard
              </Link>
              <Link href="/members" className={linkCls('/members')}>
                Members
              </Link>
              <Link href="/profile" className={linkCls('/profile')}>
                Profile
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className={linkCls('/signin')}>
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
