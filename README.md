# PolicyGPT: Government Policy & Public Scheme Intelligence Platform

> **Note:** This project was developed as a team project for the **Infosys Springboard** internship program. This repository serves as my individual software engineering portfolio. Please see the **My Individual Contributions** section below for details on exactly what I engineered within the platform.

## 1. Project Title
PolicyGPT - Government Policy & Public Scheme Intelligence Platform

## 2. Project Overview
PolicyGPT is an intelligent, full-stack centralized web application designed to help citizens, government officials, researchers, and administrators discover, manage, and understand government policies and public welfare schemes. With role-based dashboards, powerful search filtering, and eligibility matching, PolicyGPT creates an accessible, transparent, and data-driven ecosystem for public initiatives.

## 3. Problem Statement
Navigating government policies and public welfare schemes is often complicated, bureaucratic, and fragmented. Citizens struggle to verify which schemes they are eligible for, while government officials lack an efficient, centralized platform for policy creation, approval, and usage analytics. PolicyGPT solves this by orchestrating a unified platform combining secure workflows, analytics, and an explainable AI-based policy impact & risk analyzer.

## 4. Key Features
- **Intelligent Discovery:** Quickly find policies and schemes through keyword search and advanced filters.
- **Eligibility Checker:** Automatically evaluates citizen profiles against scheme criteria to recommend eligible benefits.
- **AI Policy Impact & Risk Analyzer:** Explainable NLP-based evaluation of policy effectiveness, implementation complexity, and associated risks.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Citizens, Government Officials, Administrators, and Researchers.
- **Policy Approval Workflow:** Hierarchical policy drafting, reviewing, and approval modules.
- **Analytics & Usage Dashboard:** Real-time metrics and usage statistics mapped to specific departments.
- **Push Notifications:** In-app alerts for status changes, newly published policies, and system updates.
- **Policy Comparison:** Compare multiple schemes side-by-side (benefits, eligibility, processes).
- **Secure Authentication:** JWT-based protection, optimized password hashing, and endpoint security.

## 5. System Architecture
**Client-Server Architecture Containerized via Docker:**
- The frontend (Angular) is served and reverse-proxied by **NGINX**.
- The backend API receives requests from NGINX without CORS limitations, operating via **FastAPI**.
- The backend communicates with a persistent **PostgreSQL** relational database.

## 6. Technology Stack
- **Frontend:** Angular 18 (TypeScript, Angular Material)
- **Backend:** FastAPI (Python 3.10), spaCy / sentence-transformers (for NLP AI Analysis)
- **Database:** PostgreSQL 15 (SQLAlchemy ORM, Alembic migrations)
- **Deployment:** Docker & Docker Compose (Containerized Architecture, NGINX)

## 7. User Roles
- **Citizen:** Can browse policies, use eligibility checking, and apply.
- **Government Official:** Can draft new policies, review approvals, and monitor usage analytics.
- **Policy Researcher:** Can access analytical data, usage metrics, and the AI impact analyzer.
- **Administrator:** Full platform control, RBAC enforcement, system logs.

## 8. Main Workflow
1. User authenticates via JWT and is routed to their RBAC dashboard.
2. Official drafts a policy -> Admin reviews and approves it.
3. Citizen logs in, uses the Eligibility Checker to match their profile against active policies, and applies.
4. Researcher utilizes the AI Analyzer to read the policy text and generate risk/complexity scores.
5. Department officials monitor policy adoption rates on the Analytics Dashboard.

## 9. My Individual Contribution (PriyaDharshini R)
As part of the Infosys Springboard team, the majority of the core architecture and infrastructure implementation was my direct contribution. My specific engineered features and commits include:
- **Core Platform Architecture (Milestone 1):** Built the backend foundation in FastAPI, initialized the Angular frontend with Material UI, and implemented secure JWT authentication with strict Role-Based Access Control (RBAC).
- **Policy Approval Workflows (Milestone 2):** Developed the interactive policy creation, review, and approval modules. Solved CORS configurations for dynamic local environments.
- **Analytics & Platform Insight (Milestone 3):** Engineered the department analytics dashboard, usage statistics interfaces, and the push notifications system.
- **Production DevOps (Milestone 4):** Finalized the production-ready Docker deployment network including NGINX reverse-proxying, volume mapping, environmental protection, and solving Python 3.10 asynchronous limitations for deployment (Railway server configuration).
- **Explainable AI Integration:** Independently engineered and integrated the **AI Policy Impact & Risk Analyzer** using `spaCy` and `sentence-transformers` for zero-shot text evaluation.

**(Note: Other team members contributed to complementary platform features including the Feedback and Reporting modules, additional database schemas, and UX testing).*

## 10. Docker/Deployment Information
The platform is fully containerized for seamless cross-platform deployment. It uses a multi-container Docker Compose pipeline mimicking production routing via NGINX. 

## 11. How to run the project
### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.

### Environment Configuration
The `.env` file should be located at the root of the project. Do not commit actual passwords.
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=policygpt_db
JWT_SECRET=your_jwt_secret_key
```

### Running the Application (End-to-End)
1. **Start the Platform:**
   ```bash
   docker compose up --build -d
   ```
   *This command starts the PostgreSQL database, FastAPI backend (auto-runs migrations & seeds the DB), and the Angular frontend.*

2. **Accessing the Platform:**
   - **Frontend (Angular Web UI):** [http://localhost:4200](http://localhost:4200) (or via NGINX proxy port if configured)
   - **Backend (FastAPI Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Database:** Exposed on `localhost:5432`

Upon the first boot, the platform automatically seeds test accounts. Reference the source code or Swagger interface for default credentials.

## 12. License
This portfolio version is made available under the MIT License included in this repository.
