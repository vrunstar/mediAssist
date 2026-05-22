'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X, Plus, Check } from 'lucide-react';

interface CategoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categories: Record<string, string[]>;
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  allowCustomItem?: boolean;
}

export default function CategoryPopup({
  isOpen,
  onClose,
  title,
  categories,
  selectedItems,
  onToggleItem,
  allowCustomItem = false,
}: CategoryPopupProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc closes the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search filtering logic across all categories
  const filteredCategories: Record<string, string[]> = {};
  let totalMatches = 0;

  Object.entries(categories).forEach(([category, items]) => {
    const matchedItems = items.filter((item) =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchedItems.length > 0) {
      filteredCategories[category] = matchedItems;
      totalMatches += matchedItems.length;
    }
  });

  const handleAddCustom = () => {
    const val = customValue.trim();
    if (!val) return;
    onToggleItem(val);
    setCustomValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('popup.search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Categories / Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {allowCustomItem && (
            <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2">
              <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('popup.add_custom')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('popup.custom_placeholder')}
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-250 dark:border-slate-700 text-slate-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button
                  onClick={handleAddCustom}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "जोड़ें" : "Add"}
                </button>
              </div>
            </div>
          )}

          {Object.entries(filteredCategories).length > 0 ? (
            Object.entries(filteredCategories).map(([category, items]) => (
              <div key={category} className="space-y-2.5">
                <h4 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => onToggleItem(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md scale-95'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "कोई परिणाम नहीं मिला।" : "No results found."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {selectedItems.length} {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "चयनित" : "selected"}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-primary-500/20 transition-all"
          >
            {t('popup.done')}
          </button>
        </div>
      </div>
    </div>
  );
}
