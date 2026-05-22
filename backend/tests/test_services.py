import unittest
from pydantic import ValidationError
from backend.models.schemas import ReportRequest
from backend.services.groq_service import check_emergency_override, parse_json_robustly, GroqService

class TestMedAssistServices(unittest.TestCase):
    def test_emergency_override_detection(self):
        # 1. English critical combination
        self.assertTrue(check_emergency_override(["Chest pain", "Shortness of breath"]))
        self.assertTrue(check_emergency_override(["persistent chest pain", "breathlessness"]))
        
        # 2. Hindi critical combination
        self.assertTrue(check_emergency_override(["सीने में दर्द", "सांस फूलना"]))
        self.assertTrue(check_emergency_override(["छाती में दर्द", "सांस की तकलीफ"]))
        
        # 3. Stroke signs
        self.assertTrue(check_emergency_override(["face drooping", "slurred speech"]))
        self.assertTrue(check_emergency_override(["नम्बनेस", "लकवा"]))
        
        # 4. Severe bleeding or unconsciousness
        self.assertTrue(check_emergency_override(["severe bleeding from deep cut"]))
        self.assertTrue(check_emergency_override(["बेहोशी", "low heart rate"]))
        
        # 5. Non-emergency combinations
        self.assertFalse(check_emergency_override(["Mild headache", "Runny nose"]))
        self.assertFalse(check_emergency_override(["Dry cough", "Slight fever"]))

    def test_robust_json_parsing(self):
        # Standard clean JSON
        clean_json = '{"a": 1, "b": "test"}'
        self.assertEqual(parse_json_robustly(clean_json), {"a": 1, "b": "test"})
        
        # JSON embedded in Markdown blocks
        markdown_json = '```json\n{"name": "test_app", "urgency": "low"}\n```'
        self.assertEqual(parse_json_robustly(markdown_json), {"name": "test_app", "urgency": "low"})
        
        # JSON with extra text padding before/after
        padded_json = 'Here is the report in JSON format:\n{\n  "diagnoses": []\n}\nHope this helps!'
        self.assertEqual(parse_json_robustly(padded_json), {"diagnoses": []})
        
        # Invalid JSON should raise ValueError
        with self.assertRaises(ValueError):
            parse_json_robustly('{"invalid": json')

    def test_report_request_validation(self):
        # Valid Request
        valid_payload = {
            "symptoms": ["Headache"],
            "age": 30,
            "sex": "Male",
            "language": "en"
        }
        req = ReportRequest(**valid_payload)
        self.assertEqual(req.symptoms, ["Headache"])
        self.assertEqual(req.age, 30)
        self.assertIsNone(req.name)
        
        # Valid Request with name
        payload_with_name = {
            "name": "Jane Doe",
            "symptoms": ["Headache"],
            "age": 30,
            "sex": "Female",
            "language": "en"
        }
        req_name = ReportRequest(**payload_with_name)
        self.assertEqual(req_name.name, "Jane Doe")
        self.assertEqual(req_name.symptoms, ["Headache"])
        
        # Age constraint failure
        with self.assertRaises(ValidationError):
            ReportRequest(symptoms=["Headache"], age=130)
            
        with self.assertRaises(ValidationError):
            ReportRequest(symptoms=["Headache"], age=-5)

        # Empty symptoms failure
        with self.assertRaises(ValidationError):
            ReportRequest(symptoms=[], age=25)
            
        # Unsupported language failure
        with self.assertRaises(ValidationError):
            ReportRequest(symptoms=["Headache"], language="fr")

    def test_mock_report_generation(self):
        service = GroqService()
        
        # Test robust placeholder API key detection
        original_key = service.api_key
        try:
            service.api_key = "your_groq_api_key_here"
            self.assertTrue(service._is_mock_mode())
            service.api_key = "placeholder_key"
            self.assertTrue(service._is_mock_mode())
            service.api_key = ""
            self.assertTrue(service._is_mock_mode())
            service.api_key = None
            self.assertTrue(service._is_mock_mode())
            service.api_key = "gsk_valid_key_format"
            self.assertFalse(service._is_mock_mode())
        finally:
            service.api_key = original_key
        
        # 1. Normal Fever/Cough English Mock
        req_normal = ReportRequest(
            symptoms=["Fever", "Cough"],
            age=25,
            sex="Male",
            language="en"
        )
        report_normal = service.generate_report(req_normal)
        self.assertIn("Viral Upper Respiratory Tract Infection", [d["name"] for d in report_normal["diagnoses"]])
        self.assertEqual(report_normal["urgency"]["level"], "Moderate")
        
        # 2. Emergency English Mock with Chest Pain + Breathlessness
        req_emergency = ReportRequest(
            symptoms=["Chest pain", "Shortness of breath"],
            age=60,
            sex="Female",
            language="en"
        )
        report_emergency = service.generate_report(req_emergency)
        self.assertEqual(report_emergency["urgency"]["level"], "Emergency")
        
        # 3. Interactive Drug Interaction (Aspirin medication entered)
        req_aspirin = ReportRequest(
            symptoms=["Headache"],
            medications=["Aspirin 81mg"],
            age=45,
            sex="Male",
            language="en"
        )
        report_aspirin = service.generate_report(req_aspirin)
        self.assertTrue(len(report_aspirin["drug_interactions"]) > 0)
        self.assertEqual(report_aspirin["drug_interactions"][0]["drug_a"], "Aspirin (Current)")
        
        # 4. Allergy Flags (NSAID allergy reported)
        req_allergy = ReportRequest(
            symptoms=["Headache"],
            allergies="Severe allergy to NSAIDs",
            age=32,
            sex="Female",
            language="en"
        )
        report_allergy = service.generate_report(req_allergy)
        self.assertTrue(len(report_allergy["allergy_flags"]) > 0)
        self.assertEqual(report_allergy["allergy_flags"][0]["allergen"], "NSAIDs / Aspirin")

if __name__ == '__main__':
    unittest.main()
