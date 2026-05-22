'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

interface UrgencyBadgeProps {
  level: 'Low' | 'Moderate' | 'High' | 'Emergency';
}

export default function UrgencyBadge({ level }: UrgencyBadgeProps) {
  const t = useTranslations();
  
  const config = {
    Low: { 
      bg: 'bg-green-50 dark:bg-green-950/20', 
      text: 'text-green-700 dark:text-green-400', 
      border: 'border-green-200 dark:border-green-900/30', 
      dot: 'bg-green-500', 
      key: 'form.duration.less24' // Fallback check
    },
    Moderate: { 
      bg: 'bg-yellow-50 dark:bg-yellow-950/20', 
      text: 'text-yellow-700 dark:text-yellow-400', 
      border: 'border-yellow-200 dark:border-yellow-900/30', 
      dot: 'bg-yellow-500', 
      key: 'report.urgency.moderate' 
    },
    High: { 
      bg: 'bg-orange-50 dark:bg-orange-950/20', 
      text: 'text-orange-700 dark:text-orange-400', 
      border: 'border-orange-200 dark:border-orange-900/30', 
      dot: 'bg-orange-500', 
      key: 'report.urgency.high' 
    },
    Emergency: { 
      bg: 'bg-red-50 dark:bg-red-950/20', 
      text: 'text-red-700 dark:text-red-400', 
      border: 'border-red-200 dark:border-red-900/30', 
      dot: 'bg-red-500', 
      key: 'report.urgency.emergency' 
    }
  };
  
  const current = config[level] || config.Low;
  
  // Custom labels in Hindi or English
  const getLabel = () => {
    if (level === 'Low') return t('title') === "MedAssist — AI चिकित्सा सहायक" ? "कम (Low)" : "Low";
    if (level === 'Moderate') return t('title') === "MedAssist — AI चिकित्सा सहायक" ? "मध्यम (Moderate)" : "Moderate";
    if (level === 'High') return t('title') === "MedAssist — AI चिकित्सा सहायक" ? "उच्च (High)" : "High";
    if (level === 'Emergency') return t('title') === "MedAssist — AI चिकित्सा सहायक" ? "आपातकाल (Emergency)" : "Emergency";
    return level;
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${current.bg} ${current.text} ${current.border} shadow-sm uppercase tracking-wider`}>
      <span className={`h-2 w-2 rounded-full ${current.dot} animate-pulse`} />
      {getLabel()}
    </span>
  );
}
