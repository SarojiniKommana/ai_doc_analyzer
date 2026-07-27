from datetime import datetime, timezone
from typing import Optional
import uuid


class DocumentStore:
    """Simple in-memory store used for local development.

    Keeps the same public methods used by the rest of the app so nothing
    outside this file needs to change.
    """

    def __init__(self):
        self._docs = {}

    def add(self, filename: str, text: str) -> str:
        doc_id = uuid.uuid4().hex
        now = datetime.now(timezone.utc).isoformat()
        self._docs[doc_id] = {
            "document_id": doc_id,
            "filename": filename,
            "extracted_text": text,
            "uploaded_at": now,
            "analysis": None,
            "qa_history": [],
        }
        return doc_id

    def get(self, doc_id: str) -> Optional[dict]:
        doc = self._docs.get(doc_id)
        if not doc:
            return None
        return {
            "document_id": doc["document_id"],
            "filename": doc["filename"],
            "text": doc["extracted_text"],
            "uploaded_at": doc["uploaded_at"],
            "analysis": doc.get("analysis"),
        }

    def save_analysis(self, doc_id: str, analysis: dict):
        if doc_id in self._docs:
            self._docs[doc_id]["analysis"] = analysis

    def add_qa(self, doc_id: str, question: str, answer: str):
        if doc_id in self._docs:
            self._docs[doc_id]["qa_history"].append({
                "question": question,
                "answer": answer,
            })

    def list_all(self):
        # Return documents ordered by uploaded_at desc
        items = [
            {
                "document_id": d["document_id"],
                "filename": d["filename"],
                "uploaded_at": d["uploaded_at"],
            }
            for d in self._docs.values()
        ]
        return sorted(items, key=lambda x: x["uploaded_at"], reverse=True)


# Single shared instance for the app's lifetime
store = DocumentStore()
