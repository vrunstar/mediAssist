'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '../lib/api';
import { MasterListData } from '../lib/types';
import CategoryPopup from './CategoryPopup';
import { Plus, X, Pill } from 'lucide-react';

interface MedicationSelectorProps {
  selectedMedications: string[];
  onChange: (medications: string[]) => void;
}

export default function MedicationSelector({ selectedMedications, onChange }: MedicationSelectorProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [masterList, setMasterList] = useState<MasterListData>({
    common: [
      "Paracetamol", "Ibuprofen", "Metformin", "Amlodipine", "Atorvastatin",
      "Omeprazole", "Aspirin", "Cetirizine", "Azithromycin", "Pantoprazole"
    ],
    categories: {}
  });

  // Pull master medications list from backend database
  useEffect(() => {
    api.getMedications()
      .then((data) => {
        if (data && data.common) setMasterList(data);
      })
      .catch((err) => console.error("Error fetching master medications:", err));
  }, []);

  const handleToggle = (medication: string) => {
    if (selectedMedications.includes(medication)) {
      onChange(selectedMedications.filter((m) => m !== medication));
    } else {
      onChange([...selectedMedications, medication]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Label and Subtitle */}
      <div>
        <label className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
          <Pill className="h-4.5 w-4.5 text-primary-500" />
          {t('form.medications.label')}
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {t('form.medications.subtitle')}
        </span>
      </div>

      {/* Selected Items Row */}
      {selectedMedications.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-primary-50/50 dark:bg-primary-950/20 rounded-xl border border-primary-100/50 dark:border-primary-900/30 min-h-[46px] animate-fadeIn">
          {selectedMedications.map((medication) => (
            <span
              key={medication}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary-500 text-white shadow-sm hover:bg-primary-600 transition-colors animate-fadeIn"
            >
              {medication}
              <button
                type="button"
                onClick={() => handleToggle(medication)}
                className="p-0.5 hover:bg-primary-400 rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 10 Common Medications + Trigger More */}
      <div className="flex flex-wrap gap-2.5">
        {masterList.common.map((medication) => {
          const isSelected = selectedMedications.includes(medication);
          return (
            <button
              type="button"
              key={medication}
              onClick={() => handleToggle(medication)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/10'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {medication}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-extrabold border bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border-slate-900 dark:border-slate-700 hover:border-slate-800 dark:hover:border-slate-600 transition-colors shadow-sm active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "और जोड़ें" : "Add More"}
        </button>
      </div>

      {/* Categorized Multi-Selection Overlay Popup (allowing custom unlisted entry) */}
      <CategoryPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('title') === "MedAssist — AI चिकित्सा सहायक" ? "सभी दवाएं खोजें" : "Search All Medications"}
        categories={masterList.categories}
        selectedItems={selectedMedications}
        onToggleItem={handleToggle}
        allowCustomItem={true}
      />
    </div>
  );
}
