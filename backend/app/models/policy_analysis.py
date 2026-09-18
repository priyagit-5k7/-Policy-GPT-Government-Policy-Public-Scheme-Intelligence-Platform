from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class PolicyAnalysis(Base):
    __tablename__ = "policy_analyses"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id"), unique=True, nullable=False)
    
    social_impact = Column(Float, nullable=False)
    economic_impact = Column(Float, nullable=False)
    environmental_impact = Column(Float, nullable=False)
    implementation_impact = Column(Float, nullable=False)
    overall_impact_score = Column(Float, nullable=False)

    financial_risk = Column(Float, nullable=False)
    implementation_risk = Column(Float, nullable=False)
    social_risk = Column(Float, nullable=False)
    environmental_risk = Column(Float, nullable=False)
    governance_risk = Column(Float, nullable=False)
    overall_risk_score = Column(Float, nullable=False)
    
    risk_classification = Column(String(50), nullable=False) # Low, Medium, High
    
    explanations = Column(JSON, nullable=False) 
    recommendations = Column(JSON, nullable=False)
    
    benefits = Column(JSON, nullable=True)
    potential_risks = Column(JSON, nullable=True)
    implementation_complexity = Column(String(50), nullable=True)
    similar_policies = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    policy = relationship("Policy", foreign_keys=[policy_id])
