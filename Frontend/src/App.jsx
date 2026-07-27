import { useState } from 'react'
import UploadPanel from './components/UploadPanel'
import AnalysisView from './components/AnalysisView'
import Marginalia from './components/Marginalia'
import QAPanel from './components/QAPanel'
import HistoryPanel from './components/HistoryPanel'
import { uploadDocument, streamAnalysis, streamQA, getDocument } from './api'

function App() {
  const [document, setDocument] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const [rawAnalysis, setRawAnalysis] = useState('')
  const [parsedAnalysis, setParsedAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)

  // Bumped after every upload so HistoryPanel refetches the list
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  async function handleUpload(file) {
    setIsUploading(true)
    setUploadError(null)
    setDocument(null)
    setRawAnalysis('')
    setParsedAnalysis(null)
    setAnalysisError(null)

    try {
      const result = await uploadDocument(file)
      setDocument(result)
      await runAnalysis(result.document_id)
      setHistoryRefreshKey((k) => k + 1)
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  async function runAnalysis(documentId) {
    setIsAnalyzing(true)
    setAnalysisError(null)
    setRawAnalysis('')
    setParsedAnalysis(null)

    try {
      const full = await streamAnalysis(documentId, (_chunk, fullSoFar) => {
        setRawAnalysis(fullSoFar)
      })
      try {
        setParsedAnalysis(JSON.parse(full))
      } catch {
        // raw text stays visible if parsing fails
      }
    } catch (err) {
      setAnalysisError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleSelectHistory(documentId) {
    setUploadError(null)
    setAnalysisError(null)

    try {
      const detail = await getDocument(documentId)
      setDocument({ document_id: detail.document_id, filename: detail.filename })

      if (detail.analysis) {
        // Already analyzed before — show it instantly, no LLM call needed
        setRawAnalysis(JSON.stringify(detail.analysis))
        setParsedAnalysis(detail.analysis)
      } else {
        // Uploaded but never finished analyzing — run it now
        await runAnalysis(documentId)
      }
    } catch (err) {
      setAnalysisError(err.message)
    }
  }

  async function handleAsk(question, onUpdate) {
    await streamQA(document.document_id, question, (_chunk, fullSoFar) => {
      onUpdate(fullSoFar)
    })
  }

  const hasResult = document && parsedAnalysis

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round"/>
              <path d="M14 2v6h6" strokeLinejoin="round"/>
              <path d="M9 13h6M9 17h4" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-serif text-xl text-ink leading-tight">Document Analyzer</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!document && !isUploading && (
          <div className="max-w-xl mb-10">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              For engineering students
            </p>
            <h2 className="font-serif text-3xl sm:text-[2.25rem] text-ink leading-[1.15] mb-4">
              Read a paper the way your smartest senior would explain it.
            </h2>
            <p className="font-sans text-[15px] text-muted leading-relaxed">
              Upload a research paper or technical document. Get the problem, the
              method, the results and the limitations in plain English — plus
              what you need to know before you start reading.
            </p>
          </div>
        )}

        <div className="max-w-xl">
          <HistoryPanel
            onSelect={handleSelectHistory}
            activeDocumentId={document?.document_id}
            refreshKey={historyRefreshKey}
          />

          <UploadPanel
            onUpload={handleUpload}
            isUploading={isUploading}
            error={uploadError}
          />
        </div>

        {document && (
          <div className="flex items-center gap-2 mt-4 mb-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round"/>
              <path d="M14 2v6h6" strokeLinejoin="round"/>
            </svg>
            <p className="font-sans text-sm text-muted truncate">{document.filename}</p>
          </div>
        )}

        {analysisError && (
          <p className="font-sans text-sm text-red-600 mt-4">{analysisError}</p>
        )}

        {(rawAnalysis || isAnalyzing) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-8">
            <AnalysisView
              rawText={rawAnalysis}
              parsed={parsedAnalysis}
              isStreaming={isAnalyzing}
            />
            {parsedAnalysis && (
              <Marginalia items={parsedAnalysis.prerequisites} />
            )}
          </div>
        )}

        {hasResult && (
          <div className="mt-6">
            <QAPanel onAsk={handleAsk} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
