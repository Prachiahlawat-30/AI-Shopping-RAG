# AI Multimodal Shopping RAG Platform

[![CI Pipeline](https://github.com/Prachiahlawat-30/AI-Shopping-RAG/actions/workflows/ci.yml/badge.svg)](https://github.com/Prachiahlawat-30/AI-Shopping-RAG/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Qdrant](https://img.shields.io/badge/Vector_DB-Qdrant-DC2626.svg?logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)

A production-grade, multimodal Retrieval-Augmented Generation (RAG) platform that enables intelligent catalog exploration through computer vision, hybrid semantic retrieval, two-stage relevance re-ranking, and grounded conversational AI.

---

## 🌟 Key Highlights & Resume Value

- **Multimodal Perception Pipeline:** Extracts fine-grained attributes (brand, category, materials, dimensions, features) from multi-angle product photos via GPT Vision and merges them using deterministic **Metadata Fusion**.
- **Hybrid Dense + Sparse Search:** Combines dense vector similarity (`text-embedding-3-small` in Qdrant) with lexical attribute scoring in PostgreSQL using Reciprocal Rank Fusion (RRF).
- **Two-Stage Re-Ranking Engine:** Implements a contextual cross-attribute re-ranker that evaluates semantic affinity, exact keyword matches, user intent alignment, and rating priors to eliminate false positives.
- **Grounded Conversational RAG:** Multi-turn conversational shopping assistant with strict catalog grounding, structured product citation cards, and dynamic follow-up chips.
- **Side-by-Side Product Comparison:** Automated specification matrix extraction and AI-synthesized comparison across multiple catalog items.
- **Zero-Downtime Multi-Tenancy:** Strict user-level tenant isolation across SQL relational models, Qdrant vector payload filters, and Clerk JWKS authentication.
- **Production DevOps:** Containerized with multi-stage Docker builds, Nginx SPA routing, healthcheck probes, Docker Compose orchestration, and automated GitHub Actions CI.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Layer (React 18 + Vite)                │
│   - Visual Search & Filter UI    - Interactive Product Comparison Dock │
│   - Multi-turn AI Chat Assistant - Real-time Metadata Extraction View  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend Engine                          │
│                                                                        │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │   Vision & Fusion Svc   │          │   Retrieval & Rerank Svc    │  │
│  │ - Multi-image analyzer  │          │ - Qdrant Dense Vector Match │  │
│  │ - Schema canonicalizer  │          │ - SQL Keyword / Lexical     │  │
│  │ - Embedding synthesizer │          │ - Two-Stage Score Reranker  │  │
│  └────────────┬────────────┘          └──────────────┬──────────────┘  │
│               │                                      │                 │
│  ┌────────────▼────────────┐          ┌──────────────▼──────────────┐  │
│  │     LLM RAG Service     │          │     Image Storage Svc       │  │
│  │ - Context Assembly      │          │ - Cloudinary / Local Disk   │  │
│  │ - Grounded Generation   │          │ - Thumbnail Generator       │  │
│  └─────────────────────────┘          └─────────────────────────────┘  │
└───────────────┬───────────────────────────────┬────────────────────────┘
                │                               │
                ▼                               ▼
  ┌───────────────────────────┐   ┌───────────────────────────┐
  │   PostgreSQL Relational   │   │   Qdrant Vector Engine    │
  │ - Catalog schema & specs  │   │ - 1536-dim dense vectors  │
  │ - Search analytics & logs │   │ - Multi-tenant payloads   │
  └───────────────────────────┘   └───────────────────────────┘
```

---

## 🔬 Retrieval & Re-ranking Algorithm

The retrieval system employs a two-stage ranking architecture:

1. **Candidate Retrieval (Dense + Sparse):**
   - Fetches top-$K$ candidates via cosine similarity on dense embeddings in Qdrant:
     $$\text{Sim}_{\text{dense}}(\mathbf{q}, \mathbf{d}) = \frac{\mathbf{q} \cdot \mathbf{d}}{\|\mathbf{q}\| \|\mathbf{d}\|}$$
   - Queries SQL lexical indices for keyword matches across brand, category, and specifications.

2. **Stage 2 Relevance Re-ranking:**
   - Evaluates weighted token overlaps on specific fields (brand: 0.35, title: 0.30, category: 0.15, features: 0.10).
   - Computes quality priors from customer review distributions.
   - Blends scores:
     $$\text{Score}_{\text{final}} = \alpha \cdot \text{Score}_{\text{dense}} + (1 - \alpha) \cdot \left(0.8 \cdot \text{Score}_{\text{lexical}} + 0.2 \cdot \text{Score}_{\text{quality}}\right)$$

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 20+
- Docker & Docker Compose (optional for containerized run)

### Option 1: Docker Compose (Full Stack)

```bash
cp .env.example .env
docker-compose up -d --build
```
- Web Application: `http://localhost:80`
- API Documentation (Swagger): `http://localhost:8000/docs`
- Qdrant Dashboard: `http://localhost:6333/dashboard`

### Option 2: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run unit & API test suite (11 tests)
pytest -v

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build   # Typecheck & production build
npm run dev     # Start local dev server at http://localhost:5173
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Service health and database liveness probe | No |
| `POST` | `/upload` | Upload product images, trigger vision analysis & index | Yes |
| `POST` | `/search/text` | Semantic search with metadata filters & reranking | Yes |
| `POST` | `/search/image` | Visual search by uploaded query photo | Yes |
| `POST` | `/search/hybrid` | Multimodal search combining image + text query | Yes |
| `POST` | `/search/compare` | Generate side-by-side spec comparison matrix | Yes |
| `GET` | `/search/similar/{id}` | Retrieve nearest catalog neighbors | Yes |
| `GET` | `/search/suggestions` | Fast autocomplete suggestions | Yes |
| `GET` | `/search/history` | User search history | Yes |
| `GET` | `/search/trending` | Platform-wide trending search queries | No |
| `POST` | `/chat` | Multi-turn RAG chat with grounded catalog citations | Yes |
| `GET` | `/activity` | Unified user activity timeline | Yes |

---

## 🧪 Testing & CI/CD

- **Automated Tests:** Comprehensive unit and integration test suite covering metadata fusion, two-stage reranker calculations, retrieval formatting, and API routes.
  ```bash
  cd backend && pytest -v
  ```
- **CI Pipeline:** GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and PR to validate backend tests on Python 3.10 and verify frontend TypeScript builds.

---

## 📄 License

MIT License. Designed and engineered for high-performance AI shopping applications.