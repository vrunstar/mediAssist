import axios from 'axios';
import { ReportRequest, MedicalReportResponse, MasterListData } from './types';

// Retrieve backend API base URL from environment configurations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Fetches the master list of categorized symptoms.
   */
  async getSymptoms(): Promise<MasterListData> {
    const response = await client.get<MasterListData>('/symptoms');
    return response.data;
  },

  /**
   * Fetches the master list of categorized medications.
   */
  async getMedications(): Promise<MasterListData> {
    const response = await client.get<MasterListData>('/medications');
    return response.data;
  },

  /**
   * Fetches the master list of categorized medical conditions.
   */
  async getConditions(): Promise<MasterListData> {
    const response = await client.get<MasterListData>('/conditions');
    return response.data;
  },

  /**
   * Dispatches symptoms and demographics to Groq for assessment.
   */
  async generateReport(data: ReportRequest): Promise<MedicalReportResponse> {
    const response = await client.post<MedicalReportResponse>('/report', data);
    return response.data;
  },

  /**
   * Triggers the backend ReportLab engine and downloads the compiled clinical PDF.
   */
  async downloadPdf(report: MedicalReportResponse, patientData: ReportRequest): Promise<void> {
    const response = await client.post('/pdf', { report, patient_data: patientData }, {
      responseType: 'blob', // Crucial for handling binary PDF stream
    });

    // Create a virtual browser attachment anchor to trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Format descriptive clinical filename
    const timestamp = new Date().toISOString().slice(0,10).replace(/-/g, "");
    link.href = url;
    link.setAttribute('download', `medassist_report_${timestamp}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up memory space
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
