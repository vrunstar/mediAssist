import React from 'react';
import './globals.css';

export const metadata = {
  title: 'MedAssist — AI Symptom Assessment Platform',
  description: 'Clinical-grade, AI-powered medical symptom assessment, drug interaction warning, and triage recommendation platform.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
