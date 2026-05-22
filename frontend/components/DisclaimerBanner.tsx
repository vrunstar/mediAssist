'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  const t = useTranslations();
  
  return (
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 border-l-4 border-l-red-600 p-4 rounded-xl shadow-sm flex gap-3 animate-fadeIn">
      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-extrabold text-red-950 dark:text-red-200 uppercase tracking-wider">
          {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "चिकित्सा चेतावनी / Disclaimer" : "Medical Disclaimer"}
        </h4>
        <p className="text-xs font-medium text-red-800 dark:text-red-300 leading-relaxed mt-1">
          {t('report.disclaimer')}
        </p>
      </div>
    </div>
  );
}
