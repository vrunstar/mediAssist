# MediAssist — AI-Powered Clinical Symptom Assessment & Triage Engine

MediAssist is a clinical-grade medical diagnostic aid and triage system designed to help users understand their symptoms and receive robust, evidence-based preliminary guidance. Powered by FastAPI, Next.js, and the Groq LLM API, the system parses symptom duration, pre-existing conditions, allergies, and active medications to render probabilistic diagnoses, urgency categories, lifestyle safety recommendations, and warning metrics.

---

## 🚀 Key Features

* **Clinical Triage Engine**: Computes ESI-based clinical urgency (Low, Moderate, High, Emergency) with immediate override flags for life-threatening symptom combinations.
* **Drug & Allergy Risk Checks**: Checks active patient medications against suggested therapies for dangerous drug-to-drug interactions and flags allergy cross-reactivities.
* **Bi-directional Localization**: Full English & Hindi (Devanagari script) localization across symptom inputs, clinical reports, and generated files.
* **Exportable PDF Reports**: Generates professional, multi-page ReportLab PDF records complete with NumberedCanvas headers, footers, and clinical summaries in the selected language.
* **Privacy-Conscious Input**: Includes an optional **Patient's Name** input field, keeping clinical assessments highly personal yet strictly optional and secure.

---

## 🛠️ Technology Stack

### Backend (Diagnostic & Rendering Core)
* **FastAPI**: Asynchronous Python medical API server.
* **Pydantic**: Robust payload structure validation and data sanitization.
* **ReportLab**: High-fidelity, multi-page PDF generation supporting custom fonts (including Hindi Devanagari script).
* **Groq SDK**: Extremely low-latency, structured clinical assessment outputs powered by LLMs (`llama-3.3-70b-versatile`).

### Frontend (User Experience & Interface)
* **Next.js (App Router)**: Fast, structured React application framework.
* **Tailwind CSS**: Modern styling system featuring rich aesthetics, high responsiveness, and polished interactive states.
* **next-intl**: Flexible translation framework driving seamless English/Hindi localization.
* **Lucide React**: Clean, clinical vector icons.

---

## ⚙️ Project Structure

```text
mediAssist/
├── backend/
│   ├── data/                 # Master lists of chronic conditions, medications, symptoms
│   ├── models/               # Pydantic schemas validating API requests & structured reports
│   ├── prompts/              # Strict, highly deterministic LLM clinical system prompts
│   ├── routers/              # Endpoint handlers for triage assessments and PDF generation
│   ├── services/             # Core engines for Groq completions and ReportLab rendering
│   ├── tests/                # Automated validation and parser test suites
│   └── venv/                 # Python local virtual environment
└── frontend/
    ├── app/                  # Next.js pages and localized locales router
    ├── components/           # Modularized UI components (ReportCards, Selectors, Badges)
    ├── lib/                  # TypeScript interface types and client API clients
    └── messages/             # i18n JSON locales translation records (English & Hindi)
```

---

## 🏃 Getting Started

### 1. Prerequisite Setup

Ensure you have **Python 3.10+** and **Node.js 18+** installed. You will also need a Groq API Key to enable live AI assessments (the backend will gracefully fallback to high-fidelity mock data if no key is supplied).

Define your configuration by adding your Groq API key inside `backend/.env`:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 2. Running the Backend Server

```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
The backend documentation and API board will be active at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 3. Running the Frontend Client

```bash
# Navigate to the frontend directory
cd frontend

# Install package dependencies
npm install

# Run the development server
npm run dev
```
The Next.js client interface will be live at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Verification & Testing

### Running Unit Tests
A Python unit test suite validates emergency overrides, Pydantic constraints, and JSON parsing logic:
```bash
cd backend
venv\Scripts\python.exe -m unittest tests/test_services.py
```

### TypeScript Validation
Verify frontend code safety using the compiler typechecker:
```bash
cd frontend
npx tsc --noEmit
```

---

## ⚖️ Clinical Disclaimer

This software is an AI-generated informational prototype and **does not constitute professional medical advice, diagnosis, or treatment**. Always consult with a licensed healthcare practitioner before making clinical decisions. If you are experiencing a medical emergency, immediately contact your local emergency services (like 112 or 911) or visit the nearest ER.
