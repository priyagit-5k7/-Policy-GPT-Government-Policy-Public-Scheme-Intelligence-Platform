from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.auth.security import get_current_user
from app.models.user import User
from app.schemas.analyzer import PolicyAnalysisResponse
from app.services.analyzer_service import analyze_policy_service

router = APIRouter(
    prefix="/analyzer",
    tags=["Analyzer"]
)

@router.post("/{policy_id}", response_model=PolicyAnalysisResponse)
@router.get("/{policy_id}", response_model=PolicyAnalysisResponse)
def get_policy_analysis(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = current_user.role.upper()
    # Citizens get 403 Forbidden
    if role not in ["ADMINISTRATOR", "GOVERNMENT_OFFICIAL"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and government officials can access the AI Analyzer."
        )
        
    return analyze_policy_service(db, policy_id)
