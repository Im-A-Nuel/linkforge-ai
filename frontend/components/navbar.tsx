'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from './connect-wallet';
import { LanguageSelector } from './LanguageSelector';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
    { href: '/logs', label: 'Logs' },
  ];

  return (
    <header className="sticky top-0 z-40 px-1 py-3 bg-transparent">
      <div className="mx-auto flex h-14 w-full max-w-[1220px] items-center justify-between rounded-full border border-[#e2e8f0] bg-white/95 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.07)] backdrop-blur-md" style={{ overflow: 'visible' }}>
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/icon/LinkForge%20AI%20logo.png"
            alt="LinkForge AI"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-full object-cover shadow-[0_2px_8px_rgba(43,104,255,0.25)]"
          />
          <span className="text-[1.25rem] font-black leading-none tracking-tight">
            LinkForge <span className="text-[#2b68ff]">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                pathname === link.href
                  ? 'bg-[#2b68ff] text-white shadow-[0_4px_12px_rgba(43,104,255,0.28)]'
                  : 'text-[#566178] hover:bg-[#edf2ff] hover:text-[#2b68ff]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector compact />
          <ConnectWallet className="px-5 py-2.5 text-sm" />
        </div>
      </div>
    </header>
  );
}
