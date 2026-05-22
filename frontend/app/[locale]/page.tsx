'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import SymptomSelector from '../../components/SymptomSelector';
import MedicationSelector from '../../components/MedicationSelector';
import ConditionSelector from '../../components/ConditionSelector';
import { ReportRequest } from '../../lib/types';
import { 
  User, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  FileText,
  Activity
} from 'lucide-react';

export default function IntakePage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  // Form State parameters
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');
  const [sex, setSex] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Ensure at least 1 symptom is selected as per clinical rules
    if (symptoms.length === 0) {
      setValidationError(t('form.symptoms.min_required'));
      // Scroll to symptom section smoothly
      const element = document.getElementById('symptoms-selector-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const payload: ReportRequest = {
      name: name.trim() || null,
      symptoms,
      duration: duration || null,
      medications: medications.length > 0 ? medications : [],
      allergies: allergies.trim() || null,
      conditions: conditions.length > 0 ? conditions : [],
      age: age !== '' ? Number(age) : null,
      sex: sex || null,
      language: locale
    };

    // Stash intake in sessionStorage to load in report screen
    sessionStorage.setItem('medassist_patient_data', JSON.stringify(payload));
    
    // Clear any previous report response cache
    sessionStorage.removeItem('medassist_report_response');

    // Route to the dynamic report screen
    router.push(`/${locale}/report`);
  };

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 shadow-sm uppercase tracking-wider">
          <Activity className="h-3.5 w-3.5" />
          {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "स्मार्ट रोग निदान प्रणाली" : "Stateless Medical Diagnostic Core"}
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t('title')}
        </h2>
        <p className="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Demographics & Metadata */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient Info Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3 uppercase tracking-wider">
              <User className="h-4.5 w-4.5 text-primary-500" />
              {t('form.patientInfo.title')}
            </h3>
            
            <div className="space-y-4">
              {/* Patient's Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('form.patientInfo.nameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('form.patientInfo.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-950 dark:text-white transition-all"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('form.patientInfo.age')}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') setAge('');
                    else {
                      const num = Number(val);
                      if (num >= 0 && num <= 125) setAge(num);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-950 dark:text-white transition-all"
                />
              </div>

              {/* Biological Sex */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('form.patientInfo.sexLabel')}
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-950 dark:text-white transition-all cursor-pointer"
                >
                  <option value="" className="dark:bg-slate-900">{t('form.patientInfo.sex.placeholder')}</option>
                  <option value="Male" className="dark:bg-slate-900">{t('form.patientInfo.sex.male')}</option>
                  <option value="Female" className="dark:bg-slate-900">{t('form.patientInfo.sex.female')}</option>
                  <option value="Prefer not to say" className="dark:bg-slate-900">{t('form.patientInfo.sex.other')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Metadata Card: Duration & Allergies */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
            {/* Duration */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3 uppercase tracking-wider">
                <Clock className="h-4.5 w-4.5 text-primary-500" />
                {t('form.duration.label')}
              </h3>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-950 dark:text-white transition-all cursor-pointer"
              >
                <option value="" className="dark:bg-slate-900">{t('form.duration.placeholder')}</option>
                <option value="Less than 24 hours" className="dark:bg-slate-900">{t('form.duration.less24')}</option>
                <option value="1-3 days" className="dark:bg-slate-900">{t('form.duration.1to3')}</option>
                <option value="4-7 days" className="dark:bg-slate-900">{t('form.duration.4to7')}</option>
                <option value="1-2 weeks" className="dark:bg-slate-900">{t('form.duration.1to2w')}</option>
                <option value="More than 2 weeks" className="dark:bg-slate-900">{t('form.duration.more2w')}</option>
              </select>
            </div>

            {/* Allergies */}
            <div className="space-y-3 border-t border-slate-50 dark:border-slate-800 pt-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-1.5 uppercase tracking-wider">
                <ShieldAlert className="h-4.5 w-4.5 text-primary-500" />
                {t('form.allergies.label')}
              </h3>
              <input
                type="text"
                placeholder={t('form.allergies.placeholder')}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-950 dark:text-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Selectors (Symptoms, Meds, Conditions) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Symptoms Panel */}
          <div id="symptoms-selector-section" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <SymptomSelector selectedSymptoms={symptoms} onChange={setSymptoms} />
            {validationError && (
              <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-3 animate-fadeIn flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {validationError}
              </p>
            )}
          </div>

          {/* Medications Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <MedicationSelector selectedMedications={medications} onChange={setMedications} />
          </div>

          {/* Pre-existing Conditions Panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <ConditionSelector selectedConditions={conditions} onChange={setConditions} />
          </div>

          {/* Submit Trigger Box */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 px-6 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
            >
              <FileText className="h-5 w-5" />
              {t('form.submit')}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
