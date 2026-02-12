'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#ececec]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#1f6fff]/10 blur-3xl" />
        <div className="absolute right-10 top-36 h-72 w-72 rounded-full bg-[#ffcd4d]/15 blur-3xl" />
      </div>
      <Navbar />
      <main className="relative mx-auto w-full max-w-[1220px] px-6 py-10">{children}</main>
    </div>
  );
}
