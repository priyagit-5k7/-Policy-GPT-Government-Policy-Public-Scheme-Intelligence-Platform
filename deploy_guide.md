# POLICYGPT PRODUCTION DEPLOYMENT GUIDE

## 1. Architecture
- NGINX proxying frontend static assets natively and backend routes via `/api/`.
- FastAPI stateless backend container.
- PostgreSQL 15 database container mounting persistent block storage.

## 2. Server requirements
- Linux OS (Ubuntu 22.04 / Debian 12 / OCI Linux).
- Minimum 2GB RAM (4GB Recommended).
- Sudo/Root access required for initial runtime setup.

## 3. Docker installation
`sudo apt update && sudo apt install docker.io docker-compose-v2 -y`

## 4. Repository setup
`git clone <repository_url>`
`cd Team2-PolicyGPT-`

## 5. Environment configuration
Copy `.env.example` to `.env` and fill the variables safely offline. 
`cp .env.example .env && nano .env`

## 6. Database configuration
The database handles initialization naturally alongside FastAPI loops automatically generating required schemas. No explicit ALMEBIC manual runs required. Configure `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` globally in the `.env` file before executing builds.

## 7. Build
`docker compose build`

## 8. Start
`docker compose up -d`

## 9. Health checks
Execute `docker compose ps` to verify all `Up (healthy)`. Use backend internal health endpoints via NGINX via `curl http://SERVER_IP/api/`.

## 10. Firewall
Restrict firewall inbound explicitly natively exposing exclusively:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 22 (SSH)
Keep 5432 and 8000 implicitly closed externally relying strictly on docker bridging natively.

## 11. NGINX
Operates on the `frontend` container natively serving Angular assets across `/` and forwarding `/api/*` to `backend:8000/`.

## 12. Domain
Map external DNS A-records towards the public elastic IP address assigned to the host cloud instance mapping properly enabling external web access mapping efficiently.

## 13. HTTPS
After mapping Domain A-Records reliably enable SSL natively:
`sudo apt install certbot -y && sudo certbot certonly --standalone -d yourdomain.com`

## 14. Backup
Dump database natively mapping host instances:
`docker exec -t policygpt_db pg_dump -U postgres -d policygpt_db -F c > backup.dump`

## 15. Update
`git pull origin feature/ai-policy-impact-analyzer`
`docker compose up -d --build`

## 16. Troubleshooting
`docker compose logs frontend`
`docker compose logs backend`

## 17. Rollback considerations
Revert to prior stable GIT SHASUM checking out the specific commit hash explicitly executing container rebuilds manually securely preventing unstable integrations natively bridging environments effectively.
