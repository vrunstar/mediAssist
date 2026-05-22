import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from backend.models.schemas import ReportRequest, MedicalReportResponse
from backend.services.groq_service import GroqService

logger = logging.getLogger(__name__)
router = APIRouter()

# Shared Groq service instance
def get_groq_service():
    return GroqService()

@router.post("/report", response_model=MedicalReportResponse)
async def generate_report(request: ReportRequest, service: GroqService = Depends(get_groq_service)):
    logger.info(f"Received assessment request: Language={request.language}, Symptoms={request.symptoms}")
    try:
        # Generate structured report from Groq API
        report_dict = service.generate_report(request)
        
        # Add generated timestamp
        report_dict["generated_at"] = datetime.utcnow().isoformat() + "Z"
        
        # Validate output against our schema
        validated_response = MedicalReportResponse(**report_dict)
        return validated_response
        
    except ValueError as val_err:
        logger.error(f"JSON parsing error: {str(val_err)}")
        raise HTTPException(
            status_code=502, 
            detail=f"Error parsing AI clinical output into structured medical format: {str(val_err)}"
        )
    except Exception as e:
        logger.error(f"Error compiling medical report: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while compiling your symptom report: {str(e)}"
        )
