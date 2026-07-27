import { useEffect, useState } from 'react'
import { fetchHistory } from '../api'

export default function HistoryPanel({ onSelect, activeDocumentId, refreshKey }) {
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
      .then((res) => setItems(res.items))
      .catch((err) => setError(err.message))
  }, [refreshKey])

  if (items.length === 0) return null

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-wider text-muted hover:text-ink transition-colors"
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Previously analyzed ({items.length})
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={item.document_id}
              onClick={() => onSelect(item.document_id)}
              className={`text-left font-sans text-sm px-3 py-2 rounded-lg truncate transition-colors
                ${item.document_id === activeDocumentId
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-ink hover:bg-accent-light/50'}`}
            >
              {item.filename}
            </button>
          ))}
        </div>
      )}

      {error && <p className="font-sans text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}
