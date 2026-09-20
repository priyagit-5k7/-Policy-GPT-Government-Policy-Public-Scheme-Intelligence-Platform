# PolicyGPT: Government Policy & Public Scheme Intelligence Platform

## Overview
PolicyGPT is an intelligent, full-stack centralized web application designed to help citizens, government officials, researchers, and administrators discover, manage, and understand government policies and public welfare schemes. With role-based dashboards, powerful search filtering, and eligibility matching, PolicyGPT creates an accessible, transparent, and data-driven ecosystem for public initiatives.

## Key Features
- **Intelligent Discovery:** Quickly find policies and schemes through keyword search and advanced filters.
- **Eligibility Checker:** Automatically evaluates citizen profiles against scheme criteria to recommend eligible benefits.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Citizens, Government Officials, Administrators, and Researchers.
- **Policy Comparison:** Compare multiple schemes side-by-side (benefits, eligibility, processes).
- **Analytics & Usage Dashboard:** Real-time metrics and usage statistics mapped to specific departments.
- **Push Notifications:** In-app alerts for status changes, newly published policies, and system updates.
- **Secure Authentication:** JWT-based protection, optimized password hashing, and endpoint security.

## Technology Stack
- **Frontend:** Angular 18 (TypeScript, Material/Tailwind UI elements)
- **Backend:** FastAPI (Python 3.10)
- **Database:** PostgreSQL 15
- **Deployment:** Docker & Docker Compose (Containerized Architecture, NGINX)

---

## Local Development & Docker Deployment

The platform is fully containerized for seamless cross-platform deployment.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Configuration
The `.env` file should be located at the root of the project with the following required database secrets:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=policygpt_db
```

### Running the Application (End-to-End)

1. **Build the Containers:**
   ```bash
   docker compose build
   ```

2. **Start the Platform:**
   ```bash
   docker compose up -d
   ```
   *This single command starts the PostgreSQL database, FastAPI backend (auto-runs migrations & seeds the DB), and the Angular frontend.*

3. **Verify running containers:**
   ```bash
   docker compose ps
   ```

### Accessing the Platform

- **Frontend (Angular Web UI):** [http://localhost:4200](http://localhost:4200)
- **Backend (FastAPI Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database:** Exposed on `localhost:5432`

---

## Seed Data & Roles

Upon the first system boot, the backend automatically seeds essential policies, schemes, and user roles into the database. You can instantly log in using these preset development accounts:

- **Main Administrator:** `admin@policygpt.gov.in` (Password: `Password123`)
- **Government Official:** `official@policygpt.gov.in` (Password: `Password123`)
- **Citizen User:** `citizen@policygpt.gov.in` (Password: `Password123`)
- **Policy Researcher:** `researcher@policygpt.gov.in` (Password: `Password123`)

## Important Project Guidelines

- **Authentication:** All backend operations mutating state are strictly JWT protected. Always pass the `Authorization: Bearer <token>` when using external HTTP clients.
- **Milestone Completeness:** This repository contains the finalized feature implementations for Milestones 1 through 4 (Auth, Policy Workflows, Analytics, and Docker Containerization).


## Deployment & Production Configurations
The application has been overhauled for production readiness matching **M1-M4 final specifications**:
- Reverse Proxy: NGINX natively handles all traffic through a centralized `/api` conduit to avoid CORS limitations.
- Containers: `docker-compose.yml` mounts resilient `postgres_data` persistent volumes.
- Cloud Target Deployments: For comprehensive cloud deployment steps (OCI/AWS/Azure), refer to the auto-generated `deploy_guide.md` documentation artifact located in the artifact registry mapping.

