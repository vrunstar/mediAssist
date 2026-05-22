'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { MedicalReportResponse, ReportRequest } from '../../../lib/types';
import ReportCard from '../../../components/ReportCard';
import { 
  ArrowLeft, 
  Download, 
  Activity, 
  ShieldAlert,
  Loader2,
  RefreshCcw
} from 'lucide-react';

export default function ReportPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();

  const [patientData, setPatientData] = useState<ReportRequest | null>(null);
  const [report, setReport] = useState<MedicalReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // 1. Recover patient data from sessionStorage
    const storedIntake = sessionStorage.getItem('medassist_patient_data');
    if (!storedIntake) {
      // Banish back to intake form if no data is found
      router.replace(`/${locale}`);
      return;
    }

    const parsedIntake: ReportRequest = JSON.parse(storedIntake);
    setPatientData(parsedIntake);

    // 2. Recover report cache if present to optimize API costs
    const cachedReport = sessionStorage.getItem('medassist_report_response');
    if (cachedReport) {
      setReport(JSON.parse(cachedReport));
      setLoading(false);
      return;
    }

    // 3. Make API call to FastAPI if no cache is present
    setLoading(true);
    setError('');
    api.generateReport(parsedIntake)
      .then((res) => {
        setReport(res);
        // Cache the response to avoid duplicate AI requests
        sessionStorage.setItem('medassist_report_response', JSON.stringify(res));
      })
      .catch((err) => {
        console.error("Error generating medical report:", err);
        setError(
          err.response?.data?.detail || 
          "Failed to communicate with MedAssist AI. Please check your network connection and API key configuration."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, locale]);

  const handleDownloadPdf = async () => {
    if (!report || !patientData || downloading) return;
    setDownloading(true);
    try {
      await api.downloadPdf(report, patientData);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem('medassist_patient_data');
    sessionStorage.removeItem('medassist_report_response');
    router.push(`/${locale}`);
  };

  // --- STUNNING SHIMMERING CLINICAL SKELETON LOADER ---
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
        {/* Header Block */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="space-y-2.5 w-[50%]">
            <div className="h-3 w-[40%] bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-6 w-[80%] bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Dynamic intake loading messages spinner */}
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 p-6 rounded-2xl text-center space-y-4 flex flex-col items-center">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-md text-primary-500 animate-spin">
            <Loader2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800 dark:text-white">
              {t('form.loadingTitle')}
            </h4>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('form.loadingSub')}
            </p>
          </div>
        </div>

        {/* Section skeletons mimicking ReportCard exactly */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="h-5 w-[25%] bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-4 gap-4 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-[50%] bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-[80%] bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="h-5 w-[30%] bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="h-5 w-[25%] bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-850" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- CLINICAL EXCEPTION ERROR BOARD ---
  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-6 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/30 p-8 rounded-3xl shadow-xl space-y-6 text-center flex flex-col items-center">
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full border border-red-150 dark:border-red-900/30">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "मूल्यांकन विफल" : "Assessment Compile Failure"}
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              {error}
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => router.replace('/')}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "वापस जाएं" : "Back to Intake"}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-lg shadow-primary-500/20"
            >
              <RefreshCcw className="h-4 w-4" />
              {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "पुनः प्रयास करें" : "Retry Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- REPORT VIEW COMPILING RENDER ---
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controller Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-4.5 w-4.5 shrink-0" />
          {t('report.backToForm')}
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 py-2.5 px-5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:bg-slate-400 dark:disabled:bg-slate-800 text-white dark:text-white rounded-xl text-xs font-extrabold shadow-md active:scale-95 transition-all select-none border dark:border-slate-700 uppercase tracking-widest"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              {t('title') === "MedAssist — AI चिकित्सा सहायक" ? "PDF बन रही है..." : "Compiling..."}
            </>
          ) : (
            <>
              <Download className="h-4 w-4 shrink-0" />
              {t('report.downloadPdf')}
            </>
          )}
        </button>
      </div>

      {/* Render parsed Medical Report Card */}
      {report && patientData && (
        <ReportCard report={report} patientData={patientData} />
      )}
    </div>
  );
}
