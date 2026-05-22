import os
import sys

# Ensure the parent directory is in sys.path so 'backend' is recognized as a package
# even when starting the server directly from the backend/ directory.
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import report, pdf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

app = FastAPI(
    title="MedAssist AI Backend",
    description="FastAPI Medical Assessment Core serving AI-driven symptom triage reports and ReportLab PDFs",
    version="1.0.0"
)

# Configure CORS for Next.js local development and cloud deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://medi-assist-jade.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(report.router, tags=["Assessment"])
app.include_router(pdf.router, tags=["Reporting"])

# Helper function to read master data lists safely
def read_data_file(filename: str) -> dict:
    file_path = os.path.join(os.path.dirname(__file__), "data", filename)
    if not os.path.exists(file_path):
        logger.error(f"Master list file not found: {file_path}")
        raise HTTPException(status_code=404, detail=f"Database file {filename} not found.")
    
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception as e:
        logger.error(f"Error reading master list {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load master medical indices.")

# Master Dataset GET Endpoints for Frontend pill listings and modal popups
@app.get("/symptoms", tags=["Master Lists"])
async def get_symptoms():
    return read_data_file("symptoms.json")

@app.get("/medications", tags=["Master Lists"])
async def get_medications():
    return read_data_file("medications.json")

@app.get("/conditions", tags=["Master Lists"])
async def get_conditions():
    return read_data_file("conditions.json")

@app.get("/", tags=["Health Check"])
async def health_check():
    return {
        "status": "online",
        "service": "MedAssist AI Medical Assessment API Core",
        "api_key_configured": bool(os.getenv("GROQ_API_KEY"))
    }
