'use client';

export type Language = 'en' | 'zh' | 'de' | 'id';

// Re-export from context so all components share a single language state
export { useLanguageContext as useLanguage } from '@/context/LanguageContext';
