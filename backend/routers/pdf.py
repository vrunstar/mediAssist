import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.models.schemas import MedicalReportResponse, ReportRequest
from backend.services.pdf_service import PDFService

logger = logging.getLogger(__name__)
router = APIRouter()

class PDFGenerateRequest(BaseModel):
    report: MedicalReportResponse
    patient_data: ReportRequest

@router.post("/pdf")
async def generate_pdf(payload: PDFGenerateRequest):
    logger.info("Received PDF download request.")
    try:
        report_dict = payload.report.model_dump()
        patient_dict = payload.patient_data.model_dump()
        
        # Build PDF stream
        pdf_stream = PDFService.generate_report_pdf(report_dict, patient_dict)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"medassist_report_{timestamp}.pdf"
        
        headers = {
            "Content-Disposition": f"attachment; filename={filename}"
        }
        
        return StreamingResponse(
            pdf_stream, 
            media_type="application/pdf", 
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Error generating ReportLab PDF: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An error occurred while compiling your PDF report: {str(e)}"
        )
