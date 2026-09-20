# POLICYGPT PRODUCTION DEPLOYMENT GUIDE

## 1. Architecture
- NGINX proxying frontend static assets natively and backend routes via `/api/`.
- FastAPI stateless backend container.
- PostgreSQL 15 database container mounting persistent block storage.

---

## 🚀 RAILWAY PUBLIC DEPLOYMENT (Step-by-Step)
Follow these exact instructions to deploy PolicyGPT to a public Railway.app URL:

### Step 1: Initialize Project
1. Open [Railway.app](https://railway.app/).
2. Create a new project.
3. Select **Provision PostgreSQL** to create a managed database (Railway handles data persistence automatically).

### Step 2: Deploy Backend Services
1. In your Railway project, click **New -> GitHub Repo**.
2. Select your repository and choose the `feature/ai-policy-impact-analyzer` branch.
3. Go to the new service settings -> **Root Directory**, and enter `/backend`.
4. Wait for Railway to detect the Dockerfile and build the AI environment.

### Step 3: Configure Backend Variables
In the Backend service "Variables" tab, add the following (get DB details from the PostgreSQL service):
- `DATABASE_URL`: *(Select "Reference Variable" or copy the provided POSTGRES_URL from your Railway Postgres service)*.
- `JWT_SECRET`: *(Set a strong secure string)*.

### Step 4: Configure Backend Private Networking
1. Go to the Backend service **Settings** -> **Networking**.
2. Do **NOT** generate a public domain for the backend.
3. Make sure the Service Name is exactly `backend` (so private DNS matches `backend.railway.internal`).
4. Set the **Custom Port** to `8000` (optional, Railway automates this).

### Step 5: Deploy Frontend / NGINX Service
1. In the same project, click **New -> GitHub Repo** again (same repo, same branch).
2. Go to the frontend service settings -> **Root Directory**, and enter `/frontend/policygpt-frontend`.
3. Wait for Railway to build the Angular + NGINX Dockerfile.

### Step 6: Configure Frontend Variables & Domain
1. In the Frontend service **Settings** -> **Networking**, click **Generate Domain** to create your real public URL (e.g., `policygpt-ui.up.railway.app`).
2. Go to the Frontend service "Variables" tab and add:
   - `BACKEND_URL`: `http://backend.railway.internal:8000` (This binds NGINX to the private backend).
3. Copy your generated public domain (e.g., `https://policygpt-ui.up.railway.app`).

### Step 7: Finalize CORS Protection
1. Go back to your Backend service "Variables" tab.
2. Add: `FRONTEND_URL` and paste the public domain (e.g., `https://policygpt-ui.up.railway.app`).
3. Railway will redeploy the backend with proper CORS enforcement.

### Step 8: Validate the Application
Open your public domain on any phone or PC browser.
- **Login testing:** Ensure standard users authenticate correctly.
- **RBAC:** Verify Citizen (403 limits) vs. Official/Admin (full features).
- **AI Analyzer:** Access the analyzer component to verify similarities and ML logic.

*Note: The AI dependencies require heavy computations initially loading sentence transformers, which may take ~10 seconds on cold boot.*

---

## 3. Local Docker Testing (Fallback & Regression)
Use this if running locally instead of Railway:

`git clone <repository_url>`
`cp .env.example .env && nano .env`
`docker compose build`
`docker compose up -d`
`docker compose ps`

NGINX runs locally on port 80. Backend on internal Docker bridge.
