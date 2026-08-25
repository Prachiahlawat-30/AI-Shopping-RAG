# Production Deployment Guide: AI Multimodal Shopping RAG

This document outlines step-by-step instructions to deploy the AI Multimodal Shopping RAG platform into production environments.

---

## 1. Quickstart with Docker Compose (Recommended)

The easiest way to run the full stack (PostgreSQL, Qdrant, FastAPI Backend, React Frontend Nginx) is via Docker Compose.

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/Prachiahlawat-30/AI-Shopping-RAG.git
cd AI-Shopping-RAG

# Copy environment template
cp .env.example .env
```

Edit `.env` with your credentials:
```ini
OPENAI_API_KEY=sk-proj-your-actual-openai-key
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=shopping_rag
CLERK_JWKS_URL=https://api.clerk.dev/v1/jwks
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
```

### Step 2: Build & Start Services

```bash
docker-compose up -d --build
```

Verify service health:
```bash
docker-compose ps
```

| Service | Port | Healthcheck |
|---|---|---|
| Frontend (Nginx SPA) | `http://localhost:80` | `200 OK` |
| Backend (FastAPI) | `http://localhost:8000` | `http://localhost:8000/health` |
| Vector DB (Qdrant) | `http://localhost:6333` | `http://localhost:6333/dashboard` |
| Database (PostgreSQL) | `localhost:5432` | `pg_isready` |

---

## 2. Cloud Deployment Options

### A. Deploying on Render / Railway / Fly.io

1. **Database:** Provision a managed PostgreSQL instance and Qdrant Cloud cluster.
2. **Backend Service:**
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Set environment variables (`OPENAI_API_KEY`, `DATABASE_URL`, `QDRANT_URL`, `CLERK_JWKS_URL`, `FRONTEND_URL`).
3. **Frontend Service (Vercel / Netlify):**
   - Framework preset: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`.

### B. Deploying on Kubernetes (K8s)

1. Create ConfigMaps and Secrets for OpenAI and Clerk keys.
2. Deploy PostgreSQL and Qdrant using Helm charts (`bitnami/postgresql` and `qdrant/qdrant`).
3. Deploy Backend Deployment with 2+ replicas behind an Ingress controller with `/health` liveness/readiness probes.
4. Deploy Frontend Deployment using the provided `frontend/Dockerfile`.

---

## 3. Continuous Integration & Testing

Every commit and pull request runs automated tests via GitHub Actions (`.github/workflows/ci.yml`):
- Backend linting and unit/integration tests with `pytest`
- Frontend TypeScript typechecking and production build with `vite`
