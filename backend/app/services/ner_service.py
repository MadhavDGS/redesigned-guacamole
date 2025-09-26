"""
Named Entity Recognition Service
FRA Atlas - AI-powered Forest Rights Act Atlas and Decision Support System
"""

import logging
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)


class NERService:
    """NER service for extracting entities from FRA documents"""
    
    def __init__(self):
        self.entity_patterns = {
            "claimant_name": r"(?:Claimant Name|Name):\s*([A-Za-z\s]+)",
            "village": r"(?:Village):\s*([A-Za-z\s]+)",
            "district": r"(?:District):\s*([A-Za-z\s]+)",
            "state": r"(?:State):\s*([A-Za-z\s]+)",
            "survey_number": r"(?:Survey Number):\s*([\d/]+)",
            "area": r"(?:Area):\s*([\d.]+)\s*acres",
            "coordinates": r"([\d.]+°\s*[NS])[,\s]+([\d.]+°\s*[EW])",
            "certificate_number": r"(?:Certificate Number):\s*([A-Za-z0-9/]+)",
            "recognition_date": r"(?:Date of Recognition):\s*([\d-]+)"
        }
    
    async def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities from OCR text"""
        entities = {}
        confidence_scores = {}
        
        for entity_type, pattern in self.entity_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                entities[entity_type] = match.group(1).strip()
                confidence_scores[entity_type] = 0.85  # Mock confidence
        
        return {
            **entities,
            "confidence_scores": confidence_scores
        }