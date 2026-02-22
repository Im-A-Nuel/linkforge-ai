'use client';

import { useState, useEffect } from 'react';

export type Language = 'en' | 'zh' | 'de' | 'id';

const STORAGE_KEY = 'linkforge-language';
const VALID: Language[] = ['en', 'zh', 'de', 'id'];

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && VALID.includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return { language, setLanguage };
}
