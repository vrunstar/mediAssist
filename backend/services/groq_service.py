import os
import re
import json
import logging
from groq import Groq
from backend.models.schemas import ReportRequest, MedicalReportResponse
from backend.prompts.medical_prompt import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)

EMERGENCY_OVERRIDE_EN = {
    "level": "Emergency",
    "reasoning": "The reported symptoms (such as chest pain combined with shortness of breath, signs of stroke, severe bleeding, or loss of consciousness) indicate a potentially life-threatening medical emergency. Please go to the nearest Emergency Department (ED) or call emergency services (like 911 or 112) immediately.",
    "recommended_specialist": "Emergency Medicine Specialist / ER Physician"
}

EMERGENCY_OVERRIDE_HI = {
    "level": "Emergency",
    "reasoning": "बताए गए लक्षण (जैसे सांस की तकलीफ के साथ छाती में दर्द, स्ट्रोक के लक्षण, अत्यधिक रक्तस्राव, या बेहोशी) एक संभावित जीवन-घातक चिकित्सा आपातकाल का संकेत देते हैं। कृपया तुरंत निकटतम आपातकालीन विभाग (ED) में जाएं या आपातकालीन सेवाओं (जैसे 112) को कॉल करें।",
    "recommended_specialist": "आपातकालीन चिकित्सा विशेषज्ञ (Emergency Medicine Specialist) / ईआर डॉक्टर"
}

def check_emergency_override(symptoms: list) -> bool:
    symptoms_lower = [str(s).lower() for s in symptoms]
    
    # Check for chest pain AND shortness of breath
    has_chest_pain = any("chest pain" in s or "छाती में दर्द" in s or "सीने में दर्द" in s for s in symptoms_lower)
    has_sob = any(
        "shortness of breath" in s or 
        "breathless" in s or 
        "difficulty breathing" in s or 
        "सांस की तकलीफ" in s or 
        "सांस फूलना" in s for s in symptoms_lower
    )
    if has_chest_pain and has_sob:
        return True
        
    # Check for stroke signs
    stroke_keywords = [
        "stroke", "face drooping", "arm weakness", "speech difficulty", 
        "difficulty speaking", "numbness on one side", "लकवा", "स्ट्रोक", "बोलने में कठिनाई"
    ]
    if any(any(kw in s for kw in stroke_keywords) for s in symptoms_lower):
        return True
        
    # Check for severe bleeding
    bleeding_keywords = [
        "severe bleeding", "uncontrolled bleeding", "heavy bleeding", 
        "hemorrhage", "अत्यधिक रक्तस्राव", "खून बहना"
    ]
    if any(any(kw in s for kw in bleeding_keywords) for s in symptoms_lower):
        return True
        
    # Check for loss of consciousness
    loc_keywords = [
        "loss of consciousness", "fainted", "fainting", "passed out", 
        "unconscious", "बेहोश", "बेहोशी", "चक्कर खाकर गिरना"
    ]
    if any(any(kw in s for kw in loc_keywords) for s in symptoms_lower):
        return True
        
    return False

