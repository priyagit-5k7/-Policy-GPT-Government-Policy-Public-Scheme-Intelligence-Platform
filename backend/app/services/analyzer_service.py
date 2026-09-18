from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.policy import Policy
from app.models.policy_analysis import PolicyAnalysis

import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json

# Centralized Policy Scoring Weights
IMPACT_WEIGHTS = {
    "Social": 0.25,
    "Economic": 0.25,
    "Environmental": 0.25,
    "Implementation": 0.25
}

RISK_WEIGHTS = {
    "Financial": 0.20,
    "Implementation": 0.20,
    "Social": 0.20,
    "Environmental": 0.20,
    "Governance": 0.20
}

# Global models (loaded once)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If missing, fallback by importing or logging. Normally it should be downloaded.
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

embedder = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_text(text: str) -> str:
    """Preprocess text using spaCy (lemmatization and stopword removal)."""
    doc = nlp(text or "")
    tokens = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]
    return " ".join(tokens)

def analyze_text_for_score(processed_text: str, positive_keywords: list, negative_keywords: list, base_score: int = 50) -> int:
    score = base_score
    for word in positive_keywords:
        if word in processed_text:
            score += 15
    for word in negative_keywords:
        if word in processed_text:
            score -= 10
    return max(0, min(100, score))


def perform_analysis(policy: Policy, all_other_policies: list) -> dict:
    raw_corpus = f"{policy.title} {policy.description} {policy.category} {policy.department} {policy.state} {policy.status}"
    processed_text = preprocess_text(raw_corpus)
    
    # NLP heuristics using preprocessed text
    social_score = analyze_text_for_score(processed_text, ["health", "education", "welfare", "citizen", "public", "universal", "community", "samman", "inclusion", "social"], ["exclusion", "isolate"])
    economic_score = analyze_text_for_score(processed_text, ["fund", "finance", "business", "startup", "economic", "growth", "investment", "credit", "income", "employment", "economy"], ["debt", "loss", "crash"])
    env_score = analyze_text_for_score(processed_text, ["green", "solar", "renewable", "clean", "environment", "climate", "sustainable", "eco"], ["pollution", "coal", "toxic"])
    impl_impact_score = analyze_text_for_score(processed_text, ["digital", "infrastructure", "system", "tech", "national", "state", "scale", "infrastructure"], ["delay", "complex", "bureaucracy"])
    
    overall_impact = (
        social_score * IMPACT_WEIGHTS["Social"] +
        economic_score * IMPACT_WEIGHTS["Economic"] +
        env_score * IMPACT_WEIGHTS["Environmental"] +
        impl_impact_score * IMPACT_WEIGHTS["Implementation"]
    )
    
    fin_risk = analyze_text_for_score(processed_text, ["subsidy", "cost", "billion", "million", "budget", "expensive"], ["audit", "efficiency", "direct", "saving"])
    impl_risk = analyze_text_for_score(processed_text, ["complex", "multi-state", "phase", "pilot", "reform", "unprecedented"], ["digital", "automated", "streamlined", "simple"])
    soc_risk = analyze_text_for_score(processed_text, ["mandatory", "displacement", "sensitive", "minority", "protest"], ["voluntary", "inclusive", "accepted"], base_score=30)
    env_risk = analyze_text_for_score(processed_text, ["construction", "manufacturing", "mining", "industry", "deforestation"], ["green", "renewable", "protect", "conservation"], base_score=30)
    gov_risk = analyze_text_for_score(processed_text, ["compliance", "regulatory", "audit", "bureaucracy", "red-tape"], ["transparent", "monitor", "clear"], base_score=40)
    
    overall_risk = (
        fin_risk * RISK_WEIGHTS["Financial"] +
        impl_risk * RISK_WEIGHTS["Implementation"] +
        soc_risk * RISK_WEIGHTS["Social"] +
        env_risk * RISK_WEIGHTS["Environmental"] +
        gov_risk * RISK_WEIGHTS["Governance"]
    )
    
    if overall_risk <= 29:
        risk_class = "Low"
    elif overall_risk <= 59:
        risk_class = "Medium"
    else:
        risk_class = "High"
        
    explanations = {
        "Social": f"Analyzed tokens related to social outcomes in category '{policy.category}'. Found indications of public support.",
        "Economic": f"Analyzed department '{policy.department}' and description. Economic score is {economic_score}.",
        "Environmental": f"Checked preprocessed policy text for sustainability keywords. Score is {env_score}.",
        "Implementation": f"Reviewed scale '{policy.state}' and system vocabulary.",
        "Financial Risk": f"Scanned for cost/subsidy mentions in policy scope.",
        "Governance Risk": f"Assessed based on status '{policy.status}' and regulatory nature."
    }
    
    recommendations = [
        f"Monitor {risk_class.lower()} risk areas closely during the upcoming phases.",
        f"Ensure robust audit mechanisms given the Financial Risk score of {fin_risk}.",
    ]
    if overall_risk >= 60:
         recommendations.append("Consider phased rollout to mitigate high overall systemic risks.")
    if env_score >= 60:
         recommendations.append("Leverage green initiatives for additional climate funding.")

    # Dynamic benefits and potential risks
    benefits = []
    if social_score >= 50: benefits.append("Improves public health and civic welfare.")
    if economic_score >= 50: benefits.append("Stimulates economic growth and startup ecosystem.")
    if env_score >= 50: benefits.append("Promotes sustainable environmental practices.")
    if len(benefits) == 0: benefits.append("Provides foundational administrative support.")

    potential_risks = []
    if fin_risk >= 50: potential_risks.append("High financial burden and budget constraints.")
    if impl_risk >= 50: potential_risks.append("Execution delays due to multi-state complexities.")
    if gov_risk >= 50: potential_risks.append("Regulatory compliance overhead.")
    if len(potential_risks) == 0: potential_risks.append("Minor administrative friction.")

    # Implementation complexity
    if impl_risk < 30 and impl_impact_score > 60:
        impl_complexity = "Low"
    elif impl_risk < 60:
        impl_complexity = "Medium"
    else:
        impl_complexity = "High"

    # Similar policies via Sentence Transformers and Scikit-Learn Cosine Similarity
    similar_policies = []
    if all_other_policies:
        target_embedding = embedder.encode([raw_corpus])
        other_corpora = [f"{p.title} {p.description} {p.category} {p.department} {p.state} {p.status}" for p in all_other_policies]
        other_embeddings = embedder.encode(other_corpora)
        
        similarities = cosine_similarity(target_embedding, other_embeddings)[0]
        
        # Zip with policies, filter > 0.1, sort by score descending
        matches = []
        for i, p in enumerate(all_other_policies):
            score = float(similarities[i])
            if score > 0.1:  # arbitrary threshold
                matches.append({
                    "id": p.id,
                    "title": p.title,
                    "department": p.department,
                    "similarity_score": round(score * 100, 2)  # as percentage
                })
        
        # Sort and take top 3
        matches = sorted(matches, key=lambda x: x["similarity_score"], reverse=True)[:3]
        similar_policies = matches

    return {
        "social_impact": social_score,
        "economic_impact": economic_score,
        "environmental_impact": env_score,
        "implementation_impact": impl_impact_score,
        "overall_impact_score": round(overall_impact, 2),
        "financial_risk": fin_risk,
        "implementation_risk": impl_risk,
        "social_risk": soc_risk,
        "environmental_risk": env_risk,
        "governance_risk": gov_risk,
        "overall_risk_score": round(overall_risk, 2),
        "risk_classification": risk_class,
        "explanations": explanations,
        "recommendations": recommendations,
        "benefits": benefits,
        "potential_risks": potential_risks,
        "implementation_complexity": impl_complexity,
        "similar_policies": similar_policies,
    }


