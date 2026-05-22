'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: 'en' | 'hi') => {
    if (locale === newLocale) return;
    if (!pathname) return;
    
    // Split segments and replace the first dynamic locale parameter
    const segments = pathname.split('/');
    if (segments.length > 1 && (segments[1] === 'en' || segments[1] === 'hi')) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    
    const newPath = segments.join('/') || '/';
    router.replace(newPath);
  };

  return (
    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-full border border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-1.5 px-2.5 text-slate-500 dark:text-slate-400">
        <Languages className="h-4 w-4" />
      </div>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          locale === 'en'
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('hi')}
        className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          locale === 'hi'
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-slate-600 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        हिं
      </button>
    </div>
  );
}

