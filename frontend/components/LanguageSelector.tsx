'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, type Language } from '@/hooks/useLanguage';

const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English',           native: 'EN' },
  { value: 'zh', label: 'Mandarin',          native: '中文' },
  { value: 'de', label: 'Deutsch',           native: 'DE' },
  { value: 'id', label: 'Bahasa Indonesia',  native: 'ID' },
];

/* ── SVG Flag Icons ─────────────────────────────────────────────────────── */
function FlagUK() {
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#012169" />
      {/* White diagonals */}
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#fff" strokeWidth="4" />
      {/* Red diagonals */}
      <path d="M0,0 L30,20 M30,0 L0,20" stroke="#C8102E" strokeWidth="2.5" />
      {/* White cross */}
      <path d="M15,0 V20 M0,10 H30" stroke="#fff" strokeWidth="6" />
      {/* Red cross */}
      <path d="M15,0 V20 M0,10 H30" stroke="#C8102E" strokeWidth="3.5" />
    </svg>
  );
}

function FlagCN() {
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="20" fill="#DE2910" />
      <polygon points="5,3 6.5,7.5 2,4.5 8,4.5 3.5,7.5" fill="#FFDE00" />
      <polygon points="11,1 11.7,3.2 10,2 12,2 10.3,3.2" fill="#FFDE00" />
      <polygon points="13,4 13.7,6.2 12,5 14,5 12.3,6.2" fill="#FFDE00" />
      <polygon points="13,8 13.7,10.2 12,9 14,9 12.3,10.2" fill="#FFDE00" />
      <polygon points="11,11 11.7,13.2 10,12 12,12 10.3,13.2" fill="#FFDE00" />
    </svg>
  );
}

function FlagDE() {
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="6.67" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#DD0000" />
      <rect y="13.33" width="30" height="6.67" fill="#FFCE00" />
    </svg>
  );
}

function FlagID() {
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="10" fill="#CE1126" />
      <rect y="10" width="30" height="10" fill="#fff" />
    </svg>
  );
}

const FLAG_MAP: Record<Language, React.ReactNode> = {
  en: <FlagUK />,
  zh: <FlagCN />,
  de: <FlagDE />,
  id: <FlagID />,
};

/* ── Component ──────────────────────────────────────────────────────────── */
interface Props {
  /** compact = icon-only trigger (for navbar); default = icon + code label */
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: Props) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = LANGUAGES.find((l) => l.value === language)!;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`group flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white shadow-sm transition-all hover:border-[#2b68ff]/40 hover:shadow-md ${
          compact ? 'h-9 px-2.5' : 'h-9 px-3'
        }`}
        aria-label="Select language"
      >
        {/* Flag */}
        <span className="h-[18px] w-[26px] overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
          {FLAG_MAP[language]}
        </span>

        {/* Code label */}
        {!compact && (
          <span className="text-[12px] font-bold tracking-wide text-[#374151]">
            {current.native}
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {/* Header */}
          <div className="border-b border-[#f1f5f9] px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
              Language
            </p>
          </div>

          {/* Options */}
          {LANGUAGES.map((lang) => {
            const isActive = lang.value === language;
            return (
              <button
                key={lang.value}
                type="button"
                onClick={() => { setLanguage(lang.value); setOpen(false); }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-[#eff6ff]'
                    : 'hover:bg-[#f8fafc]'
                }`}
              >
                {/* Flag */}
                <span className="h-[18px] w-[26px] flex-none overflow-hidden rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
                  {FLAG_MAP[lang.value]}
                </span>

                {/* Labels */}
                <span className="flex-1">
                  <span className={`block text-[13px] font-semibold leading-tight ${isActive ? 'text-[#2b68ff]' : 'text-[#1e293b]'}`}>
                    {lang.label}
                  </span>
                  <span className="block text-[11px] text-[#94a3b8]">
                    {lang.native}
                  </span>
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#2b68ff]">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