def analyze_policy_service(db: Session, policy_id: int):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
        
    all_other_policies = db.query(Policy).filter(Policy.id != policy_id).all()

    # Check if we already have an analysis
    analysis = db.query(PolicyAnalysis).filter(PolicyAnalysis.policy_id == policy_id).first()
    if analysis:
        # Delete old analysis to provide a fresh one, or just update. For simplicity, we drop and renew.
        db.delete(analysis)
        db.commit()
        
    analysis_data = perform_analysis(policy, all_other_policies)
    
    new_analysis = PolicyAnalysis(
        policy_id=policy.id,
        social_impact=analysis_data["social_impact"],
        economic_impact=analysis_data["economic_impact"],
        environmental_impact=analysis_data["environmental_impact"],
        implementation_impact=analysis_data["implementation_impact"],
        overall_impact_score=analysis_data["overall_impact_score"],
        financial_risk=analysis_data["financial_risk"],
        implementation_risk=analysis_data["implementation_risk"],
        social_risk=analysis_data["social_risk"],
        environmental_risk=analysis_data["environmental_risk"],
        governance_risk=analysis_data["governance_risk"],
        overall_risk_score=analysis_data["overall_risk_score"],
        risk_classification=analysis_data["risk_classification"],
        explanations=analysis_data["explanations"],
        recommendations=analysis_data["recommendations"],
        benefits=analysis_data["benefits"],
        potential_risks=analysis_data["potential_risks"],
        implementation_complexity=analysis_data["implementation_complexity"],
        similar_policies=analysis_data["similar_policies"]
    )
    
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis
