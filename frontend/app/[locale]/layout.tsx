import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Outfit } from 'next/font/google';
import LanguageToggle from '../../components/LanguageToggle';
import ThemeToggle from '../../components/ThemeToggle';
import { Activity } from 'lucide-react';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Validate that the incoming locale is supported
  if (locale !== 'en' && locale !== 'hi') {
    notFound();
  }

  // Load appropriate translation messages for the given locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${outfit.variable} font-sans`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (_) {}
        ` }} />
      </head>
      <body className="bg-brandbg dark:bg-slate-950 min-h-screen flex flex-col text-slate-950 dark:text-slate-100 transition-colors duration-300">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Header Navigation Bar */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 shadow-sm transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              {/* Branding Logo */}
              <div className="flex items-center gap-2">
                <div className="bg-primary-500 p-2 rounded-xl text-white shadow-md shadow-primary-500/20">
                  <Activity className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    MedAssist
                  </h1>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    Clinical AI
                  </span>
                </div>
              </div>
              
              {/* Controls: Theme & Locale Switchers */}
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </header>

          {/* Main Area */}
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>

          {/* Clean clinical Footer */}
          <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-6 mt-12 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-2">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">
                &copy; {new Date().getFullYear()} MedAssist AI Inc. All rights reserved.
              </p>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed">
                An anonymous, stateless medical screening prototype. All processing occurs ephemerally and is not recorded. In case of emergency, contact emergency medical channels immediately.
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
