from pydantic import BaseModel, Field
from typing import List, Optional

class ReportRequest(BaseModel):
    name: Optional[str] = None
    symptoms: List[str] = Field(..., min_items=1)
    duration: Optional[str] = None
    medications: Optional[List[str]] = Field(default_factory=list)
    allergies: Optional[str] = None
    conditions: Optional[List[str]] = Field(default_factory=list)
    age: Optional[int] = Field(None, ge=0, le=125)
    sex: Optional[str] = None
    language: str = Field(default="en", pattern="^(en|hi)$")

class Diagnosis(BaseModel):
    name: str = Field(..., description="Name of the possible diagnosis")
    explanation: str = Field(..., description="Brief explanation, 1-2 sentences")
    likelihood: str = Field(..., description="Likelihood level: High | Moderate | Low")

class UrgencyInfo(BaseModel):
    level: str = Field(..., description="Urgency level: Low | Moderate | High | Emergency")
    reasoning: str = Field(..., description="Short reasoning, 2-3 sentences")
    recommended_specialist: str = Field(..., description="Recommended specialist type to consult")

class SuggestedMedication(BaseModel):
    name: str = Field(..., description="Commercial/Brand name of suggested drug")
    generic_name: str = Field(..., description="Generic name of the suggested drug")
    dosage: str = Field(..., description="Dosage of the drug, e.g. 500mg")
    frequency: str = Field(..., description="Frequency of intake, e.g. Twice daily")
    timing: str = Field(..., description="Timing: Before meal | After meal | With meal | Whenever required")
    meal_time: str = Field(..., description="Meal time: Morning | Afternoon | Evening | Night | As needed")
    duration: str = Field(..., description="Duration of treatment, e.g. 5 days")
    otc_or_rx: str = Field(..., description="Status: OTC | Prescription")
    warnings: List[str] = Field(..., description="List of important safety warnings/precautions")

class DrugInteraction(BaseModel):
    drug_a: str = Field(..., description="First interacting drug name")
    drug_b: str = Field(..., description="Second interacting drug name")
    severity: str = Field(..., description="Severity level: Dangerous | Moderate | Minor")
    description: str = Field(..., description="Short description of the interaction risk")

class AllergyFlag(BaseModel):
    drug: str = Field(..., description="Suggested drug that poses allergy risk")
    allergen: str = Field(..., description="The matching allergen reported by patient")
    description: str = Field(..., description="Clinical risk details")

class MedicalReportResponse(BaseModel):
    diagnoses: List[Diagnosis]
    urgency: UrgencyInfo
    suggested_medications: List[SuggestedMedication]
    drug_interactions: List[DrugInteraction]
    allergy_flags: List[AllergyFlag]
    general_advice: List[str]
    generated_at: Optional[str] = None
