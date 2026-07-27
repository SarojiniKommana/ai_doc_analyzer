from dotenv import load_dotenv
load_dotenv()  # must run before importing app.llm / app.store, which read env vars at import time

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from app.extraction import extract_text
from app.store import store
from app.llm import stream_analysis, stream_qa
from app.schemas import UploadResponse, AnalyzeRequest, QARequest, HistoryResponse, HistoryItem, DocumentDetail

app = FastAPI(title="AI Document Analyzer")

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Loosen this to your actual frontend origin before deploying —
# "*" is fine for local dev only.
app.add_middleware(
    CORSMiddleware,
    # During development, allow the Vite dev server origin explicitly so
    # browsers receive the `Access-Control-Allow-Origin` header. If your
    # frontend uses credentials (cookies/auth), set `allow_credentials=True`
    # and specify the exact origin instead of "*".
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    file_bytes = await file.read()
    try:
        text = extract_text(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Couldn't extract any text from this file. It may be a scanned/image-only PDF.",
        )

    doc_id = store.add(file.filename, text)
    return UploadResponse(
        document_id=doc_id,
        filename=file.filename,
        char_count=len(text),
        preview=text[:500],
    )


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    doc = store.get(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found. Upload it first.")

    async def event_generator():
        full_text = ""
        async for chunk in stream_analysis(doc["text"]):
            full_text += chunk
            yield chunk
        # Once the stream finishes, try to save the parsed JSON for history/reuse.
        # If parsing fails, that's fine — the frontend already has the raw text.
        try:
            import json
            parsed = json.loads(full_text)
            store.save_analysis(req.document_id, parsed)
        except Exception:
            pass

    return StreamingResponse(event_generator(), media_type="text/plain")


@app.post("/qa")
async def qa(req: QARequest):
    doc = store.get(req.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found. Upload it first.")

    async def event_generator():
        full_answer = ""
        async for chunk in stream_qa(doc["text"], req.question):
            full_answer += chunk
            yield chunk
        store.add_qa(req.document_id, req.question, full_answer)

    return StreamingResponse(event_generator(), media_type="text/plain")


@app.get("/history", response_model=HistoryResponse)
async def history():
    items = [HistoryItem(**item) for item in store.list_all()]
    return HistoryResponse(items=items)


@app.get("/document/{document_id}", response_model=DocumentDetail)
async def get_document(document_id: str):
    """Fetch a previously uploaded document's saved analysis, if it finished
    and was saved. Used by the history view so clicking a past document
    doesn't re-trigger a fresh (costly, slower) LLM call.
    """
    doc = store.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    return DocumentDetail(
        document_id=doc["document_id"],
        filename=doc["filename"],
        uploaded_at=doc["uploaded_at"],
        analysis=doc["analysis"],
    )


# Serve the built React app (only present after `npm run build` has been run
# and its output copied to backend/static — see the Dockerfile). Mounted last
# so it never shadows the API routes above. In local dev without a build,
# this folder won't exist and is simply skipped.
_static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")

FRONTEND_DIST = "static"

if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
