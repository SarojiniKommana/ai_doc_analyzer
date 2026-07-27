# AI Document Analyzer

An AI-powered tool that helps engineering students and researchers quickly understand technical and research documents. Instead of a generic summary, it produces a structured breakdown, rewrites jargon in plain English, flags prerequisite concepts you should know before reading, and lets you ask questions grounded directly in the document's content.

Built as part of a virtual internship project by a 4-person team.

🔗 **Live demo:** [https://doc-analyzer-app--0000001.agreeablecliff-e77f2d3d.centralindia.azurecontainerapps.io/](https://doc-analyzer-app--0000001.agreeablecliff-e77f2d3d.centralindia.azurecontainerapps.io/)

---

## Table of Contents

- [Why This Exists](#why-this-exists)
- [Core Features](#core-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

---

## Why This Exists

Reading a dense technical paper cold is slow: you have to figure out what problem it's solving, what method it uses, whether the results are convincing, and what background knowledge you're missing — all before you even get to the parts you actually care about.

This tool acts like a study companion that sits between you and the raw paper, giving you an oriented, plain-English entry point into the material.

## Core Features

| Feature | Description |
|---|---|
| **Structured Breakdown** | Parses the document into Problem → Method → Results → Limitations, so you get the shape of the paper before reading it in full. |
| **Plain-English Rewrite** | Identifies technical/domain jargon and rewrites it in simpler terms. |
| **Prerequisite-Concept Detection** | Flags background concepts the reader should know before the paper will make sense. |
| **Document-Grounded Q&A** | Ask questions about the document and get answers grounded in its actual content (not hallucinated), streamed live. |
| **Comparison Mode** *(stretch goal)* | Compare two documents side by side — useful when evaluating competing approaches to the same problem. |

## Architecture

```
┌─────────────┐      HTTPS       ┌──────────────┐      API call      ┌─────────────┐
│   React     │  ─────────────▶  │   FastAPI    │  ────────────────▶ │  Groq API   │
│  Frontend   │  ◀─────────────  │   Backend    │  ◀──────────────── │ (LLM calls) │
└─────────────┘   streamed resp  └──────────────┘    streamed resp   └─────────────┘
```

- The **frontend** (React) provides the UI for uploading documents, viewing the structured breakdown, and chatting with the document.
- The **backend** (FastAPI) handles document parsing, prompt construction, and proxies requests to the LLM provider — keeping the API key server-side at all times.
- The **LLM provider** (Groq, running `llama-3.3-70b-versatile`) performs the actual analysis and answers Q&A queries, with responses streamed back to the client in real time.
- In production, FastAPI serves the built React static files directly, so the whole app runs as a **single container**.

## Tech Stack

- **Frontend:** React
- **Backend:** FastAPI (Python)
- **LLM Provider:** Groq API — `llama-3.3-70b-versatile`
- **Containerization:** Docker (single-container deployment)
- **Hosting:** Azure (Azure for Students subscription), exposed over public HTTPS

## Getting Started

### Prerequisites

- Node.js (for building the frontend)
- Python 3.10+
- A Groq API key ([console.groq.com](https://console.groq.com))
- Docker (for containerized runs)

### Local Development

```bash
# Clone the repo
git clone <repo-url>
cd ai-document-analyzer

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
npm run build   # builds static files served by FastAPI

# Run the backend (serves API + built frontend)
cd ../backend
uvicorn main:app --reload
```

The app will be available at `http://localhost:8000`.

## Environment Variables

Secrets are never hardcoded and are only ever read from environment variables.

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key, used server-side only |
| `PORT` | Port the FastAPI server binds to (default: `8000`) |

Create a `.env` file in the backend directory (make sure it's gitignored):

```bash
GROQ_API_KEY=your_key_here
```

## Running with Docker

The project ships as a single Docker image: FastAPI serves both the API and the built React static files.

```bash
# Build the image
docker build -t doc-analyzer .

# Run the container
docker run -p 8000:8000 --env-file .env doc-analyzer
```

Visit `http://localhost:8000` to use the app.

## API Reference

> Adjust endpoint names/paths below to match your actual FastAPI routes.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Upload a document and receive a structured breakdown (streamed) |
| `POST` | `/api/qa` | Ask a question grounded in a previously analyzed document (streamed) |
| `POST` | `/api/compare` | *(stretch)* Compare two documents |
| `GET` | `/health` | Health check endpoint |

Responses from `/api/analyze` and `/api/qa` are streamed using server-sent events so the frontend can render the LLM's output progressively.

## Deployment

- The single Docker image is deployed to **Azure** (Azure for Students subscription) with a public HTTPS URL.
- All secrets (e.g. `GROQ_API_KEY`) are injected via environment variables at deploy time — never committed to source control.
- FastAPI serves the compiled React build directly, so there's only one service to deploy and monitor.

## Project Structure

```
.
├── backend/
│   ├── main.py            # FastAPI app entrypoint
│   ├── routes/             # API route handlers
│   ├── services/            # LLM integration, document parsing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── Dockerfile
├── .env.example
└── README.md
```

## Roadmap

- [ ] Comparison mode for side-by-side document analysis
- [ ] Support for additional document formats
- [ ] Export structured breakdown as a shareable summary


