from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.database import engine
from app.database.base import Base

# Import all models so SQLAlchemy creates the tables
from app.models.user import User
from app.models.policy import Policy
from app.models.scheme import Scheme
from app.models.eligibility_rule import EligibilityRule
from app.models.notification import Notification
from app.models.feedback import Feedback
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.models.search_history import SearchHistory
from app.models.policy_analysis import PolicyAnalysis

# Import routers
from app.routers.auth import router as auth_router
from app.routers.policy import router as policy_router
from app.routers.scheme import router as scheme_router
from app.routers.feedback import router as feedback_router
from app.routers.notification import router as notification_router
from app.routers.report import router as report_router
from app.routers.analytics import router as analytics_router
from app.routers.analyzer import router as analyzer_router

# Create all database tables
Base.metadata.create_all(bind=engine)

# Dynamically apply table schema modifications if table already exists (for PostgreSQL compatibility)
def run_migrations():
    from sqlalchemy import text
    statements = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'citizen';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);",
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS review_comment TEXT;",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity VARCHAR(50);",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id INTEGER;",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_status VARCHAR;",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_status VARCHAR;",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS comment TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating INTEGER;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS message TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS subject VARCHAR;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS content TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS comments TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS title VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_by VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_path VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_url VARCHAR;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS content TEXT;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS summary TEXT;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_by INTEGER;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP;",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS policy_id INTEGER REFERENCES policies(id);",
        "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE notifications ALTER COLUMN title DROP NOT NULL;",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message TEXT;",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type VARCHAR(50);",
        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS eligibility_criteria TEXT;",
        "ALTER TABLE schemes ADD COLUMN IF NOT EXISTS benefits TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS message TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS subject VARCHAR(255);",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS content TEXT;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS comments TEXT;",
        "ALTER TABLE feedback ALTER COLUMN comments DROP NOT NULL;",
        "ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Open';",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS report_type VARCHAR(100);",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS generated_by VARCHAR(100);",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_path VARCHAR(255);",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS file_url VARCHAR(255);",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS title VARCHAR(255);",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS content TEXT;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS summary TEXT;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_by INTEGER;",
        "ALTER TABLE reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE policy_analyses ADD COLUMN IF NOT EXISTS benefits TEXT;",
        "ALTER TABLE policy_analyses ADD COLUMN IF NOT EXISTS potential_risks TEXT;",
        "ALTER TABLE policy_analyses ADD COLUMN IF NOT EXISTS implementation_complexity VARCHAR(50);",
        "ALTER TABLE policy_analyses ADD COLUMN IF NOT EXISTS similar_policies TEXT;"
    ]
    try:
        with engine.connect() as conn:
            for stmt in statements:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception:
                    pass

            # Seed developer test users if they don't exist
            from app.database.database import SessionLocal
            from app.models.user import User
            from app.models.policy import Policy
            from app.models.scheme import Scheme
            from app.models.notification import Notification
            from app.auth.security import hash_password
            
            db = SessionLocal()
            try:
                seed_users = [
                    {"email": "official@policygpt.gov.in", "password": "Password123", "full_name": "Official Administrator", "role": "government_official"},
                    {"email": "admin@policygpt.gov.in", "password": "Password123", "full_name": "Main Administrator", "role": "administrator"},
                    {"email": "citizen@policygpt.gov.in", "password": "Password123", "full_name": "Citizen User", "role": "citizen"},
                    {"email": "researcher@policygpt.gov.in", "password": "Password123", "full_name": "Senior Policy Researcher", "role": "researcher"}
                ]
                for su in seed_users:
                    exists = db.query(User).filter(User.email == su["email"]).first()
                    if not exists:
                        user = User(
                            email=su["email"],
                            password=hash_password(su["password"]),
                            full_name=su["full_name"],
                            role=su["role"]
                        )
                        db.add(user)
                        db.commit()
                        print(f"Seeded user: {su['email']}")

                admin_user = db.query(User).filter(User.role == "administrator").first()
                official_user = db.query(User).filter(User.role == "government_official").first()
                admin_id = admin_user.id if admin_user else 1
                official_id = official_user.id if official_user else 1

                # Seed sample Policies if empty
                if db.query(Policy).count() == 0:
                    sample_policies = [
                        Policy(
                            title="PM Ayushman Bharat Digital Health Mission",
                            description="National digital health ecosystem providing universal health identification and health insurance coverage up to Rs 5 Lakh per family.",
                            category="Healthcare",
                            department="Ministry of Health and Family Welfare",
                            state="All India",
                            status="PUBLISHED",
                            created_by=official_id,
                            reviewed_by=admin_id
                        ),
                        Policy(
                            title="National Education Policy (NEP) 2026 Skill Initiative",
                            description="Comprehensive educational policy reform introducing vocational training, digital literacy, and universal higher education access.",
                            category="Education",
                            department="Ministry of Education",
                            state="All India",
                            status="PUBLISHED",
                            created_by=official_id,
                            reviewed_by=admin_id
                        ),
                        Policy(
                            title="PM Kisan Samman Nidhi Direct Transfer Scheme",
                            description="Direct income support of Rs 6,000 per year to small and marginal farmer families across the country.",
                            category="Agriculture",
                            department="Ministry of Agriculture & Farmers Welfare",
                            state="All India",
                            status="PUBLISHED",
                            created_by=official_id,
                            reviewed_by=admin_id
                        ),
                        Policy(
                            title="Green Solar Rooftop Subsidy Initiative",
                            description="Financial assistance and 40% subsidy for residential solar rooftop installations promoting renewable clean energy.",
                            category="Environment & Energy",
                            department="Ministry of New and Renewable Energy",
                            state="All India",
                            status="PENDING_APPROVAL",
                            created_by=official_id
                        ),
                        Policy(
                            title="Digital India Startup Empowerment Fund",
                            description="Grant and seed capital support for technology startups building public good solutions in AI, FinTech, and AgriTech.",
                            category="IT & Electronics",
                            department="Ministry of Electronics and Information Technology",
                            state="All India",
                            status="DRAFT",
                            created_by=official_id
                        )
                    ]
                    db.add_all(sample_policies)
                    db.commit()
                    print("Seeded initial policies successfully.")

                # Seed sample Schemes if empty
                if db.query(Scheme).count() == 0:
                    sample_schemes = [
                        Scheme(
                            title="Pradhan Mantri Jan Dhan Yojana (PMJDY)",
                            description="National Mission for Financial Inclusion ensuring access to financial services like Bank Accounts, Credit, Insurance & Pension.",
                            category="Financial Inclusion",
                            eligibility_criteria="Resident of India, Age 18-65 years, Valid Aadhaar Card.",
                            benefits="Zero balance account, Rs 2 Lakh accidental insurance cover, RuPay Debit Card.",
                            status="Active"
                        ),
                        Scheme(
                            title="Pradhan Mantri Awas Yojana (PMAY-Urban)",
                            description="Housing for All initiative providing interest subsidy and financial assistance for pucca house construction.",
                            category="Housing",
                            eligibility_criteria="Economically Weaker Section (EWS) / LIG families with annual income under Rs 6 Lakh.",
                            benefits="Interest subsidy up to 6.5% on home loans up to Rs 6 Lakh for 20 years.",
                            status="Active"
                        ),
                        Scheme(
                            title="PM Employment Generation Programme (PMEGP)",
                            description="Credit-linked subsidy programme to generate self-employment opportunities through micro-enterprise establishment.",
                            category="Employment & Entrepreneurship",
                            eligibility_criteria="Any individual above 18 years of age, minimum VIII standard pass for projects above Rs 10 Lakh.",
                            benefits="Subsidy up to 35% of project cost for rural micro-enterprises.",
                            status="Active"
                        )
                    ]
                    db.add_all(sample_schemes)
                    db.commit()
                    print("Seeded initial schemes successfully.")

                # Seed sample Notifications if empty
                if db.query(Notification).count() == 0:
                    sample_notifs = [
                        Notification(user_id=official_id, message="Policy 'PM Ayushman Bharat Digital Health Mission' has been APPROVED and PUBLISHED.", type="POLICY_PUBLISHED"),
                        Notification(user_id=official_id, message="Policy 'Green Solar Rooftop Subsidy Initiative' submitted for PENDING_APPROVAL review.", type="POLICY_SUBMITTED"),
                        Notification(user_id=admin_id, message="Welcome to PolicyGPT. You have 1 pending policy requiring approval review.", type="SYSTEM")
                    ]
                    db.add_all(sample_notifs)
                    db.commit()
                    print("Seeded initial notifications successfully.")

            except Exception as se:
                print(f"Seeding error: {se}")
            finally:
                db.close()

            print("Database self-healing schema migration ran successfully.")
    except Exception as e:
        print(f"Migration error: {e}")

run_migrations()


app = FastAPI(
    title="PolicyGPT API",
    description="Government Policy & Public Scheme Intelligence Platform",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS — allow Angular dev server (port 4200) to call the API (port 8000)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200", 
        "http://localhost:58609",
        "http://127.0.0.1:4200", 
        "http://localhost:8000", 
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(policy_router, prefix="/policies", tags=["Policies"])
app.include_router(scheme_router, prefix="/schemes", tags=["Government Schemes"])
app.include_router(feedback_router)
app.include_router(notification_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(analyzer_router)

@app.get("/", tags=["Health"])
def home():
    """Health check — verifies database connectivity."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"message": "PolicyGPT API is running. Database connected successfully!"}
    except Exception as e:
        return {"error": str(e)}