def parse_json_robustly(text: str) -> dict:
    text_clean = text.strip()
    
    # Try parsing directly
    try:
        return json.loads(text_clean)
    except json.JSONDecodeError:
        pass

    # Try finding content between the first { and the last }
    match = re.search(r'(\{.*\})', text_clean, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try removing markdown code block wrappers
    if text_clean.startswith("```"):
        lines = text_clean.splitlines()
        # Filter out lines starting with ```
        filtered_lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(filtered_lines)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass

    raise ValueError("Failed to parse response text into valid JSON structure")

class GroqService:
    def _is_mock_mode(self) -> bool:
        if not self.api_key:
            return True
        key_clean = self.api_key.strip().lower()
        return (
            key_clean == "" or 
            key_clean == "your_groq_api_key" or 
            key_clean.startswith("your_groq_") or 
            "placeholder" in key_clean
        )

    def __init__(self):
        # Retrieve Groq API Key
        self.api_key = os.getenv("GROQ_API_KEY")
        if self._is_mock_mode():
            logger.warning("GROQ_API_KEY environment variable is not set or contains the default placeholder. Serving mock clinical data.")
        
    def _generate_mock_report(self, request_data: ReportRequest) -> dict:
        # Determine the primary symptom
        primary = request_data.symptoms[0].lower() if request_data.symptoms else "fever"
        lang = request_data.language
        
        # Check if they have an active aspirin medication to trigger mock drug interactions
        has_aspirin_med = any("aspirin" in m.lower() or "एस्पिरिन" in m.lower() for m in request_data.medications) if request_data.medications else False
        
        # Check if they have an active NSAID allergy to trigger allergy flags
        has_nsaid_allergy = "nsaid" in (request_data.allergies or "").lower() or "aspirin" in (request_data.allergies or "").lower() or "दर्द निवारक" in (request_data.allergies or "").lower()
        
        # English mocks
        if lang == "en":
            if "chest" in primary or "breath" in primary or "shortness" in primary:
                report = {
                    "diagnoses": [
                        {"name": "Suspected Angina / Myocardial Infarction", "explanation": "Potentially severe cardiac ischemia requiring emergency diagnostic assessment (ECG, Troponin testing).", "likelihood": "High"},
                        {"name": "Gastroesophageal Reflux Disease (GERD)", "explanation": "Stomach acid flow back into the food pipe mimicking non-cardiac chest discomfort.", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Emergency",
                        "reasoning": "Symptoms of chest discomfort combined with difficulty breathing are high-risk indicators of potential cardiovascular compromise.",
                        "recommended_specialist": "Cardiologist / Emergency Medicine Specialist"
                    },
                    "suggested_medications": [
                        {
                            "name": "Aspirin", "generic_name": "Acetylsalicylic acid", "dosage": "325mg", 
                            "frequency": "Once immediately", "timing": "Whenever required", "meal_time": "As needed", 
                            "duration": "1 day", "otc_or_rx": "OTC", "warnings": ["Do not take if you have active bleeding disorders or aspirin allergy."]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "Rest quietly in a comfortable sitting position.",
                        "Do not engage in physical exertion.",
                        "Have someone escort you to the emergency room immediately."
                    ]
                }
            elif "headache" in primary or "migraine" in primary:
                report = {
                    "diagnoses": [
                        {"name": "Tension Headache", "explanation": "Mild to moderate pain, often described as a tight band around the head, triggered by stress or fatigue.", "likelihood": "High"},
                        {"name": "Migraine", "explanation": "Intense throbbing pain, usually on one side of the head, often accompanied by sensitivity to light or nausea.", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Low",
                        "reasoning": "Isolated mild headache without neurologic deficits is generally safe for home monitoring and OTC support.",
                        "recommended_specialist": "Primary Care Physician / Neurologist"
                    },
                    "suggested_medications": [
                        {
                            "name": "Ibuprofen", "generic_name": "Ibuprofen", "dosage": "400mg", 
                            "frequency": "Every 8 hours as needed", "timing": "After meal", "meal_time": "As needed", 
                            "duration": "3 days", "otc_or_rx": "OTC", "warnings": ["Take with food to prevent stomach irritation. Do not exceed 1200mg/day."]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "Rest in a dark, quiet room.",
                        "Maintain proper hydration by drinking fluids.",
                        "Apply a cool compress to your forehead or temples."
                    ]
                }
            else: # Fever, cough, general
                report = {
                    "diagnoses": [
                        {"name": "Viral Upper Respiratory Tract Infection", "explanation": "Self-limiting viral invasion of the nasal and pharyngeal passages causing fever and congestion.", "likelihood": "High"},
                        {"name": "Acute Bronchitis", "explanation": "Transient inflammation of the bronchial airways, usually viral, causing self-limiting cough.", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Moderate",
                        "reasoning": "Symptoms are consistent with a typical viral syndrome. Monitor for worsening respiratory status.",
                        "recommended_specialist": "General Practitioner / Pulmonologist"
                    },
                    "suggested_medications": [
                        {
                            "name": "Paracetamol", "generic_name": "Acetaminophen", "dosage": "500mg", 
                            "frequency": "Three times daily", "timing": "After meal", "meal_time": "Morning/Afternoon/Night", 
                            "duration": "5 days", "otc_or_rx": "OTC", "warnings": ["Do not exceed recommended dosage. Watch for liver safety."]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "Ensure adequate bed rest and hydration.",
                        "Warm saline gargles may soothe throat irritation.",
                        "Consult a physician if fever persists beyond 3 days."
                    ]
                }
            
            # Inject interactive drug interaction warning if they entered Aspirin and we suggested Ibuprofen/Aspirin
            if has_aspirin_med:
                report["drug_interactions"].append({
                    "drug_a": "Aspirin (Current)",
                    "drug_b": "Ibuprofen (Suggested)",
                    "severity": "Moderate",
                    "description": "Combining aspirin with other NSAIDs like ibuprofen increases the risk of gastrointestinal bleeding and ulcers."
                })
            
            # Inject interactive allergy warning if they reported allergy to NSAIDs
            if has_nsaid_allergy:
                suggested_drug = report["suggested_medications"][0]["name"]
                report["allergy_flags"].append({
                    "drug": suggested_drug,
                    "allergen": "NSAIDs / Aspirin",
                    "description": f"The patient reported an allergy to NSAIDs/Aspirin, which conflicts with the suggested medication {suggested_drug}. Do not take this medication."
                })
                
            return report
            
        # Hindi mocks
        else:
            if "chest" in primary or "breath" in primary or "shortness" in primary or "दर्द" in primary or "सांस" in primary:
                report = {
                    "diagnoses": [
                        {"name": "संभावित एनजाइना / मायोकार्डियल इन्फ्रैक्शन", "explanation": "आपातकालीन नैदानिक मूल्यांकन (ईसीजी, ट्रोपोनिन परीक्षण) की आवश्यकता वाले संभावित गंभीर कार्डियक इस्किमिया लक्षण।", "likelihood": "High"},
                        {"name": "गैस्ट्रोएसोफेगल रिफ्लक्स रोग (GERD)", "explanation": "भोजन नली में पेट के एसिड का वापस बहना जो गैर-हृदय छाती की परेशानी की नकल करता है।", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Emergency",
                        "reasoning": "सांस की तकलीफ के साथ सीने में दर्द संभावित हृदय से जुड़ी आपातकालीन स्थिति के उच्च जोखिम वाले संकेत हैं।",
                        "recommended_specialist": "हृदय रोग विशेषज्ञ (Cardiologist) / आपातकालीन चिकित्सा विशेषज्ञ (ER Doctor)"
                    },
                    "suggested_medications": [
                        {
                            "name": "Aspirin", "generic_name": "Acetylsalicylic acid", "dosage": "325mg", 
                            "frequency": "तुरंत एक बार", "timing": "Whenever required", "meal_time": "As needed", 
                            "duration": "1 दिन", "otc_or_rx": "OTC", "warnings": ["सक्रिय रक्तस्राव विकार या एस्पिरिन एलर्जी होने पर इसका सेवन न करें।"]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "आरामदायक बैठने की स्थिति में चुपचाप आराम करें।",
                        "शारीरिक परिश्रम वाली गतिविधियों से पूरी तरह बचें।",
                        "किसी की मदद से तुरंत निकटतम आपातकालीन विभाग में पहुंचें।"
                    ]
                }
            elif "headache" in primary or "सिरदर्द" in primary:
                report = {
                    "diagnoses": [
                        {"name": "तनाव सिरदर्द (Tension Headache)", "explanation": "हल्का से मध्यम दर्द, जिसे अक्सर सिर के चारों ओर एक तंग पट्टी के रूप में वर्णित किया जाता है, जो तनाव या थकान से शुरू होता है।", "likelihood": "High"},
                        {"name": "माइग्रेन (Migraine)", "explanation": "तेज धड़कता हुआ दर्द, आमतौर पर सिर के एक तरफ, अक्सर प्रकाश के प्रति संवेदनशीलता या मतली के साथ होता है।", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Low",
                        "reasoning": "बिना किसी न्यूरोलॉजिकल कमी के केवल हल्का सिरदर्द होना घर पर निगरानी और ओटीसी दवाओं के समर्थन के लिए सुरक्षित है।",
                        "recommended_specialist": "प्राथमिक चिकित्सा चिकित्सक (Primary Care Physician) / न्यूरोलॉजिस्ट"
                    },
                    "suggested_medications": [
                        {
                            "name": "Ibuprofen", "generic_name": "Ibuprofen", "dosage": "400mg", 
                            "frequency": "आवश्यकतानुसार प्रत्येक 8 घंटे में", "timing": "After meal", "meal_time": "As needed", 
                            "duration": "3 दिन", "otc_or_rx": "OTC", "warnings": ["पेट में जलन को रोकने के लिए भोजन के साथ लें। प्रति दिन 1200mg से अधिक न लें।"]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "एक अंधेरे, शांत कमरे में आराम करें।",
                        "पर्याप्त मात्रा में पानी पीकर शरीर में तरल बनाए रखें।",
                        "अपने माथे या कनपटी पर ठंडी पट्टी लगाएं।"
                    ]
                }
            else: # Fever, general symptoms
                report = {
                    "diagnoses": [
                        {"name": "वायरल ऊपरी श्वसन पथ संक्रमण", "explanation": "नाक और ग्रसनी के मार्ग का सामान्य वायरल संक्रमण जो बुखार और गले में खराश पैदा करता है।", "likelihood": "High"},
                        {"name": "तीव्र ब्रोंकाइटिस (Acute Bronchitis)", "explanation": "श्वसन नलियों में अस्थायी सूजन, आमतौर पर वायरल, जिसके कारण खांसी होती है।", "likelihood": "Moderate"}
                    ],
                    "urgency": {
                        "level": "Moderate",
                        "reasoning": "लक्षण एक सामान्य वायरल बुखार के संकेत दे रहे हैं। घर पर आराम करें और लक्षणों पर नजर रखें।",
                        "recommended_specialist": "सामान्य चिकित्सक (General Practitioner) / फेफड़ों के रोग विशेषज्ञ (Pulmonologist)"
                    },
                    "suggested_medications": [
                        {
                            "name": "Paracetamol", "generic_name": "Acetaminophen", "dosage": "500mg", 
                            "frequency": "दिन में तीन बार", "timing": "After meal", "meal_time": "Morning/Afternoon/Night", 
                            "duration": "5 दिन", "otc_or_rx": "OTC", "warnings": ["अनुशंसित खुराक से अधिक न लें। लीवर की सुरक्षा का ध्यान रखें।"]
                        }
                    ],
                    "drug_interactions": [],
                    "allergy_flags": [],
                    "general_advice": [
                        "पर्याप्त आराम करें और खूब पानी या तरल पदार्थ पिएं।",
                        "गले की खराश के लिए गुनगुने पानी में नमक डालकर गरारे करें।",
                        "यदि बुखार 3 दिनों से अधिक समय तक बना रहता है तो चिकित्सक से परामर्श लें।"
                    ]
                }
                
            # Inject interactive drug interaction warning if they entered Aspirin and we suggested Ibuprofen/Aspirin
            if has_aspirin_med:
                report["drug_interactions"].append({
                    "drug_a": "Aspirin (वर्तमान)",
                    "drug_b": "Ibuprofen (सुझाई गई)",
                    "severity": "Moderate",
                    "description": "एस्पिरिन को इबुप्रोफेन जैसे अन्य एनएसएआईडी (NSAIDs) के साथ मिलाने से पेट में रक्तस्राव और अल्सर का खतरा बढ़ जाता है।"
                })
            
            # Inject interactive allergy warning if they reported allergy to NSAIDs
            if has_nsaid_allergy:
                suggested_drug = report["suggested_medications"][0]["name"]
                report["allergy_flags"].append({
                    "drug": suggested_drug,
                    "allergen": "NSAIDs / एस्पिरिन",
                    "description": f"रोगी ने एनएसएआईडी/एस्पिरिन से एलर्जी होने की सूचना दी, जो सुझाई गई दवा {suggested_drug} के साथ मेल नहीं खाती। इस दवा का सेवन न करें।"
                })
                
            return report

    def generate_report(self, request_data: ReportRequest) -> dict:
        is_emergency = check_emergency_override(request_data.symptoms)
        
        # Check for mock fallback mode
        if self._is_mock_mode():
            logger.info("Serving high-fidelity mock clinical report.")
            mock_report = self._generate_mock_report(request_data)
            
            # Post-processing override: Ensure emergency symptoms map strictly to Emergency status
            if is_emergency:
                logger.info("Emergency clinical override activated in mock mode. Forcing 'Emergency' level.")
                if request_data.language == "hi":
                    mock_report["urgency"] = EMERGENCY_OVERRIDE_HI
                else:
                    mock_report["urgency"] = EMERGENCY_OVERRIDE_EN
            return mock_report

        client = Groq(api_key=self.api_key)
        
        system_prompt = SYSTEM_PROMPT
        user_prompt = build_user_prompt(request_data)
        
        # Enforce Emergency directive in the prompt if emergency symptoms are detected
        if is_emergency:
            emergency_addendum = "\n\nCRITICAL DIRECTIVE: The patient has reported life-threatening symptoms. You MUST assign the urgency level to 'Emergency' and recommend immediate emergency department/ER care."
            user_prompt += emergency_addendum
            
        logger.info(f"Calling Groq API (llama-3.3-70b-versatile) for symptoms: {request_data.symptoms}")
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.2,  # Low temperature for highly deterministic, clinical outputs
                max_tokens=2048,  # Hard limit as requested
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            logger.info("Successfully received response from Groq API.")
            
            # Parse the response text robustly
            report_dict = parse_json_robustly(response_text)
            
            # Post-processing override: Ensure emergency symptoms map strictly to Emergency status
            if is_emergency:
                logger.info("Emergency clinical override activated. Forcing 'Emergency' level.")
                if request_data.language == "hi":
                    report_dict["urgency"] = EMERGENCY_OVERRIDE_HI
                else:
                    report_dict["urgency"] = EMERGENCY_OVERRIDE_EN
            
            return report_dict
            
        except Exception as e:
            logger.error(f"Error calling Groq API or parsing response: {str(e)}")
            # Raise exception so the controller returns a clean 500 error
            raise e
