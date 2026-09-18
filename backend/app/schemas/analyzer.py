from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

class PolicyAnalysisBase(BaseModel):
    social_impact: float
    economic_impact: float
    environmental_impact: float
    implementation_impact: float
    overall_impact_score: float

    financial_risk: float
    implementation_risk: float
    social_risk: float
    environmental_risk: float
    governance_risk: float
    overall_risk_score: float

    risk_classification: str
    explanations: Dict[str, str]
    recommendations: List[str]

    benefits: List[str] = []
    potential_risks: List[str] = []
    implementation_complexity: str = ""
    similar_policies: List[Dict] = []

class PolicyAnalysisResponse(PolicyAnalysisBase):
    id: int
    policy_id: int
    created_at: datetime

    class Config:
        from_attributes = True
