'use client';

import { useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

export function useLanguage() {
  const [lang, setLang] = useState<Language>('fr');

  useEffect(() => {
    // Read from localStorage on mount (prevents SSR mismatch)
    const saved = localStorage.getItem('photoflow_lang') as Language;
    if (saved === 'fr' || saved === 'en') {
      setTimeout(() => setLang(saved), 0);
    }

    const handleLangChange = () => {
      const updated = localStorage.getItem('photoflow_lang') as Language;
      if (updated === 'fr' || updated === 'en') {
        setLang(updated);
      }
    };

    window.addEventListener('photoflow_lang_change', handleLangChange);
    return () => {
      window.removeEventListener('photoflow_lang_change', handleLangChange);
    };
  }, []);

  return lang;
}
