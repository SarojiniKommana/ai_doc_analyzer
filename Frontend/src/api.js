// Base URL for the backend. In production (single-container setup),
// the frontend is served BY FastAPI, so relative paths work automatically.
// In local dev, Vite runs on a different port than uvicorn, so we point
// at it explicitly via an env var (see .env.example).
const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed.' }))
    throw new Error(err.detail || 'Upload failed.')
  }
  return res.json()
}

/**
 * Streams the analysis for a document. Calls onChunk(text) as each piece
 * arrives, so the caller can render progressively.
 */
export async function streamAnalysis(documentId, onChunk) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed.' }))
    throw new Error(err.detail || 'Analysis failed.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onChunk(chunk, full)
  }

  return full
}

export async function streamQA(documentId, question, onChunk) {
  const res = await fetch(`${API_BASE}/qa`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, question }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Question failed.' }))
    throw new Error(err.detail || 'Question failed.')
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onChunk(chunk, full)
  }

  return full
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`)
  if (!res.ok) throw new Error('Could not load history.')
  return res.json()
}

export async function getDocument(documentId) {
  const res = await fetch(`${API_BASE}/document/${documentId}`)
  if (!res.ok) throw new Error('Could not load that document.')
  return res.json()
}
