export interface ReportRequest {
  name?: string | null;
  symptoms: string[];
  duration?: string | null;
  medications?: string[];
  allergies?: string | null;
  conditions?: string[];
  age?: number | null;
  sex?: string | null;
  language: string;
}

export interface Diagnosis {
  name: string;
  explanation: string;
  likelihood: 'High' | 'Moderate' | 'Low';
}

export interface UrgencyInfo {
  level: 'Low' | 'Moderate' | 'High' | 'Emergency';
  reasoning: string;
  recommended_specialist: string;
}

export interface SuggestedMedication {
  name: string;
  generic_name: string;
  dosage: string;
  frequency: string;
  timing: 'Before meal' | 'After meal' | 'With meal' | 'Whenever required';
  meal_time: 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'As needed';
  duration: string;
  otc_or_rx: 'OTC' | 'Prescription';
  warnings: string[];
}

export interface DrugInteraction {
  drug_a: string;
  drug_b: string;
  severity: 'Dangerous' | 'Moderate' | 'Minor';
  description: string;
}

export interface AllergyFlag {
  drug: string;
  allergen: string;
  description: string;
}

export interface MedicalReportResponse {
  diagnoses: Diagnosis[];
  urgency: UrgencyInfo;
  suggested_medications: SuggestedMedication[];
  drug_interactions: DrugInteraction[];
  allergy_flags: AllergyFlag[];
  general_advice: string[];
  generated_at?: string;
}

export interface MasterListData {
  common: string[];
  categories: Record<string, string[]>;
}
