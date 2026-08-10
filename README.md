# AI Shopping RAG

A full-stack, multimodal RAG (Retrieval-Augmented Generation) shopping assistant. Upload product photos, and the system understands them with vision AI, makes them searchable by text or image, and lets you ask natural-language questions grounded in your own product catalog.

## What it does

- **Upload & understand** — upload 1–4 product images. GPT Vision analyzes each one independently; a metadata fusion step merges the results into a single clean product record (brand, category, features, specifications, description).
- **Semantic text search** — type a natural-language query (e.g. "white running shoes") and get back visually/semantically similar products, ranked by relevance, with optional filtering (brand, category, color, material, price range, rating, availability).
- **Visual search** — upload a photo instead of typing. The image is described by GPT Vision, embedded, and searched the same way as a text query, so image search and text search share one retrieval pipeline.
- **RAG-grounded chat** — ask free-form questions about your products. The system retrieves the most relevant products from the vector store, formats them as context, and passes both the question and that context to an LLM — so answers are grounded in your actual catalog rather than hallucinated.
- **Activity history** — a unified feed of your uploads, searches, and chat conversations.
- **Authentication & multi-tenancy** — sign in with email/password or Google. Every user's uploaded products, searches, and chat history are fully isolated from every other user's.

## Architecture

The project is a decoupled frontend/backend, connected to a relational store, a vector store, an object store, an LLM provider, and an auth provider.

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   React     │─────▶│   FastAPI    │─────▶│  PostgreSQL      │  structured product data,
│  (Vite, TS) │◀─────│   Backend    │◀─────│                  │  search history, activity log
└─────────────┘      └──────┬───────┘      └─────────────────┘
      │                     │
      │                     ├──────────────▶ Qdrant            vector embeddings for
      │                     │                (vector DB)       semantic search
      │                     │
      │                     ├──────────────▶ OpenAI             vision analysis (GPT Vision),
      │                     │                                   text embeddings, chat completion
      │                     │
      │                     └──────────────▶ Cloudinary          persistent image storage
      │
      └────────────────────────────────────▶ Clerk               authentication (email/password
                                                                   + Google OAuth), session JWTs
```

**Why Postgres *and* Qdrant?** Postgres is used for structured metadata you filter and sort on (price, category, availability). Qdrant is used purely for semantic similarity search. Each store is used for what it's actually good at, rather than forcing one database to do both jobs.

**Why images are embedded via description, not pixels directly:** GPT Vision converts each image into a rich text description and structured metadata first; *that text* is what gets embedded and searched. This keeps text search and image search on one unified retrieval pipeline, and lets structured metadata (brand, category, specs) inform relevance alongside raw visual similarity.

## Backend structure

```
app/
├── api/            # FastAPI route handlers (upload, search, chat, activity)
├── core/           # config, dependency injection (auth), third-party client setup
├── database/       # SQLAlchemy models, session management
├── repositories/   # data-access layer between routes and the DB
├── schemas/        # Pydantic request/response models
├── services/       # business logic — vision analysis, metadata fusion,
│                   # embeddings, retrieval, LLM orchestration
└── main.py         # app entrypoint, middleware, router registration
```

Routes stay thin and delegate to services; services contain the actual logic and don't know or care which route called them, so (for example) the same retrieval service backs both text search and image search.

## Frontend structure

```
src/
├── api/            # typed HTTP calls to the backend, one file per domain
├── hooks/          # React Query wrappers around the api/ layer
├── context/        # (auth handled via Clerk's own provider)
├── pages/          # route-level page components
├── components/     # presentational components, grouped by feature area
└── types/          # TypeScript interfaces mirroring backend Pydantic schemas
```

## Tech stack

**Backend:** FastAPI, SQLAlchemy, PostgreSQL, Qdrant, OpenAI (GPT Vision + embeddings + chat), Cloudinary, Clerk (JWT verification via JWKS)

**Frontend:** React, TypeScript, Vite, TanStack Query, React Router, Tailwind CSS, Clerk React SDK

## Running locally

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt

# create a .env with:
# OPENAI_API_KEY=
# MODEL_NAME=gpt-5
# DATABASE_URL=postgresql://user:pass@localhost:5432/ai_shopping
# QDRANT_URL=
# QDRANT_API_KEY=
# CLERK_JWKS_URL=
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

python -m app.database.create_tables
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install

# create a .env with:
# VITE_API_URL=http://localhost:8000
# VITE_CLERK_PUBLISHABLE_KEY=

npm run dev
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload` | Upload images, run vision analysis, create a product |
| `POST` | `/search/text` | Semantic text search with optional filters |
| `POST` | `/search/image` | Visual search by uploaded image |
| `GET`  | `/search/similar/{id}` | Products similar to a given product |
| `GET`  | `/search/suggestions` | Autocomplete suggestions |
| `GET`  | `/search/history` | Recent search queries |
| `POST` | `/chat` | Ask a question, answered with RAG-retrieved context |
| `GET`  | `/activity` | Unified upload/search/chat activity feed |

All routes except health checks require a valid Clerk session token.

## Known limitations / next steps

- Search is scoped to each user's own uploaded products — this is a per-user catalog tool, not a general product search engine.
- No automated tests yet; correctness has been verified manually.
- `reranker.py` is scaffolded but not implemented — a second-pass relevance re-ranker is a natural next addition.
- No database migration tool (Alembic) yet — schema changes currently require manual table recreation.
- Chat responses are plain text; returning structured product cards inline is a planned improvement.