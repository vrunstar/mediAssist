'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial theme from documentElement class or localStorage or system
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.theme === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow active:scale-95"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="h-4.5 w-4.5 transition-transform duration-500 rotate-0 hover:rotate-12" />
      ) : (
        <Sun className="h-4.5 w-4.5 transition-transform duration-500 rotate-0 hover:rotate-45" />
      )}
    </button>
  );
}
