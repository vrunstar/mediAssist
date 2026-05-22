'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MedicalReportResponse, ReportRequest } from '../lib/types';
import UrgencyBadge from './UrgencyBadge';
import DisclaimerBanner from './DisclaimerBanner';
import { 
  Heart, 
  Stethoscope, 
  AlertOctagon, 
  Pill, 
  RefreshCw, 
  ShieldAlert, 
  ClipboardList,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ReportCardProps {
  report: MedicalReportResponse;
  patientData: ReportRequest;
}

export default function ReportCard({ report, patientData }: ReportCardProps) {
  const t = useTranslations();
  const { diagnoses, urgency, suggested_medications, drug_interactions, allergy_flags, general_advice, generated_at } = report;

  // Style configurations for Triage
  const triageStyles = {
    Low: {
      bg: 'bg-green-50/70 dark:bg-green-950/20 border-green-200 dark:border-green-900/30',
      text: 'text-green-950 dark:text-green-200',
      title: 'text-green-800 dark:text-green-400',
      accent: 'border-l-green-500'
    },
    Moderate: {
      bg: 'bg-yellow-50/70 dark:bg-yellow-950/20 border-yellow-250 dark:border-yellow-900/30',
      text: 'text-yellow-950 dark:text-yellow-200',
      title: 'text-yellow-800 dark:text-yellow-400',
      accent: 'border-l-yellow-500'
    },
    High: {
      bg: 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30',
      text: 'text-orange-950 dark:text-orange-200',
      title: 'text-orange-800 dark:text-orange-400',
      accent: 'border-l-orange-500'
    },
    Emergency: {
      bg: 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/30',
      text: 'text-red-950 dark:text-red-200',
      title: 'text-red-800 dark:text-red-400',
      accent: 'border-l-red-500 animate-pulse'
    }
  };

  const currentTriage = triageStyles[urgency.level] || triageStyles.Low;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Report Header Metadata */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-primary-500 uppercase tracking-widest">
            {t('report.title')}
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ClipboardList className="h-6.5 w-6.5 text-primary-500" />
            {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "मूल्यांकन विवरण" : "Assessment Clinical Record"}
          </h2>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-semibold md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
          <div>
            {t('report.id')}{' '}
            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase">
              MA-{generated_at ? generated_at.slice(14, 19).replace(':', '') : 'XXXX'}
            </span>
          </div>
          <div>
            {t('report.generated')}{' '}
            <span className="text-slate-800 dark:text-slate-350">
              {generated_at ? new Date(generated_at).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Patient Summary */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-primary-500" />
          {t('report.patientSummary.title')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.name')}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate" title={patientData.name || ''}>
              {patientData.name || (t('title') === "MedAssist — AI चिकित्सा सहायक" ? "प्रदान नहीं किया गया" : "Not provided")}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.age')}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {patientData.age !== null && patientData.age !== undefined ? `${patientData.age} ${t('title') === "MedAssist — AI चिकित्सा सहायक" ? "वर्ष" : "years"}` : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.sex')}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {patientData.sex ? (
                patientData.sex === 'Male' ? t('form.patientInfo.sex.male') : 
                patientData.sex === 'Female' ? t('form.patientInfo.sex.female') : 
                t('form.patientInfo.sex.other')
              ) : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.duration')}
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              {patientData.duration ? (
                patientData.duration === 'Less than 24 hours' ? t('form.duration.less24') :
                patientData.duration === '1-3 days' ? t('form.duration.1to3') :
                patientData.duration === '4-7 days' ? t('form.duration.4to7') :
                patientData.duration === '1-2 weeks' ? t('form.duration.1to2w') :
                t('form.duration.more2w')
              ) : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.allergies')}
            </span>
            <p className="text-sm font-bold text-red-600 dark:text-red-400 truncate" title={patientData.allergies || ''}>
              {patientData.allergies || (t('title') === "MedAssist — AI चिकित्सा सहायक" ? "कोई नहीं" : "None")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.symptoms')}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {patientData.symptoms.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('report.patientSummary.meds')}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {patientData.medications && patientData.medications.length > 0 ? (
                patientData.medications.map((m) => (
                  <span key={m} className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-200 dark:border-slate-700">
                    {m}
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-550">
                  {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "कोई नहीं" : "None reported"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Urgency Triage Callout */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border-l-4 border ${currentTriage.accent} dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-primary-500" />
            {t('report.urgency.title')}
          </h3>
          <UrgencyBadge level={urgency.level} />
        </div>
        <div className={`p-4 rounded-xl border ${currentTriage.bg}`}>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('report.urgency.reasoning')}
              </span>
              <p className={`text-sm font-semibold leading-relaxed mt-1 ${currentTriage.text}`}>
                {urgency.reasoning}
              </p>
            </div>
            <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-2.5">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t('report.urgency.specialist')}
              </span>
              <p className="text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white">
                {urgency.recommended_specialist}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Possible Diagnoses */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary-500" />
          {t('report.diagnoses.title')}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {diagnoses.map((diag, index) => {
            const likConfig = {
              High: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30',
              Moderate: 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30',
              Low: 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/30'
            };
            const likStyle = likConfig[diag.likelihood] || likConfig.Low;
            
            return (
              <div 
                key={diag.name} 
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {index + 1}. {diag.name}
                  </h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                    {diag.explanation}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider shrink-0 w-fit ${likStyle}`}>
                  {diag.likelihood}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Suggested Medications */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 overflow-hidden">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary-500" />
          {t('report.medications.title')}
        </h3>
        
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider w-[25%]">
                  {t('report.medications.table.drug')}
                </th>
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider w-[18%]">
                  {t('report.medications.table.dosage')}
                </th>
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider w-[20%]">
                  {t('report.medications.table.timing')}
                </th>
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider w-[17%]">
                  {t('report.medications.table.duration')}
                </th>
                <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider w-[20%]">
                  {t('report.medications.table.warnings')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {suggested_medications.map((med, index) => (
                <tr 
                  key={med.name} 
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <td className="px-4 py-4 text-xs font-medium text-slate-900 dark:text-white">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">{med.name}</div>
                    <div className="text-slate-400 dark:text-slate-500 mt-0.5">{med.generic_name}</div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div>{med.dosage}</div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">{med.frequency}</div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div className="text-primary-600 dark:text-primary-400 uppercase tracking-wide text-[10px]">{med.timing}</div>
                    <div className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{med.meal_time}</div>
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <div>{med.duration}</div>
                    <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-1 ${
                      med.otc_or_rx === 'OTC' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                    }`}>
                      {med.otc_or_rx}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    <ul className="space-y-1 text-[11px]">
                      {med.warnings.map((w, wi) => (
                        <li key={wi} className="text-red-700 dark:text-red-400 font-medium flex items-start gap-1">
                          <span className="mt-1 shrink-0 h-1.5 w-1.5 bg-red-500 dark:bg-red-400 rounded-full" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Drug Interactions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary-500" />
          {t('report.interactions.title')}
        </h3>

        {drug_interactions.length === 0 ? (
          <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-150 dark:border-green-900/20 p-4 rounded-xl flex items-center gap-2.5 text-xs text-green-800 dark:text-green-300 font-bold">
            <CheckCircle className="h-4.5 w-4.5 text-green-600 shrink-0" />
            {t('report.interactions.none')}
          </div>
        ) : (
          <div className="space-y-3">
            {drug_interactions.map((inter) => {
              const sevStyle = 
                inter.severity === 'Dangerous' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' :
                inter.severity === 'Moderate' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' :
                'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-250 dark:border-yellow-900/30';
                
              return (
                <div key={`${inter.drug_a}-${inter.drug_b}`} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col sm:flex-row justify-between gap-3 animate-fadeIn">
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {inter.drug_a} ↔ {inter.drug_b}
                    </h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                      {inter.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wider shrink-0 h-fit w-fit ${sevStyle}`}>
                    {inter.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 6: Allergy Flags */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary-500" />
          {t('report.allergies.title')}
        </h3>

        {allergy_flags.length === 0 ? (
          <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-150 dark:border-green-900/20 p-4 rounded-xl flex items-center gap-2.5 text-xs text-green-800 dark:text-green-300 font-bold">
            <CheckCircle className="h-4.5 w-4.5 text-green-600 shrink-0" />
            {t('report.allergies.none')}
          </div>
        ) : (
          <div className="space-y-3">
            {allergy_flags.map((flag) => (
              <div key={flag.drug} className="bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 p-4 rounded-xl flex gap-3 animate-fadeIn">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-red-950 dark:text-red-200 uppercase tracking-wide">
                    {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "सक्रिय एलर्जी संघर्ष" : "Active Allergy Conflict"}
                  </h4>
                  <p className="text-xs font-bold text-red-800 dark:text-red-300 leading-relaxed">
                    <b>{flag.drug}</b> {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "दवा से एलर्जी जोखिम है क्योंकि रोगी को" : "contains triggers matching your reported allergy to"} <b>{flag.allergen}</b>: {flag.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: General Advice */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary-500" />
          {t('report.advice.title')}
        </h3>
        <ul className="space-y-3.5 pl-1.5">
          {general_advice.map((adv, index) => (
            <li key={index} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed animate-fadeIn" style={{ animationDelay: `${index * 60}ms` }}>
              <span className="h-5 w-5 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center border border-primary-100 dark:border-primary-900/30 text-[10px] text-primary-600 dark:text-primary-400 shrink-0 font-black mt-0.5">
                {index + 1}
              </span>
              <span>{adv}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
