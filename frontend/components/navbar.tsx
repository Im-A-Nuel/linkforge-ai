'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from './connect-wallet';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/logs', label: 'Logs' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1220px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-3xl font-black tracking-tight text-[#2b68ff]">
            LinkForge AI
          </Link>
          <nav className="flex items-center gap-2 rounded-full border border-[#d9e0f3] bg-white/80 p-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pathname === link.href
                    ? 'bg-[#2b68ff] text-white shadow-[0_8px_16px_rgba(43,104,255,0.28)]'
                    : 'text-[#566178] hover:bg-[#edf2ff] hover:text-[#2b68ff]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <ConnectWallet className="px-5 py-2.5 text-sm" />
      </div>
    </header>
  );
}
